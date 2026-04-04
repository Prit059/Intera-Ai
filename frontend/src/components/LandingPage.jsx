import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Play, ShieldCheck, BarChart3, Video, Brain, 
  Sparkles, CheckCircle, ArrowRight, Zap, Target,
  MessageSquare, TrendingUp, Award, Lock,
  Clock, FileText
} from 'lucide-react';

const LandingPage = ({ onStart }) => {
  const [loading,       setLoading]       = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [selectedFile,  setSelectedFile]  = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [sessions,      setSessions]      = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Fetch past sessions from DB
  useEffect(() => {
    axios.get('http://localhost:5000/api/sessions')
      .then(r => setSessions(r.data.filter(s => !s.isActive && s.evaluation)))
      .catch(() => setSessions([]))
      .finally(() => setSessionsLoading(false));
  }, []);

  const handleStartSession = async () => {
    if (selectedFile) {
      setLoading(true);
      setUploadingResume(true);
      try {
        const formData = new FormData();
        formData.append('resume', selectedFile);
        
        const uploadRes = await axios.post('http://localhost:5000/api/upload-resume', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const resumeText = uploadRes.data.text;
        
        const response = await axios.post('http://localhost:5000/api/session/start');
        onStart(response.data.sessionId, resumeText);
      } catch (error) {
        console.error('Failed to start resume session', error);
        alert('Error processing resume: ' + (error.response?.data?.error || error.message));
        setLoading(false);
        setUploadingResume(false);
      }
    } else {
      setLoading(true);
      try {
        const response = await axios.post('http://localhost:5000/api/session/start');
        onStart(response.data.sessionId, null);
      } catch (error) {
        console.error('Failed to start session', error);
        alert('Could not connect to backend server. Please ensure it is running on port 5000.');
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden relative">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.15), transparent 50%)`
        }}
      />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-20 space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full animate-in fade-in slide-in-from-top duration-700">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Next-Generation AI Interview Platform
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-7xl md:text-8xl font-black tracking-tight leading-[0.9] animate-in fade-in slide-in-from-bottom duration-700 delay-100">
            Master Your
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Interview Skills
            </span>
            <br />
            with Intera.ai 
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom duration-700 delay-200">
            Real-time behavioral analysis, AI-powered feedback, and professional interview simulation—all in one platform
          </p>

          {/* Configuration Box */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom duration-700 delay-300 backdrop-blur-xl">
            <h3 className="text-xl md:text-2xl font-bold mb-6 text-white tracking-tight">Choose Your Interview Mode</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {/* General Interview */}
              <button 
                onClick={() => setSelectedFile(null)} 
                className={`relative p-6 rounded-2xl border text-left transition-all duration-300 ${!selectedFile ? 'bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}`}
              >
                {!selectedFile && <div className="absolute top-4 right-4"><CheckCircle className="w-5 h-5 text-blue-400" /></div>}
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-blue-400" />
                </div>
                <div className="font-bold text-lg mb-1 text-white">General Setup</div>
                <div className="text-sm text-white/50 leading-relaxed">Standard behavioral interview without a specific resume focus.</div>
              </button>

              {/* Resume Interview */}
              <div 
                className={`relative p-6 rounded-2xl border text-left transition-all duration-300 ${selectedFile ? 'bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}`}
              >
                {selectedFile && <div className="absolute top-4 right-4"><CheckCircle className="w-5 h-5 text-purple-400" /></div>}
                <input 
                  type="file" 
                  id="resume-select-hero" 
                  className="hidden" 
                  accept="application/pdf" 
                  onChange={(e) => setSelectedFile(e.target.files[0])} 
                />
                <label htmlFor="resume-select-hero" className="block cursor-pointer flex-1">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="font-bold text-lg mb-1 text-white">Resume-Based</div>
                  <div className="text-sm text-white/50 leading-relaxed">
                    {selectedFile ? (
                      <span className="text-purple-300 font-medium break-all">Selected: {selectedFile.name}</span>
                    ) : (
                      'Upload your PDF resume for highly personalized questions.'
                    )}
                  </div>
                </label>
              </div>
            </div>

            <button
              onClick={handleStartSession}
              disabled={loading}
              className="w-full relative px-8 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl shadow-blue-500/25 flex items-center justify-center gap-4 disabled:opacity-70 disabled:cursor-not-allowed hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> 
                  {uploadingResume ? 'Processing PDF Context...' : 'Initializing System...'}
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 fill-current" /> 
                  {selectedFile ? 'Start Resume Interview' : 'Start General Interview'}
                </>
              )}
            </button>
          </div>

          <div className="flex justify-center items-center gap-8 text-sm text-white/40">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>No signup required</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400" />
              <span>100% Private</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span>Instant feedback</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          <FeatureCard
            icon={<Video className="w-8 h-8" />}
            title="Real-time Video Analysis"
            description="Advanced MediaPipe technology tracks your facial expressions, eye contact, and body language in real-time"
            gradient="from-blue-500/10 to-cyan-500/10"
            borderGradient="from-blue-500/50 to-cyan-500/50"
            delay="0"
          />
          
          <FeatureCard
            icon={<Brain className="w-8 h-8" />}
            title="AI-Powered Conversations"
            description="Practice with our intelligent AI interviewer that adapts to your responses and provides natural dialogue"
            gradient="from-purple-500/10 to-pink-500/10"
            borderGradient="from-purple-500/50 to-pink-500/50"
            delay="100"
          />
          
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8" />}
            title="Detailed Performance Metrics"
            description="Get comprehensive analytics on eye contact, posture stability, engagement levels, and more"
            gradient="from-emerald-500/10 to-teal-500/10"
            borderGradient="from-emerald-500/50 to-teal-500/50"
            delay="200"
          />
          
          <FeatureCard
            icon={<Target className="w-8 h-8" />}
            title="Personalized Feedback"
            description="Receive specific recommendations to improve your interview performance based on your session"
            gradient="from-amber-500/10 to-orange-500/10"
            borderGradient="from-amber-500/50 to-orange-500/50"
            delay="300"
          />
          
          <FeatureCard
            icon={<ShieldCheck className="w-8 h-8" />}
            title="Privacy First"
            description="All video processing happens locally on your device—your data never leaves your computer"
            gradient="from-slate-500/10 to-gray-500/10"
            borderGradient="from-slate-500/50 to-gray-500/50"
            delay="400"
          />
          
          <FeatureCard
            icon={<Award className="w-8 h-8" />}
            title="Professional Reports"
            description="Download detailed PDF reports with your scores, strengths, and improvement areas"
            gradient="from-rose-500/10 to-red-500/10"
            borderGradient="from-rose-500/50 to-red-500/50"
            delay="500"
          />
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4">How It Works</h2>
            <p className="text-white/60 text-lg">Get started in three simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              number="01"
              title="Start Your Session"
              description="Click the button above to initialize your AI interview session with camera access"
              icon={<Play className="w-6 h-6" />}
            />
            
            <StepCard
              number="02"
              title="Practice Interview"
              description="Engage in a realistic conversation with our AI interviewer while we analyze your behavior"
              icon={<MessageSquare className="w-6 h-6" />}
            />
            
            <StepCard
              number="03"
              title="Review Results"
              description="Get instant feedback with detailed metrics, scores, and personalized improvement tips"
              icon={<TrendingUp className="w-6 h-6" />}
            />
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          <StatCard number="98%" label="Accuracy Rate" />
          <StatCard number="<100ms" label="Response Time" />
          <StatCard number="15+" label="Metrics Tracked" />
          <StatCard number="100%" label="Privacy Guaranteed" />
        </div>

        {/* Session History */}
        {(sessionsLoading || sessions.length > 0) && (
          <div className="mb-20">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black mb-2">Past Sessions</h2>
              <p className="text-white/40 text-sm">Your previous interview results</p>
            </div>
            {sessionsLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sessions.slice(0, 6).map((s) => {
                  const ev = s.evaluation || {};
                  const score = ev.overallScore ?? 0;
                  const scoreColor =
                    score >= 80 ? 'text-emerald-400' :
                    score >= 60 ? 'text-blue-400'    :
                    score >= 40 ? 'text-amber-400'   : 'text-red-400';
                  const borderColor =
                    score >= 80 ? 'border-emerald-500/20' :
                    score >= 60 ? 'border-blue-500/20'    :
                    score >= 40 ? 'border-amber-500/20'   : 'border-red-500/20';
                  const date = new Date(s.createdAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  });
                  const duration = s.endTime
                    ? Math.round((new Date(s.endTime) - new Date(s.startTime)) / 60000)
                    : null;
                  return (
                    <div
                      key={s.sessionId}
                      className={`bg-white/3 border ${borderColor} rounded-2xl p-6 hover:bg-white/5 transition-all group`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-xs text-white/30 font-mono mb-1">{s.sessionId.slice(-12)}</p>
                          <p className="text-xs text-white/40 flex items-center gap-1">
                            <Clock size={10} /> {date}
                            {duration && <span className="ml-2">· {duration}m</span>}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-3xl font-black ${scoreColor}`}>{score}</div>
                          <div className="text-[10px] text-white/30 uppercase tracking-wider">Score</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {[
                          { label: 'Eye', val: ev.eyeContactScore ?? 0 },
                          { label: 'Head', val: ev.headStabilityScore ?? 0 },
                          { label: 'Focus', val: ev.focusScore ?? 0 },
                        ].map(m => (
                          <div key={m.label} className="bg-white/5 rounded-xl p-2 text-center">
                            <div className="text-sm font-black text-white">{m.val}</div>
                            <div className="text-[9px] text-white/30 uppercase">{m.label}</div>
                          </div>
                        ))}
                      </div>
                      {ev.suggestions?.[0] && (
                        <p className="text-xs text-white/40 italic line-clamp-2">"{ev.suggestions[0]}"</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Final CTA */}
        <div className="text-center p-12 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl border border-white/10 backdrop-blur-xl">
          <h3 className="text-3xl font-bold mb-4">Ready to Ace Your Next Interview?</h3>
          <p className="text-white/60 mb-8 text-lg">Join thousands of professionals improving their interview skills with AI</p>
          <div className="max-w-md mx-auto">
             <button
                onClick={() => { document.querySelector('.animate-in').scrollIntoView({ behavior: 'smooth' }); }}
                disabled={loading}
                className="w-full px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all border border-white/20 hover:scale-105"
              >
                Configure Session Options ↑
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// FEATURE CARD COMPONENT
// ══════════════════════════════════════════════════════════════
const FeatureCard = ({ icon, title, description, gradient, borderGradient, delay }) => (
  <div 
    className={`group relative p-8 rounded-3xl bg-gradient-to-br ${gradient} border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 animate-in fade-in slide-in-from-bottom`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10" 
         style={{ background: `linear-gradient(135deg, ${borderGradient})` }} 
    />
    
    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} border border-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
      {icon}
    </div>
    
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-white/60 leading-relaxed">{description}</p>
  </div>
);

// ══════════════════════════════════════════════════════════════
// STEP CARD COMPONENT
// ══════════════════════════════════════════════════════════════
const StepCard = ({ number, title, description, icon }) => (
  <div className="relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group">
    <div className="absolute -top-6 left-8 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/50">
      {number}
    </div>
    
    <div className="mt-6 mb-4 w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
      {icon}
    </div>
    
    <h4 className="text-xl font-bold mb-3">{title}</h4>
    <p className="text-white/60">{description}</p>
  </div>
);

// ══════════════════════════════════════════════════════════════
// STAT CARD COMPONENT
// ══════════════════════════════════════════════════════════════
const StatCard = ({ number, label }) => (
  <div className="p-8 rounded-3xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-all">
    <div className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
      {number}
    </div>
    <div className="text-sm text-white/60 font-medium">{label}</div>
  </div>
);

export default LandingPage;