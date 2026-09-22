import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QuizProvider, useQuiz } from "../../context/QuizContext";
import ActiveQuiz from "../dashboard/components/ActiveQuiz";
import {
  Loader2,
  AlertTriangle,
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Activity,
  Sparkles,
  Zap,
  Gauge,
  Award,
  Compass,
  HelpCircle,
  Terminal,
} from "lucide-react";

function QuizRunner() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const {
    startQuiz,
    status,
    loading,
    error,
    activeAttempt,
    loadResults,
    results,
  } = useQuiz();

  const initializationAttemptedRef = useRef<string | null>(null);
  const resultsLoadedRef = useRef<string | null>(null);

  useEffect(() => {
    if (quizId && initializationAttemptedRef.current !== quizId) {
      initializationAttemptedRef.current = quizId;
      void startQuiz(quizId);
    }
  }, [quizId, startQuiz]);

  useEffect(() => {
    if (
      (status === "COMPLETED" || status === "EXPIRED") &&
      activeAttempt?.id &&
      !results &&
      resultsLoadedRef.current !== activeAttempt.id
    ) {
      resultsLoadedRef.current = activeAttempt.id;
      void loadResults(activeAttempt.id);
    }
  }, [status, activeAttempt, results, loadResults]);

  // ================= LOADING STATE =================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070c] text-white flex items-center justify-center p-4 relative overflow-hidden select-none font-jakarta">
        {/* Neon Cyan Cyber Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00e5ff0d_1px,transparent_1px),linear-gradient(to_bottom,#00e5ff0d_1px,transparent_1px)] bg-size[32px_32px] pointer-events-none" />

        <div className="relative border-2 border-cyan-400 bg-black/90 p-8 sm:p-12 -skew-x-6 max-w-lg w-full text-center shadow-[0_0_50px_rgba(0,229,255,0.2)] backdrop-blur-md">
          {/* Corner Frame Brackets */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

          <div className="flex justify-center mb-6">
            <div className="relative flex items-center justify-center">
              <Loader2 className="w-16 h-16 text-cyan-400 animate-spin" />
              <Zap className="w-6 h-6 text-white absolute animate-pulse" />
            </div>
          </div>

          <h2 className="font-kanit font-black italic text-xl sm:text-2xl text-cyan-400 tracking-widest uppercase mb-2">
            INITIALIZING SESSION
          </h2>
          <p className="font-mono text-xs text-cyan-200/70 tracking-widest uppercase animate-pulse">
            [ ESTABLISHING TELEMETRY CONNECTION... ]
          </p>
        </div>
      </div>
    );
  }

  // ================= ERROR STATE =================
  if (error) {
    return (
      <div className="min-h-screen text-p3-highlight flex items-center justify-center p-4 relative overflow-hidden select-none font-jakarta">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ef44440d_1px,transparent_1px),linear-gradient(to_bottom,#ef44440d_1px,transparent_1px)] bg-size:[32px_32px] pointer-events-none" />

        <div className="relative border-2 border-red-500 bg-p3-canvas p-6 sm:p-8 -skew-x-2 max-w-md w-full shadow-[0_0_40px_rgba(239,68,68,0.25)] backdrop-blur-md flex flex-col items-center gap-5">
          <div className="p-3 bg-red-500/20 border border-red-500 -skew-x-12">
            <AlertTriangle className="w-8 h-8 text-red-400 animate-bounce" />
          </div>

          <div className="text-center">
            <span className="font-mono text-[10px] text-red-400 uppercase tracking-widest block mb-1">
              // TELEMETRY FAILURE
            </span>
            <div className="font-kanit font-extrabold italic text-lg sm:text-xl text-red-200 uppercase">
              [ SESSION ERROR ]
            </div>
            <p className="font-mono text-xs text-red-300 mt-2 bg-red-950/60 p-3 border border-red-500/40">
              {error}
            </p>
          </div>

          <button
            onClick={() => navigate("/user/dashboard")}
            className="w-full font-kanit font-black italic text-xs -skew-x-12 px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white uppercase tracking-widest cursor-pointer border border-red-300 shadow-[0_0_15px_rgba(239,68,68,0.5)] active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO DASHBOARD</span>
          </button>
        </div>
      </div>
    );
  }

  // ================= RESULTS STATE =================
  if (results) {
    const stats = results.research_stats;
    const formattedDate = results.finished_at
      ? new Date(results.finished_at).toLocaleString()
      : "N/A";

    return (
      <div className="min-h-screen bg-[#05070c] text-white flex items-center justify-center p-3 sm:p-6 py-8 sm:py-12 relative overflow-hidden select-none font-jakarta">
        {/* Ambient Dark Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00e5ff0a_1px,transparent_1px),linear-gradient(to_bottom,#00e5ff0a_1px,transparent_1px)] bg-size[36px_36px] pointer-events-none" />

        {/* Main Pitch-Black Frame with Cyan Border */}
        <div className="w-full max-w-4xl bg-[#090d16]/95 border-2 border-cyan-400 p-5 sm:p-8 shadow-[0_0_60px_rgba(0,229,255,0.2)] backdrop-blur-md relative -skew-x-1 flex flex-col gap-6">
          {/* Top Slanted Banner Tag */}
          <div className="absolute -top-4 left-4 sm:left-8 bg-cyan-400 text-black px-4 py-1 -skew-x-12 border border-white shadow-[0_0_15px_rgba(0,229,255,0.6)] flex items-center gap-2 z-20">
            <Trophy className="w-3.5 h-3.5 text-black" />
            <span className="font-kanit font-black italic text-xs tracking-widest uppercase">
              EVALUATION COMPLETE // TELEMETRY REPORT
            </span>
          </div>

          {/* Header Section */}
          <div className="border-b-2 border-slate-800 pb-5 pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-[11px] tracking-widest uppercase">
                <Clock className="w-3.5 h-3.5" />
                <span>COMPLETED AT: {formattedDate}</span>
              </div>
              <h1 className="font-kanit font-black italic text-2xl sm:text-3xl md:text-4xl text-white uppercase tracking-wide">
                {results.title}
              </h1>
              <p className="font-jakarta text-xs sm:text-sm text-slate-400 italic">
                {results.message}
              </p>
            </div>

            {/* Pressure Grade Rank Badge */}
            <div className="self-start sm:self-center shrink-0">
              <div className="bg-[#060a12] border-2 border-cyan-400 p-3 sm:p-4 -skew-x-12 shadow-[0_0_25px_rgba(0,229,255,0.3)] flex flex-col items-center justify-center min-w-25">
                <span className="text-[9px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
                  GRADE RANK
                </span>
                <span className="font-kanit font-black italic text-4xl sm:text-5xl text-cyan-400 drop-shadow-[0_0_10px_rgba(0,229,255,0.8)] leading-none my-1">
                  {results.pressure_score_grade}
                </span>
                <div className="flex items-center gap-1 text-[9px] font-mono text-slate-300">
                  <Award className="w-3 h-3 text-cyan-400" />
                  <span>ASSESSMENT</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Metrics Grid - Dark Translucent Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Accuracy Rate */}
            <div className="bg-black/60 border border-cyan-500/40 p-3.5 text-center -skew-x-3 hover:border-cyan-400 transition-colors">
              <span className="block font-mono text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-1 items-center justify-center gap-1">
                <TargetIcon className="w-3 h-3" /> ACCURACY RATE
              </span>
              <span className="font-kanit font-black italic text-2xl sm:text-3xl text-white">
                {Math.round(stats?.accuracy_rate ?? 0)}%
              </span>
              <span className="block text-[10px] text-cyan-400 font-mono font-bold mt-1 uppercase tracking-tight truncate">
                {results.accuracy_integrity_lvl}
              </span>
            </div>

            {/* Answers Breakdown */}
            <div className="bg-black/60 border border-cyan-500/40 p-3.5 text-center -skew-x-3 hover:border-cyan-400 transition-colors">
              <span className="block font-mono text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-1 items-center justify-center gap-1">
                <BarChartIcon className="w-3 h-3" /> BREAKDOWN
              </span>
              <div className="flex items-center justify-center gap-1.5 my-0.5">
                <span className="font-kanit font-extrabold italic text-xl text-green-400 flex items-center gap-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {stats?.total_correct_answers ?? 0}
                </span>
                <span className="text-slate-600 text-xs">/</span>
                <span className="font-kanit font-extrabold italic text-xl text-red-400 flex items-center gap-0.5">
                  <XCircle className="w-3.5 h-3.5" />
                  {stats?.total_incorrect_answers ?? 0}
                </span>
                <span className="text-slate-600 text-xs">/</span>
                <span className="font-kanit font-extrabold italic text-xl text-amber-400 flex items-center gap-0.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  {stats?.total_skipped_answers ?? 0}
                </span>
              </div>
              <span className="block text-[9px] text-slate-400 font-mono tracking-widest uppercase">
                [ C / IC / SKP ]
              </span>
            </div>

            {/* Response Time */}
            <div className="bg-black/60 border border-cyan-500/40 p-3.5 text-center -skew-x-3 hover:border-cyan-400 transition-colors">
              <span className="font-mono text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" /> AVG RESPONSE
              </span>
              <span className="font-kanit font-black italic text-2xl sm:text-3xl text-white">
                {stats?.avg_response_time ?? 0}s
              </span>
              <span className="block text-[10px] text-slate-400 font-mono mt-1">
                TOTAL: {stats?.sum_taken_secs ?? 0}s
              </span>
            </div>

            {/* Pressure Index */}
            <div className="bg-black/60 border border-cyan-500/40 p-3.5 text-center -skew-x-3 hover:border-cyan-400 transition-colors">
              <span className="block font-mono text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-1 items-center justify-center gap-1">
                <Gauge className="w-3 h-3" /> PRESSURE INDEX
              </span>
              <span className="font-kanit font-black italic text-2xl sm:text-3xl text-cyan-400 drop-shadow-[0_0_8px_#00E5FF]">
                {stats?.pressure_score ?? 0}
              </span>
              <span className="block text-[10px] text-slate-400 font-mono mt-1 truncate">
                {results.pressure_score_info}
              </span>
            </div>
          </div>

          {/* Diagnostic Insights Panel */}
          <div className="bg-black/80 border border-cyan-500/30 p-4 sm:p-5 -skew-x-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="border-l-2 border-cyan-400 pl-3">
                <span className="text-cyan-400 font-mono font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5 mb-0.5">
                  <Activity className="w-3.5 h-3.5" /> ACCURACY CLASSIFICATION
                </span>
                <p className="text-slate-200 font-medium text-xs sm:text-sm">
                  {results.accuracy_classification}
                </p>
              </div>

              <div className="border-l-2 border-cyan-400 pl-3">
                <span className="text-cyan-400 font-mono font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5 mb-0.5">
                  <Zap className="w-3.5 h-3.5" /> PACING VELOCITY
                </span>
                <p className="text-slate-200 font-medium text-xs sm:text-sm">
                  {results.avg_rs_pacing_velocity}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="border-l-2 border-cyan-400 pl-3">
                <span className="text-cyan-400 font-mono font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5 mb-0.5">
                  <Compass className="w-3.5 h-3.5" /> TELEMETRY DIAGNOSIS
                </span>
                <p className="text-slate-200 font-medium text-xs sm:text-sm">
                  {results.avg_rs_diagnosis}
                </p>
              </div>

              <div className="border-l-2 border-cyan-400 pl-3">
                <span className="text-cyan-400 font-mono font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5 mb-0.5">
                  <Clock className="w-3.5 h-3.5" /> TIME SAVED RATIO
                </span>
                <p className="text-slate-200 font-medium text-xs sm:text-sm">
                  {((stats?.time_ratio_saved ?? 0) * 100).toFixed(1)}% (
                  {stats?.sum_left_secs ?? 0}s remaining)
                </p>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex justify-end pt-2 border-t border-slate-800">
            <button
              onClick={() => navigate("/user/dashboard")}
              className="w-full sm:w-auto font-kanit font-black italic text-sm -skew-x-12 px-8 py-4 bg-cyan-400 hover:bg-cyan-300 text-black uppercase tracking-widest cursor-pointer border border-white shadow-[0_0_25px_rgba(0,229,255,0.5)] active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>RETURN TO DASHBOARD</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= COMPLETED / EXPIRED INTERMEDIATE SCREEN =================
  if (status === "COMPLETED" || status === "EXPIRED") {
    return (
      <div className="min-h-screen bg-[#05070c] text-white flex items-center justify-center p-4 relative overflow-hidden select-none font-jakarta">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00e5ff0d_1px,transparent_1px),linear-gradient(to_bottom,#00e5ff0d_1px,transparent_1px)] bg-size[32px_32px] pointer-events-none" />

        <div className="relative border-2 border-cyan-400 bg-black/90 p-6 sm:p-8 -skew-x-6 max-w-lg w-full text-center shadow-[0_0_50px_rgba(0,229,255,0.2)] backdrop-blur-md flex flex-col items-center gap-5">
          <div className="p-3 bg-cyan-400/20 border border-cyan-400 -skew-x-12">
            <Terminal className="w-8 h-8 text-cyan-400 animate-pulse" />
          </div>

          <div>
            <h2 className="font-kanit font-black italic text-2xl sm:text-3xl text-cyan-400 uppercase mb-2">
              ASSESSMENT {status}
            </h2>
            <p className="font-jakarta text-xs sm:text-sm text-slate-400 italic">
              Your quiz session has concluded. Click below to view performance telemetry.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full">
            {activeAttempt && (
              <button
                onClick={() => void loadResults(activeAttempt.id)}
                className="w-full sm:w-auto flex-1 font-kanit font-black italic text-xs -skew-x-12 px-6 py-3.5 bg-cyan-400 hover:bg-cyan-300 text-black uppercase tracking-widest cursor-pointer border border-white shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>SEE RESULTS</span>
              </button>
            )}
            <button
              onClick={() => navigate("/user/dashboard")}
              className="w-full sm:w-auto flex-1 font-kanit font-black italic text-xs -skew-x-12 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white uppercase tracking-widest cursor-pointer border border-cyan-500/50 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>DASHBOARD</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Quiz View
  return <ActiveQuiz />;
}

// Inline Icon Helper Components
function TargetIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <circle cx="12" cy="12" r="6" strokeWidth="2" />
      <circle cx="12" cy="12" r="2" strokeWidth="2" />
    </svg>
  );
}

function BarChartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
}

export default function QuizPage() {
  return (
    <QuizProvider>
      <QuizRunner />
    </QuizProvider>
  );
}
