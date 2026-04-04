import { useRef, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useMediaPipe } from '../hooks/useMediaPipe';
import {
  StopCircle, Clock, Eye, Mic, MicOff, Phone,
  AlertCircle, Loader2, Camera, Signal,
  Sparkles, Brain, Shield, Video, XCircle,
  ChevronRight, CheckCircle2, MonitorCheck, Users, RotateCcw
} from 'lucide-react';

const VAPI_API_KEY = "62e9c84b-7434-4066-9ec2-b169aaf15b6d";
const VAPI_WORKFLOW_ID = "6fafe19a-c899-4813-a7ec-555a31052c34";

// ─── Interview guidelines steps ───────────────────────────────────────────────
const GUIDELINES = [
  {
    icon: <MonitorCheck className="w-10 h-10 text-blue-400" />,
    title: "Fullscreen & Focus",
    points: [
      "The interview will run in fullscreen mode.",
      "Do NOT switch tabs or minimize the window.",
      "Tab switches are recorded as violations.",
      "Exiting fullscreen will trigger an automatic re-entry.",
    ],
  },
  {
    icon: <Users className="w-10 h-10 text-emerald-400" />,
    title: "Camera & Face Rules",
    points: [
      "Only ONE person should be visible on camera.",
      "Multiple faces detected = violation recorded.",
      "Keep your face centred and well-lit.",
      "Avoid turning your head away from the screen.",
    ],
  },
  {
    icon: <RotateCcw className="w-10 h-10 text-purple-400" />,
    title: "Behaviour & Conduct",
    points: [
      "Speak clearly and at a natural pace.",
      "Maintain eye contact with the camera.",
      "Keep hands visible and steady.",
      "The AI interviewer will guide the conversation.",
    ],
  },
  {
    icon: <CheckCircle2 className="w-10 h-10 text-amber-400" />,
    title: "You're Ready!",
    points: [
      "Your microphone and camera are active.",
      "Click 'Start Interview' to begin.",
      "The timer starts when the call connects.",
      "Click 'End Interview' when you are done.",
    ],
  },
];

// ─── Guidelines Modal ─────────────────────────────────────────────────────────
const GuidelinesModal = ({ onConfirm }) => {
  const [step, setStep] = useState(0);
  const isLast = step === GUIDELINES.length - 1;
  const g = GUIDELINES[step];

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
            style={{ width: `${((step + 1) / GUIDELINES.length) * 100}%` }}
          />
        </div>

        <div className="p-10">
          {/* Step indicator */}
          <div className="flex gap-2 mb-8">
            {GUIDELINES.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-blue-500' : 'bg-white/10'
                  }`}
              />
            ))}
          </div>

          {/* Icon + title */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              {g.icon}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-1">
                Step {step + 1} of {GUIDELINES.length}
              </p>
              <h3 className="text-2xl font-black text-white">{g.title}</h3>
            </div>
          </div>

          {/* Points */}
          <ul className="space-y-3 mb-10">
            {g.points.map((pt, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm text-white/70 leading-relaxed">{pt}</span>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 font-bold hover:bg-white/10 transition-all"
              >
                Back
              </button>
            )}
            <button
              onClick={() => {
                // Call requestFullscreen SYNCHRONOUSLY here — this IS the user gesture
                try {
                  const el = document.documentElement;
                  if (el.requestFullscreen) el.requestFullscreen();
                  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
                  else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
                } catch (_) { }
                isLast ? onConfirm() : setStep(s => s + 1);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black transition-all"
            >
              {isLast ? 'Start Interview' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const InterviewSession = ({ sessionId, resumeText, onEnd }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const vapiRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const containerRef = useRef(null);
  const timerRef = useRef(null);   // accurate interval ref
  const startTimeRef = useRef(null);   // Date.now() when call went active

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [callStatus, setCallStatus] = useState("idle");
  const [vapiReady, setVapiReady] = useState(false);
  const [vapiError, setVapiError] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [vapiAnalysis, setVapiAnalysis] = useState(null);
  const [isGracePeriod, setIsGracePeriod] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const [fullscreenLost, setFullscreenLost] = useState(false);
  const [multiFaceWarn, setMultiFaceWarn] = useState(false);
  const [headTurnWarn, setHeadTurnWarn] = useState(false);

  const detection = useMediaPipe(videoRef, canvasRef);

  // Sync detection warnings
  useEffect(() => { setMultiFaceWarn(detection.faceCount > 1); }, [detection.faceCount]);
  useEffect(() => {
    if (callStatus !== 'active') return;
    setHeadTurnWarn(detection.headTurn);
  }, [detection.headTurn, callStatus]);

  // ── Accurate timer using Date.now() ──────────────────────────────────────
  useEffect(() => {
    if (callStatus === 'active') {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 500); // poll every 500ms for accuracy
    } else {
      clearInterval(timerRef.current);
      if (callStatus === 'idle') setElapsedSeconds(0);
    }
    return () => clearInterval(timerRef.current);
  }, [callStatus]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  // ── Vapi SDK ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    import("https://esm.sh/@vapi-ai/web@2.5.2").then((module) => {
      if (cancelled) return;
      try {
        const VapiClass = module.default ?? module.Vapi ?? module;
        const vapi = new VapiClass(VAPI_API_KEY);
        vapiRef.current = vapi;

        vapi.on("call-start", () => {
          setCallStatus("active");
          setIsInitializing(false);
          setVapiError("");
        });
        vapi.on("call-end", () => setCallStatus("ended"));
        vapi.on("error", (e) => {
          let msg = "Connection error occurred";
          if (typeof e === 'string') msg = e;
          else if (e?.message) msg = e.message;
          if (msg.includes("Unauthorized") || msg.includes("401"))
            msg = "Invalid API Key. Please verify your Vapi Public Key.";
          setVapiError(msg);
          setCallStatus("idle");
          setIsInitializing(false);
        });
        vapi.on("speech-start", () => setIsAISpeaking(true));
        vapi.on("speech-end", () => setIsAISpeaking(false));
        vapi.on("message", (msg) => {
          if (msg?.type === "transcript") {
            const role = msg.role === "assistant" ? "AI" : "You";
            const isFinal = msg.transcriptType === "final";
            setTranscript(prev => {
              const last = prev[prev.length - 1];
              if (last && last.role === role && !last.final)
                return [...prev.slice(0, -1), { role, text: msg.transcript, final: isFinal }];
              return [...prev, { role, text: msg.transcript, final: isFinal }];
            });
          }
          if (msg?.analysis || msg?.summary) {
            const d = msg.analysis || msg.summary;
            setVapiAnalysis({
              summary: d.summary || null,
              structuredData: {
                keyPoints: d.keyPoints || [],
                strengths: d.strengths || [],
                improvements: d.improvements || [],
              },
            });
          }
        });
        setVapiReady(true);
        setIsInitializing(false);
      } catch (e) {
        setVapiError("SDK Initialization Failed: " + e.message);
        setIsInitializing(false);
      }
    }).catch(() => {
      setVapiError("Failed to load Vapi SDK");
      setIsInitializing(false);
    });
    return () => { cancelled = true; vapiRef.current?.stop(); };
  }, []);

  // ── Grace period ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (callStatus === 'active' || callStatus === 'connecting') {
      setIsGracePeriod(true);
      const t = setTimeout(() => setIsGracePeriod(false), 15000);
      return () => clearTimeout(t);
    }
  }, [callStatus]);

  // ── Fullscreen ────────────────────────────────────────────────────────────
  const enterFullscreen = useCallback(async () => {
    const el = document.documentElement;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      else if (el.mozRequestFullScreen) await el.mozRequestFullScreen();
    } catch (e) { console.warn('[FS]', e); }
  }, []);

  const exitFullscreen = useCallback(() => {
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
      }
    } catch (e) { console.warn('[FS]', e); }
  }, []);

  useEffect(() => {
    if (callStatus === 'ended' || callStatus === 'ending') exitFullscreen();
  }, [callStatus, exitFullscreen]);

  useEffect(() => {
    const handler = () => {
      const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
      if (!isFs && callStatus === 'active' && !isGracePeriod) {
        setFullscreenLost(true);
        setTimeout(() => { enterFullscreen(); setFullscreenLost(false); }, 3000);
      }
    };
    document.addEventListener('fullscreenchange', handler);
    document.addEventListener('webkitfullscreenchange', handler);
    return () => {
      document.removeEventListener('fullscreenchange', handler);
      document.removeEventListener('webkitfullscreenchange', handler);
    };
  }, [callStatus, isGracePeriod, enterFullscreen]);

  // ── Tab switch detection ──────────────────────────────────────────────────
  useEffect(() => {
    if (callStatus !== 'active') return;
    const onHide = () => {
      if (document.hidden) {
        setTabSwitchCount(n => n + 1);
        setShowTabWarning(true);
        setTimeout(() => setShowTabWarning(false), 5000);
        axios.post('http://localhost:5000/api/session/update', {
          sessionId, metrics: { tabSwitch: 1 }
        }).catch(console.error);
      }
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [callStatus, sessionId]);

  // ── Telemetry ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (callStatus !== 'active') return;
    const interval = setInterval(() => {
      const tickMetrics = {
        eyeContactTicks: detection.eyeContact ? 1 : 0,
        totalTicks: 1,
        headMovementCount: detection.headMovement ? 1 : 0,
        faceLostCount: !detection.facePresent ? 1 : 0,
        handMovementCount: detection.handMovement ? 1 : 0,
        blinkCount: detection.blinkDetected ? 1 : 0,
        confidence: detection.confidence,
        engagement: detection.engagement,
      };
      axios.post('http://localhost:5000/api/session/update', { sessionId, metrics: tickMetrics })
        .catch(console.error);
    }, 1000);
    return () => clearInterval(interval);
  }, [detection, sessionId, callStatus]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // ── Call controls ─────────────────────────────────────────────────────────
  const startCall = useCallback(async () => {
    if (!vapiRef.current || callStatus === "connecting" || callStatus === "active") return;
    setCallStatus("connecting");
    setVapiError("");
    // Fullscreen is triggered synchronously in the button click (GuidelinesModal)
    // so we don't call it here to avoid breaking the gesture requirement

    try {
      let res;
      if (resumeText) {
        // --- DYNAMIC RESUME-BASED ASSISTANT ---
        const dynamicAssistant = {
            name: "Expert Technical Interviewer",
            firstMessage: "Hello! I have thoroughly reviewed your resume and I'm very excited to speak with you today. Are you ready to begin our interview?",
            model: {
                provider: "openai",
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: `You are an expert HR and Technical Interviewer conducting a professional interview.

Here is the extracted resume text from the candidate:
=== RESUME START ===
${resumeText}
=== RESUME END ===

YOUR STRICT INSTRUCTIONS:
1. Silently analyze the resume to understand the candidate's exact skills, projects, and work experience.
2. Generate 2 highly specific technical or role-based questions based *directly* on what is written in their resume. 
3. Generate 2 behavioral/HR questions analyzing their teamwork, constraints, or problem-solving.
4. Always ask exactly ONE question at a time. DO NOT ask multiple questions at once.
5. Wait patiently for the candidate to answer. 
6. Provide a brief, professional follow-up to their answer, then seamlessly transition to your next prepared question.
7. Once all 4 questions have been answered, conclude the interview gracefully.`
                    }
                ]
            },
            voice: {
                provider: "11labs",
                voiceId: "bIHbv24MWmeRgasZH58o" // Professional voice
            }
        };
        console.log("[Vapi] Starting Dynamic Resume Assistant...");
        res = await vapiRef.current.start(dynamicAssistant);
      } else {
        // --- GENERAL SETUP (WORKFLOW-BASED) ---
        console.log("[Vapi] Starting General Workflow...");
        try { res = await vapiRef.current.start(null, null, null, VAPI_WORKFLOW_ID); }
        catch (_) {
          try { res = await vapiRef.current.start(VAPI_WORKFLOW_ID); }
          catch { res = await vapiRef.current.start({ workflowId: VAPI_WORKFLOW_ID }); }
        }
      }
      console.log("[Vapi] Started:", res);
    } catch (e) {
      setVapiError(e?.message || "Failed to start call");
      setCallStatus("idle");
    }
  }, [callStatus, resumeText]);

  const toggleMute = useCallback(() => {
    if (!vapiRef.current) return;
    const next = !isMuted;
    vapiRef.current.setMuted(next);
    setIsMuted(next);
  }, [isMuted]);

  const handleEnd = async () => {
    vapiRef.current?.stop();
    setCallStatus("ending");
    try {
      if (!vapiAnalysis) await new Promise(r => setTimeout(r, 2000));
      const finalAnalysis = vapiAnalysis || {
        summary: null,
        structuredData: { keyPoints: [], strengths: [], improvements: [] },
      };
      const response = await axios.post('http://localhost:5000/api/session/end', {
        sessionId, vapiAnalysis: finalAnalysis, transcript,
      });
      onEnd({ ...response.data.evaluation, vapiAnalysis: finalAnalysis, transcript });
    } catch (err) {
      console.error('[Session] End error:', err);
      alert('Error finalizing session');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Guidelines modal — shown before starting */}
      {showGuidelines && (
        <GuidelinesModal onConfirm={() => { setShowGuidelines(false); startCall(); }} />
      )}

      <div
        ref={containerRef}
        className="fixed inset-0 flex bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden z-50"
      >
        {/* ── LEFT: VIDEO ── */}
        <div className="w-1/2 relative bg-black flex items-center justify-center overflow-hidden border-r border-white/5">
          <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" autoPlay playsInline muted />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full scale-x-[-1] pointer-events-none" width={640} height={480} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none" />

          {/* Status bar */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-full border border-white/10">
              <div className={`w-2 h-2 rounded-full ${detection.facePresent ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
              <Camera size={14} className="text-white/60" />
              <span className="text-xs font-bold text-white/80">
                {detection.facePresent ? 'Face Detected' : 'Searching...'}
              </span>
            </div>
            {callStatus === 'active' && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 backdrop-blur-xl rounded-full border border-red-500/30">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-bold text-red-400">LIVE</span>
              </div>
            )}
          </div>

          {/* Behaviour metrics */}
          <div className="absolute bottom-6 left-6 right-6 grid grid-cols-3 gap-3 z-10">
            <MetricPill icon={<Eye size={14} />} label="Eye Contact" active={detection.eyeContact} />
            <MetricPill icon={<Signal size={14} />} label="Posture" active={!detection.headMovement} />
            <MetricPill icon={<Brain size={14} />} label="Engagement" active={detection.engagement > 50} />
          </div>

          {/* Welcome overlay */}
          {callStatus === 'idle' && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-md flex flex-col items-center justify-center z-20">
              <div className="text-center space-y-4 p-8">
                <div className="w-20 h-20 mx-auto bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                  <Video className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Camera Ready</h3>
                <p className="text-white/60 text-sm max-w-xs">Position yourself in the frame, then click Start Interview</p>
              </div>
            </div>
          )}

          {/* Multi-face warning */}
          {multiFaceWarn && (
            <div className="absolute inset-0 z-30 pointer-events-none">
              <div className="absolute inset-0 border-4 border-red-500 animate-pulse" />
              <div className="absolute top-20 left-4 right-4 bg-red-600/95 backdrop-blur-xl rounded-2xl px-5 py-4 flex items-center gap-3 shadow-2xl pointer-events-auto">
                <AlertCircle className="w-6 h-6 text-white shrink-0" />
                <div>
                  <p className="text-sm font-black text-white">Multiple Faces Detected!</p>
                  <p className="text-xs text-red-200">Only ONE person is allowed during the interview.</p>
                </div>
              </div>
            </div>
          )}

          {/* Head turn warning */}
          {headTurnWarn && callStatus === 'active' && (
            <div className="absolute bottom-28 left-4 right-4 z-30 bg-amber-500/90 backdrop-blur-xl rounded-2xl px-5 py-3 flex items-center gap-3 shadow-xl">
              <AlertCircle className="w-5 h-5 text-white shrink-0" />
              <p className="text-sm font-black text-white">Please focus on the screen!</p>
            </div>
          )}
        </div>

        {/* ── RIGHT: CONVERSATION ── */}
        <div className="w-1/2 flex flex-col relative">
          {/* Header with accurate timer */}
          <div className="p-5 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold">AI Interview Assistant</h2>
                  <p className="text-xs text-white/40">Professional Interview Simulation</p>
                </div>
              </div>
              {/* Timer — top-right, always visible during active call */}
              <div className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border font-mono font-black text-xl transition-all ${callStatus === 'active'
                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                : 'bg-white/5 border-white/10 text-white/60'
                }`}>
                <Clock className="w-4 h-4" />
                {formatTime(elapsedSeconds)}
              </div>
            </div>
          </div>

          {/* Transcript */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
            {transcript.length === 0 ? (
              <div className="h-full flex items-center justify-center opacity-30">
                <div className="text-center space-y-3">
                  <Sparkles className="w-8 h-8 mx-auto" />
                  <p className="text-sm font-medium">Waiting for conversation to begin...</p>
                </div>
              </div>
            ) : (
              <>
                {transcript.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'You' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${msg.role === 'AI'
                      ? 'bg-blue-500/10 border border-blue-500/20'
                      : 'bg-white/5 border border-white/10'
                      }`}>
                      <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${msg.role === 'AI' ? 'text-blue-400' : 'text-emerald-400'
                        }`}>
                        {msg.role === 'AI' ? '🤖 AI Interviewer' : '👤 You'}
                      </span>
                      {!msg.final && (
                        <div className="flex gap-1 mb-1">
                          {[0, 150, 300].map(d => (
                            <div key={d} className="w-1 h-1 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-white/90 leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={transcriptEndRef} />
              </>
            )}
          </div>

          {/* AI speaking indicator */}
          {isAISpeaking && (
            <div className="mx-6 mb-3 px-4 py-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3">
              {[0, 150, 300].map(d => (
                <div key={d} className="w-1 h-5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: `${d}ms` }} />
              ))}
              <span className="text-xs font-bold text-blue-400">AI is speaking...</span>
            </div>
          )}

          {/* Controls */}
          <div className="p-5 bg-slate-900/80 backdrop-blur-xl border-t border-white/5">
            {callStatus !== 'active' ? (
              <>
                <button
                  onClick={() => setShowGuidelines(true)}
                  disabled={!vapiReady || callStatus === 'connecting' || !detection.facePresent}
                  className="group w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 disabled:scale-100 flex items-center justify-center gap-3"
                >
                  {callStatus === 'connecting' ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Connecting...</>
                  ) : !detection.facePresent ? (
                    <><Camera className="w-5 h-5 group-hover:scale-110 transition-transform" /> Position Face to Start</>
                  ) : (
                    <><Phone className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" /> Start Interview</>
                  )}
                </button>
                {!detection.facePresent && callStatus === 'idle' && (
                  <p className="mt-2 text-xs text-amber-400 flex items-center gap-1">
                    <AlertCircle size={12} /> Ensure your face is visible in the camera
                  </p>
                )}
              </>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={toggleMute}
                  className={`group w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 ${isMuted ? 'bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30' : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                    }`}
                >
                  {isMuted ? <MicOff size={20} className="group-hover:scale-110 transition-transform" /> : <Mic size={20} className="group-hover:scale-110 transition-transform" />}
                </button>
                <button
                  onClick={handleEnd}
                  className="group flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/50"
                >
                  <StopCircle size={18} className="group-hover:scale-110 transition-transform" /> End Interview
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Overlays ── */}
        {(isInitializing || vapiError) && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-8">
            <div className="max-w-md text-center space-y-6">
              {vapiError ? (
                <>
                  <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold">Connection Error</h3>
                  <p className="text-white/60">{vapiError}</p>
                  <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white text-black font-bold rounded-xl">Retry</button>
                </>
              ) : (
                <>
                  <Loader2 className="w-16 h-16 mx-auto animate-spin text-blue-500" />
                  <h3 className="text-xl font-bold">Initializing AI System...</h3>
                </>
              )}
            </div>
          </div>
        )}

        {isGracePeriod && callStatus === 'active' && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 px-5 py-2.5 bg-amber-500/20 backdrop-blur-xl rounded-full border border-amber-500/30 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-400">Security monitoring initializing...</span>
          </div>
        )}

        {showTabWarning && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-4 bg-red-500/30 backdrop-blur-xl rounded-2xl border border-red-500/50 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <p className="text-sm font-black text-red-300">Tab Switch Detected!</p>
              <p className="text-xs text-red-400/80">Violation #{tabSwitchCount} recorded.</p>
            </div>
          </div>
        )}

        {fullscreenLost && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center">
            <div className="text-center space-y-4 p-8">
              <AlertCircle className="w-12 h-12 mx-auto text-red-400" />
              <h3 className="text-2xl font-black text-white">Fullscreen Required</h3>
              <p className="text-white/60">Returning to fullscreen in a moment...</p>
            </div>
          </div>
        )}

        {callStatus === 'active' && tabSwitchCount > 0 && (
          <div className="absolute bottom-24 right-5 z-30 px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs font-bold text-red-400">{tabSwitchCount} violation{tabSwitchCount > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>
    </>
  );
};

const MetricPill = ({ icon, label, active }) => (
  <div className={`group px-3 py-2 rounded-xl backdrop-blur-xl transition-all duration-300 hover:scale-105 cursor-pointer ${active ? 'bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30' : 'bg-black/40 border border-white/10 hover:bg-black/60'
    }`}>
    <div className="flex items-center gap-1.5 mb-0.5">
      <div className={`transition-all duration-300 ${active ? 'text-emerald-400 group-hover:scale-110' : 'text-white/30'}`}>{icon}</div>
      <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${active ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
    </div>
    <p className={`text-[10px] font-bold transition-colors ${active ? 'text-white' : 'text-white/30'}`}>{label}</p>
  </div>
);

export default InterviewSession;
