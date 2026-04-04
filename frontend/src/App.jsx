import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import InterviewSession from './components/InterviewSession';
import ResultsDashboard from './components/ResultsDashboard';

function App() {
  const [stage, setStage] = useState('landing'); // landing, interview, results
  const [sessionId, setSessionId] = useState(null);
  const [resumeText, setResumeText] = useState(null);
  const [results, setResults] = useState(null);

  const startInterview = (id, text = null) => {
    setSessionId(id);
    setResumeText(text);
    setStage('interview');
  };

  const endInterview = (data) => {
    setResults(data);
    setStage('results');
  };

  const reset = () => {
    setStage('landing');
    setSessionId(null);
    setResumeText(null);
    setResults(null);
  };

  // During interview, render fullscreen without header/footer
  if (stage === 'interview') {
    return (
      <InterviewSession sessionId={sessionId} resumeText={resumeText} onEnd={endInterview} />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-900 border-b border-slate-700 p-4">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          AI Interview Proctor
        </h1>
      </header>
      
      <main className="flex-grow">
        {stage === 'landing' && <LandingPage onStart={startInterview} />}
        {stage === 'results' && <ResultsDashboard results={results} onReset={reset} />}
      </main>
      
      <footer className="bg-slate-900 border-t border-slate-700 p-4 text-center text-slate-500 text-sm">
        &copy; 2026 AI Interview Proctoring System - Built with MediaPipe & React
      </footer>
    </div>
  );
}

export default App;
