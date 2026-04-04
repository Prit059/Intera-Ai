import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LuClock3,
  LuShieldAlert,
  LuEye,
  LuChevronLeft,
  LuChevronRight,
} from "react-icons/lu";
import { FaCheckCircle } from "react-icons/fa";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);
const fmt = (sec) => `${pad2(Math.floor(sec / 60))}:${pad2(sec % 60)}`;

const MAX_VIOLATIONS = 3;

const QuizPlayer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const questions = location.state?.questions || [];
  const topic = location.state?.topic || "Unknown";
  const level = location.state?.level || "easy";
  const quizId = location.state?.quizId;
  const timeLimit = location.state?.timeLimit || Math.max(10, questions.length);
  
  const durationMin = typeof timeLimit === "number" ? timeLimit : Math.max(10, questions.length);

  // --- guards
  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0c1022] via-[#0a0f1e] to-[#080d1a]">
        <div className="bg-white/90 rounded-2xl shadow-2xl p-8 text-center">
          <p className="text-red-600 text-lg mb-4">
            ❌ No quiz data found. Please start a quiz.
          </p>
          <button
            className="bg-blue-500 text-white px-6 py-2 rounded font-semibold shadow hover:bg-blue-600 transition"
            onClick={() => navigate("/quiz")}
          >
            Go to Quiz Starter
          </button>
        </div>
      </div>
    );
  }

  // --- state
  const [current, setCurrent] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeSpent, setTimeSpent] = useState(Array(questions.length).fill(0));
  const [visited, setVisited] = useState(() => new Set([0]));
  const [secondsLeft, setSecondsLeft] = useState(durationMin * 60);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [results, setResults] = useState(null);
  const [violations, setViolations] = useState(0);
  const [warn, setWarn] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const quizRef = useRef(null);
  const timeIntervalRef = useRef(null);

  // --- Track time spent per question
  useEffect(() => {
    const startTime = Date.now();
    const questionIndex = current;

    return () => {
      const endTime = Date.now();
      const timeSpentOnQuestion = Math.round((endTime - startTime) / 1000);
      
      setTimeSpent(prev => {
        const newTimeSpent = [...prev];
        newTimeSpent[questionIndex] += timeSpentOnQuestion;
        return newTimeSpent;
      });
    };
  }, [current]);

  // --- derived
  const attemptedCount = useMemo(
    () => Object.keys(userAnswers).length,
    [userAnswers]
  );

  // --- Anti-cheat hooks
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) bumpViolation("Tab switched / minimized");
    };
    const onBlur = () => bumpViolation("Window out of focus");
    const onContext = (e) => e.preventDefault();
    const onKeyDown = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        ["c", "x", "v", "a", "s", "p", "u"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        setWarn("Copy/Cut/Paste/Print are disabled during the quiz.");
      }
      if (
        e.keyCode === 123 ||
        (e.ctrlKey && e.shiftKey && ["I", "J"].includes(e.key.toUpperCase()))
      ) {
        e.preventDefault();
        setWarn("DevTools are restricted during the quiz.");
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("contextmenu", onContext);
    window.addEventListener("keydown", onKeyDown);

    const beforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);

    // attempt fullscreen (best-effort)
    const reqFs = () => {
      const el = quizRef.current;
      if (!el) return;
      const anyEl = el;
      const req =
        anyEl.requestFullscreen ||
        anyEl.webkitRequestFullscreen ||
        anyEl.msRequestFullscreen;
      if (req) {
        try {
          req.call(anyEl);
        } catch {}
      }
    };
    reqFs();

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("contextmenu", onContext);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("beforeunload", beforeUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bumpViolation = (why) => {
    setViolations((v) => {
      const nv = v + 1;
      setWarn(`${why}. Warning ${nv}/${MAX_VIOLATIONS}.`);
      if (nv >= MAX_VIOLATIONS) {
        handleSubmit(true, nv);
      }
      return nv;
    });
  };

  // --- timer
  useEffect(() => {
    if (showCompleteModal) return;
    if (secondsLeft <= 0) {
      handleSubmit(true);
      return;
    }
    
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, showCompleteModal]);

  // --- handlers
  const markVisited = (idx) =>
    setVisited((prev) => (prev.has(idx) ? prev : new Set(prev).add(idx)));

  const goto = (idx) => {
    if (idx < 0 || idx >= questions.length) return;
    setCurrent(idx);
    markVisited(idx);
    const el = document.getElementById("question-root");
    if (el) el.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectOption = (qIndex, opt) => {
    setUserAnswers((prev) => ({ ...prev, [qIndex]: opt }));
  };

  // NEW: Submit to backend API
// Inside QuizPlayer

const handleSubmit = async (auto = false, finalViolations = violations) => {
  if (submitted) return;
  setSubmitted(true);
  setLoading(true);

  const submissionData = {
    quizId: quizId,
    userAnswers: questions.map((_, i) => ({
      questionIndex: i,
      selectedAnswer: userAnswers[i] || '',
      timeSpent: timeSpent[i] || 0
    })),
    timeSpent,
    violations: finalViolations,
  };

  try {
    if (quizId) {
      const response = await axiosInstance.post(API_PATHS.QUIZ.SUBMIT, submissionData);
      console.log("Quiz submitted successfully:", quizId);
      
      // Navigate to result page with quizId in URL
      navigate(`/quiz-result/${quizId}`, {
        state: response.data
      });
    } else {
      throw new Error("No quizId found");
    }
  } catch (err) {
    console.warn("Submission failed, using local results:", err);

    const fallbackResults = calculateLocalResults(auto, finalViolations);
    const tempId = Date.now().toString();
    
    // Save to localStorage for fallback
    const record = {
      id: tempId,
      date: new Date().toLocaleString(),
      topic,
      level,
      score: fallbackResults.score,
      total: questions.length,
      durationMin,
      violations: finalViolations,
      results: fallbackResults.detailedResults,
      finishedBy: auto ? "auto" : "user",
    };
    
    const existingHistory = JSON.parse(localStorage.getItem("quizHistory") || "[]");
    localStorage.setItem("quizHistory", JSON.stringify([record, ...existingHistory]));
    
    // Navigate with temp ID
    navigate(`/quiz-result/${tempId}`, {
      state: { 
        ...fallbackResults, 
        topic, 
        level, 
        date: new Date().toLocaleString(),
        isFallback: true 
      },
    });
  } finally {
    setLoading(false);
  }
};

  // Local results calculation (fallback)
  const calculateLocalResults = (auto = false, finalViolations = violations) => {
    let score = 0;
    const detailedResults = questions.map((q, i) => {
      const selected = userAnswers[i] || "";
      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) score++;
      
      return {
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: selected,
        isCorrect,
        explanation: q.explanation || "Explanation not available",
        subtopic: q.subtopic || "General",
        difficulty: q.difficulty || level
      };
    });

    // Basic performance analysis
    const performance = {
      weakTopics: [],
      strongTopics: [],
      averageTimePerQuestion: timeSpent.reduce((a, b) => a + b, 0) / timeSpent.length,
      accuracy: (score / questions.length) * 100
    };

    return {
      score,
      totalQuestions: questions.length,
      detailedResults,
      performance,
      recommendations: [
        {
          type: 'info',
          message: 'Results calculated locally. Some features may be limited.',
          priority: 'low'
        }
      ]
    };
  };

  // --- palette status color
  const statusClass = (i) => {
    if (userAnswers[i]) return "bg-blue-500 text-white";
    if (visited.has(i)) return "bg-green-500 text-white";
    return "bg-gray-700 text-gray-300";
  };

  return (
    <div
      ref={quizRef}
      className="min-h-screen select-none bg-gradient-to-br from-[#0b1226] via-[#0a1020] to-[#090e1b] text-white"
    >
      {/* Top bar */}
      <div className="sticky top-0 z-40 backdrop-blur-md bg-black/30 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-sm text-white/70">
              <span className="font-semibold">{topic}</span> • Level:{" "}
              <span className="uppercase">{level}</span>
            </div>
            {warn && (
              <div className="ml-3 flex items-center gap-2 text-amber-300 text-xs bg-amber-500/10 border border-amber-400/30 px-2 py-1 rounded">
                <LuShieldAlert /> {warn}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <LuClock3 className="opacity-80" />
            <span
              className={`font-semibold px-2 py-1 rounded ${
                secondsLeft <= 30 ? "bg-red-600/30" : "bg-white/10"
              }`}
              title="Time Remaining"
            >
              {fmt(secondsLeft)}
            </span>
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className={`ml-3 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 px-4 py-1.5 rounded-lg text-white font-semibold shadow transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>

      {/* Main layout - REST OF THE UI REMAINS THE SAME */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        {/* Left: Question area */}
        <div
          id="question-root"
          className="col-span-12 lg:col-span-8 bg-white/5 rounded-2xl border border-white/10 shadow-lg p-5"
        >
          <div className="mb-2 text-sm text-white/60">
            Question {current + 1} / {questions.length}
          </div>

          <h2 className="text-xl md:text-2xl font-bold leading-snug mb-5">
            {questions[current].question}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {questions[current].options.map((opt, j) => {
              const isSelected = userAnswers[current] === opt;
              return (
                <button
                  key={j}
                  onClick={() => selectOption(current, opt)}
                  className={`text-left border rounded-xl px-4 py-3 font-medium transition
                    ${
                      isSelected
                        ? "bg-blue-500/20 border-blue-400 shadow-inner"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Nav buttons */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => goto(current - 1)}
              disabled={current === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition
                ${current === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <LuChevronLeft /> Prev
            </button>

            <div className="text-sm text-white/60">
              Attempted: {attemptedCount} / {questions.length}
            </div>

            <button
              onClick={() => goto(current + 1)}
              disabled={current === questions.length - 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition
                ${
                  current === questions.length - 1
                    ? "opacity-40 cursor-not-allowed"
                    : ""
                }`}
            >
              Next <LuChevronRight />
            </button>
          </div>

          {/* Seen marker */}
          <div className="mt-3 flex items-center gap-2 text-xs text-white/60">
            <LuEye className="opacity-80" />
            <span>Blue = Attempted, Green = Seen (not attempted)</span>
          </div>
        </div>

        {/* Right: Instructions + Palette */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Instructions */}
          <div className="bg-white/5 rounded-2xl border border-white/10 shadow p-4">
            <h3 className="text-lg font-semibold mb-2">📝 Instructions</h3>
            <ul className="list-disc list-inside text-sm text-white/80 space-y-1">
              <li>Do not switch tabs or minimize the window.</li>
              <li>Right-click, copy/paste & print are disabled.</li>
              <li>The quiz will auto-submit after {MAX_VIOLATIONS} violations.</li>
              <li>Time left is shown at the top right corner.</li>
              <li>Use the palette to jump between questions.</li>
              <li>Blue = answered, Green = seen, Gray = not visited.</li>
            </ul>
          </div>

          {/* Palette */}
          <div className="bg-white/5 rounded-2xl border border-white/10 shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Question Palette</h3>
              <div className="text-xs text-white/70 flex items-center gap-2">
                <span className="inline-flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
                  Attempted
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-green-500 inline-block" />
                  Seen
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-gray-600 inline-block" />
                  Not visited
                </span>
              </div>
            </div>

            <div className="grid grid-cols-8 gap-2">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goto(i)}
                  className={`h-9 rounded-lg text-sm font-semibold border border-white/10 transition ${statusClass(
                    i
                  )} ${i === current ? "ring-2 ring-white/60" : ""}`}
                  title={`Question ${i + 1}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <div className="mt-4 text-xs text-white/70 flex items-center gap-2">
              <FaCheckCircle className="opacity-80" />
              Violations: {violations}/{MAX_VIOLATIONS}
            </div>
          </div>
        </div>
      </div>

      {/* Fallback Result Modal - Only shows if API and navigation fail */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
            <h3 className="text-2xl font-bold mb-2 text-blue-600">
              🎉 Quiz Completed!
            </h3>
            <p className="mb-1 text-lg">
              Your score:{" "}
              <span className="font-bold">
                {results?.score} / {results?.totalQuestions}
              </span>
            </p>
            <p className="mb-1 text-sm text-gray-600">
              Accuracy: {results?.performance?.accuracy?.toFixed(1)}%
            </p>
            <button
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
              onClick={() => {
                setShowCompleteModal(false);
                navigate("/main-quiz");
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPlayer;