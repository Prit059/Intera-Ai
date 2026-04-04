import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, Cell
} from 'recharts';
import {
  Eye, Activity, Zap, Target, CheckCircle2, TrendingUp,
  RefreshCw, Download, Share2, MessageSquare, FileText,
  AlertCircle, Trophy, Clock, BarChart as BarChartIcon, Headphones
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

// ─── Score colour helper ──────────────────────────────────────────────────────
const scoreColor = (s) =>
  s >= 80 ? '#10b981' : s >= 60 ? '#3b82f6' : s >= 40 ? '#f59e0b' : '#ef4444';

const scoreLabel = (s) =>
  s >= 80 ? 'Excellent' : s >= 60 ? 'Good' : s >= 40 ? 'Needs Work' : 'Poor';

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="group bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-2xl p-6 flex flex-col gap-3 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer" style={{ boxShadow: `0 0 0 0 ${color}20` }}>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{ background: `${color}20` }}>
        <Icon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" style={{ color }} />
      </div>
      <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-4xl font-black text-white">{value}</span>
      <span className="text-lg text-slate-500 font-bold">/ 100</span>
    </div>
    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-1000 group-hover:animate-pulse" style={{ width: `${value}%`, background: color }} />
    </div>
    <span className="text-xs font-bold" style={{ color }}>{scoreLabel(value)}</span>
  </div>
);


// ─── Main Component ───────────────────────────────────────────────────────────
const ResultsDashboard = ({ results, onReset }) => {

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 font-medium">Loading results...</p>
        </div>
      </div>
    );
  }

  // ── Data ──────────────────────────────────────────────────────────────────
  const overall   = Math.min(100, Math.max(0, results.overallScore        ?? 0));
  const eyeScore  = Math.min(100, Math.max(0, results.eyeContactScore     ?? 0));
  const headScore = Math.min(100, Math.max(0, results.headStabilityScore  ?? 0));
  const focScore  = Math.min(100, Math.max(0, results.focusScore          ?? 0));
  const confScore = Math.min(100, Math.max(0, results.avgConfidence       ?? 0));
  const engScore  = Math.min(100, Math.max(0, results.avgEngagement       ?? 0));

  // Detect if session was too short to produce meaningful scores
  const hasData = overall > 0 || eyeScore > 0 || confScore > 0;

  const barData = [
    { name: 'Eye Contact',    score: eyeScore,  fill: '#3b82f6' },
    { name: 'Head Stability', score: headScore, fill: '#8b5cf6' },
    { name: 'Focus',          score: focScore,  fill: '#10b981' },
    { name: 'Confidence',     score: confScore, fill: '#f59e0b' },
    { name: 'Engagement',     score: engScore,  fill: '#ec4899' },
  ];

  const radarData = [
    { subject: 'Eye Contact',    A: eyeScore  },
    { subject: 'Stability',      A: headScore },
    { subject: 'Focus',          A: focScore  },
    { subject: 'Confidence',     A: confScore },
    { subject: 'Engagement',     A: engScore  },
  ];

  // ── AI / Vapi data ────────────────────────────────────────────────────────
  const analysis   = results.vapiAnalysis   || {};
  const sData      = analysis.structuredData || {};
  const summary    = analysis.summary       || null;
  const strengths  = sData.strengths?.length   > 0 ? sData.strengths   : [];
  const improvements = sData.improvements?.length > 0 ? sData.improvements : [];
  const suggestions  = results.suggestions  || [];
  const audioUrl     = results.audioUrl     || null;

  // ── Transcript ────────────────────────────────────────────────────────────
  const rawTranscript = results.transcript || [];
  const transcript = rawTranscript.reduce((acc, msg) => {
    if (acc.length > 0 && acc[acc.length - 1].role === msg.role) {
      acc[acc.length - 1].text += ' ' + msg.text;
      return acc;
    }
    acc.push({ ...msg });
    return acc;
  }, []);

  // ── Session meta ──────────────────────────────────────────────────────────
  const sessionDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // ── PDF Export (Visual with html2canvas) ───────────────────────────────
  const handleExport = async () => {
    try {
      const dashboardElement = document.getElementById('dashboard-content');
      if (!dashboardElement) return;

      // Temporarily modify DOM for better PDF output
      const actionButtons = dashboardElement.querySelector('#action-buttons');
      if (actionButtons) actionButtons.style.display = 'none';

      const transcriptBox = dashboardElement.querySelector('.report-scrollbar');
      let originalMaxHeight = '';
      if (transcriptBox) {
        originalMaxHeight = transcriptBox.style.maxHeight;
        transcriptBox.style.maxHeight = 'none';
        transcriptBox.classList.remove('overflow-y-auto');
      }

      // Small delay to allow DOM to flush
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(dashboardElement, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#020617', // slate-950
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: dashboardElement.scrollHeight,
      });

      // Restore DOM
      if (actionButtons) actionButtons.style.display = 'flex';
      if (transcriptBox) {
        transcriptBox.style.maxHeight = originalMaxHeight;
        transcriptBox.classList.add('overflow-y-auto');
      }

      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      
      // First page
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
      
      // Additional pages
      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save(`interview-report-${Date.now()}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF export failed: ' + err.message);
    }
  };

  // ── Share ─────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    const text = `My AI Interview Score: ${overall}/100\n` +
      `Eye Contact: ${eyeScore} | Stability: ${headScore} | Focus: ${focScore}\n` +
      `Powered by Intera.ai`;
    if (navigator.share) {
      try { await navigator.share({ title: 'My Interview Results', text }); }
      catch (_) {}
    } else {
      await navigator.clipboard.writeText(text);
      alert('Results copied to clipboard!');
    }
  };

  return (
    <div id="dashboard-content" className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      
      <style>{`
        .report-scrollbar::-webkit-scrollbar { width: 4px; }
        .report-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); }
        .report-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in-up {
          animation: slideInUp 0.6s ease-out forwards;
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
          animation: scaleIn 0.5s ease-out forwards;
        }
      `}</style>

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 shadow-2xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="animate-slide-in-up">
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              Interview Report
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3 h-3" /> {sessionDate}
            </p>
          </div>
          <div id="action-buttons" className="flex gap-2 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
            <button
              onClick={handleExport}
              className="group flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 hover:border-slate-600 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-slate-700/50"
            >
              <Download className="w-4 h-4 group-hover:scale-110 transition-transform" /> Export PDF
            </button>
            <button
              onClick={handleShare}
              className="group flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50"
            >
              <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" /> Share
            </button>
            <button
              onClick={onReset}
              className="group flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 hover:border-slate-600 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-slate-700/50"
            >
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" /> New Session
            </button>
          </div>
        </div>
      </div>

      {/* ── Printable report area ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 space-y-10">

        {/* ── Overall score hero ── */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 animate-scale-in">
          {/* Ring */}
          <div className="relative shrink-0 group" style={{ width: 160, height: 160 }}>
            <svg width={160} height={160} className="-rotate-90">
              <circle cx={80} cy={80} r={68} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={12} />
              <circle
                cx={80} cy={80} r={68} fill="none"
                stroke={scoreColor(overall)} strokeWidth={12}
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 68}
                strokeDashoffset={2 * Math.PI * 68 * (1 - overall / 100)}
                style={{ transition: 'stroke-dashoffset 1.2s ease' }}
                className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-white group-hover:scale-110 transition-transform duration-300">{overall}</span>
              <span className="text-xs text-slate-400 uppercase tracking-widest mt-1">Overall</span>
            </div>
          </div>

          {/* Summary text */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Trophy className="w-6 h-6 animate-pulse" style={{ color: scoreColor(overall) }} />
              <span className="text-2xl font-black text-white">{scoreLabel(overall)} Performance</span>
            </div>
            {summary ? (
              <p className="text-slate-300 leading-relaxed text-sm border-l-2 border-slate-600 pl-4 italic hover:border-blue-500 transition-colors duration-300">
                "{summary}"
              </p>
            ) : (
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <div className="w-3 h-3 border border-blue-500/40 border-t-blue-400 rounded-full animate-spin" />
                AI summary is being generated — check back after a moment.
              </div>
            )}
          </div>
        </div>

        {/* ── Low data warning ── */}
        {!hasData && (
          <div className="bg-amber-900/30 border border-amber-700/50 rounded-2xl p-5 flex items-start gap-4 animate-slide-in-up hover:bg-amber-900/40 transition-all duration-300">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="text-sm font-bold text-amber-300">Session data is limited</p>
              <p className="text-xs text-amber-400/80 mt-1">
                The interview may have been too short or the camera feed wasn't active long enough to collect behavioral metrics. Complete a full interview session for accurate scores.
              </p>
            </div>
          </div>
        )}

        {/* ── Stat cards ── */}
        <div className="animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-5">Performance Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard icon={Eye}      label="Eye Contact"    value={eyeScore}  color="#3b82f6" />
            <StatCard icon={Activity} label="Head Stability" value={headScore} color="#8b5cf6" />
            <StatCard icon={Zap}      label="Focus"          value={focScore}  color="#10b981" />
            <StatCard icon={Trophy}   label="Confidence"     value={confScore} color="#f59e0b" />
            <StatCard icon={TrendingUp} label="Engagement"   value={engScore}  color="#ec4899" />
          </div>
        </div>

        {/* ── Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
          {/* Bar chart */}
          <div className="group bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 hover:border-slate-700 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
              <BarChartIcon className="w-4 h-4" />
              Score Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff', fontSize: 12 }}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Radar chart */}
          <div className="group bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 hover:border-slate-700 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Multi-Dimensional View
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="rgba(255,255,255,0.06)" fontSize={9} />
                <Radar name="Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Strengths & Improvements ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="group bg-slate-900/50 backdrop-blur-xl border border-emerald-900/40 hover:border-emerald-800/60 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10">
            <h3 className="text-sm font-black uppercase tracking-widest text-emerald-500 mb-5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" /> Strengths
            </h3>
            {strengths.length > 0 ? (
              <ul className="space-y-3">
                {strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-300 hover:text-white transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-600 text-sm italic">No strength data available for this session.</p>
            )}
          </div>

          <div className="group bg-slate-900/50 backdrop-blur-xl border border-amber-900/40 hover:border-amber-800/60 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10">
            <h3 className="text-sm font-black uppercase tracking-widest text-amber-500 mb-5 flex items-center gap-2">
              <Target className="w-4 h-4 group-hover:scale-110 transition-transform" /> Areas to Improve
            </h3>
            {improvements.length > 0 ? (
              <ul className="space-y-3">
                {improvements.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-300 hover:text-white transition-colors">
                    <TrendingUp className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-600 text-sm italic">No improvement data available for this session.</p>
            )}
          </div>
        </div>

        {/* ── Behavioral suggestions ── */}
        {suggestions.length > 0 && (
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 hover:border-slate-700 rounded-2xl p-6 transition-all duration-300 animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-5 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Behavioral Coaching
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestions.map((s, i) => (
                <div key={i} className="group flex items-start gap-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl p-4 transition-all duration-300 hover:scale-105 cursor-pointer">
                  <span className="w-6 h-6 rounded-lg bg-slate-700 group-hover:bg-blue-600 text-slate-300 group-hover:text-white text-xs font-black flex items-center justify-center shrink-0 transition-all duration-300">{i + 1}</span>
                  <p className="text-sm text-slate-300 group-hover:text-white leading-relaxed transition-colors">{s}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Audio Recording ── */}
        {audioUrl && (
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 hover:border-slate-700 rounded-2xl p-6 transition-all duration-300 animate-slide-in-up" style={{ animationDelay: '0.45s' }}>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4" /> Session Recording
              </div>
              <a
                href={audioUrl}
                download={`interview-audio-${Date.now()}.webm`}
                className="group flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 text-blue-400 hover:text-white rounded-lg text-xs font-bold transition-all duration-300"
              >
                <Download className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                Save Audio File
              </a>
            </h3>
            <div className="w-full bg-slate-950/50 rounded-xl p-4 border border-white/5 shadow-inner">
              <audio controls src={audioUrl} className="w-full rounded-lg" style={{ outline: 'none' }} />
            </div>
          </div>
        )}

        {/* ── Transcript ── */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 hover:border-slate-700 rounded-2xl p-6 transition-all duration-300 animate-slide-in-up" style={{ animationDelay: '0.5s' }}>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-5 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Full Conversation Transcript
          </h3>
          {transcript.length > 0 ? (
            <div className="space-y-3 max-h-[500px] overflow-y-auto report-scrollbar pr-2">
              {transcript.map((msg, i) => (
                <div
                  key={i}
                  className={`group flex flex-col gap-1 p-4 rounded-xl border text-sm transition-all duration-300 hover:scale-[1.02] ${
                    msg.role === 'AI'
                      ? 'bg-blue-950/30 border-blue-800/30 hover:bg-blue-950/50 hover:border-blue-700/50'
                      : 'bg-slate-800/50 border-slate-700/30 hover:bg-slate-800 hover:border-slate-600/50'
                  }`}
                >
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    msg.role === 'AI' ? 'text-blue-400' : 'text-emerald-400'
                  }`}>
                    {msg.role === 'AI' ? 'AI Interviewer' : 'You'}
                  </span>
                  <p className="text-slate-200 group-hover:text-white leading-relaxed transition-colors">{msg.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 text-slate-600 py-6 justify-center">
              <FileText className="w-5 h-5" />
              <p className="text-sm italic">No transcript recorded for this session.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ResultsDashboard;
