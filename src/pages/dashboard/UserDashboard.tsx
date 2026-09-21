import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShieldAlert, 
  LogOut, 
  Activity, 
  Target, 
  Zap, 
  UserCheck, 
  X, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  ShieldCheck,
  Award,
  Sparkles,
  Home,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { getUserDashboardApi } from "../../services/dashboard.service";
import { quizService } from "../../services/quiz.service";
import type { UserDashboardResponse } from "../../types/dashboard.types";
import type { QuizAttemptResultResponse } from "../../types/quiz.types";
import { PersonaLoading } from "../../components/ui/PersonaLoading";
import QuizList from "./components/QuizList";

type ActiveTab = "overview" | "quizzes";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");

  // Dashboard Data State
  const [data, setData] = useState<UserDashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);

  // Results Dossier State
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [resultsData, setResultsData] = useState<QuizAttemptResultResponse | null>(null);
  const [loadingResults, setLoadingResults] = useState<boolean>(false);
  const [resultsError, setResultsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await getUserDashboardApi();
        setData(res);
      } catch {
        setError("FAILED TO FETCH OPERATIVE TELEMETRY");
      } finally {
        setLoading(false);
      }
    };

    void fetchDashboard();
  }, []);

  const confirmLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch {
      navigate("/login");
    }
  };

  const handleViewResults = async (attemptId: string) => {
    setSelectedAttemptId(attemptId);
    setLoadingResults(true);
    setResultsError(null);
    try {
      const res = await quizService.getAttemptResults(attemptId);
      setResultsData(res);
    } catch {
      setResultsError("FAILED TO FETCH PERFORMANCE DOSSIER");
    } finally {
      setLoadingResults(false);
    }
  };

  const closeResultsModal = () => {
    setSelectedAttemptId(null);
    setResultsData(null);
    setResultsError(null);
  };

  // PERSONA 3 LOADING STATE
  if (loading) {
    return <PersonaLoading message="INITIALIZING OPERATIVE SYSTEM..." />;
  }

  // ERROR DISPLAY STATE
  if (error || !data) {
    return (
      <div className="relative min-h-[70vh] w-full flex items-center justify-center p-3 select-none overflow-x-hidden">
        <div className="relative max-w-lg w-full z-10">
          <div className="absolute -inset-1 sm:-inset-2 bg-linear-to-r from-rose-700 via-red-600 to-rose-900 -skew-x-3 sm:-skew-x-6 opacity-40 border border-rose-500/50 shadow-[0_0_25px_rgba(244,63,94,0.3)] pointer-events-none" />
          <div className="absolute -inset-0.5 sm:-inset-1 bg-p3-surface skew-x-2 sm:skew-x-3 border-2 border-rose-500/60 shadow-[4px_4px_0px_0px_#4c0519] pointer-events-none" />

          <div className="relative bg-p3-surface text-white p-5 sm:p-8 -skew-x-1 sm:-skew-x-2 border-2 border-rose-500 shadow-[6px_6px_0px_0px_#9f1239] sm:shadow-[10px_10px_0px_0px_#9f1239] text-center space-y-4">
            <div className="inline-block bg-rose-600 text-white px-2.5 py-0.5 -skew-x-12 border-r-4 border-rose-900 shadow-[2px_2px_0px_0px_#000]">
              <span className="font-black italic text-[10px] tracking-widest uppercase">
                SYSTEM CRITICAL LOG
              </span>
            </div>

            <ShieldAlert className="w-12 h-12 sm:w-16 sm:h-16 text-rose-500 mx-auto animate-pulse" />

            <div>
              <h2 className="font-black italic text-xl sm:text-3xl text-white -skew-x-4 tracking-wider drop-shadow-[2px_2px_0px_#f43f5e]">
                TELEMETRY LINK FAILED
              </h2>
              <p className="font-black italic text-[11px] sm:text-xs text-rose-300 tracking-wide mt-1.5">
                {error || "NO OPERATIVE DATA RETURNED FROM SYSTEM MEMORY."}
              </p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="relative w-full p-2.5 sm:p-3 -skew-x-3 border-2 border-rose-400 bg-linear-to-r from-rose-700 to-red-600 text-white font-black italic text-xs tracking-widest uppercase transition-all shadow-[3px_3px_0px_0px_#4c0519] hover:shadow-[4px_4px_0px_0px_#f43f5e] hover:translate-x-1 cursor-pointer"
            >
              RE-ESTABLISH TELEMETRY LINK
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { user_info, performance_summary } = data;
  const isAdmin = user_info.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "admin";

  return (
    <div className="relative w-full text-slate-100 flex flex-col items-center justify-between p-2.5 sm:p-6 lg:p-8 select-none overflow-x-hidden">
      
      {/* Keyframe Style Animations */}
      <style>{`
        @keyframes slashReveal {
          0% {
            clip-path: polygon(0 0, 0 0, -20% 100%, -20% 100%);
            transform: skewX(-12deg) translateX(-20px);
            opacity: 0;
          }
          100% {
            clip-path: polygon(0 0, 120% 0, 100% 100%, -20% 100%);
            transform: skewX(-3deg) translateX(0);
            opacity: 1;
          }
        }
        .animate-slash-reveal {
          animation: slashReveal 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Main Container */}
      <div className="w-full max-w-6xl flex flex-col items-center z-10 space-y-4 sm:space-y-6">
        
        {/* TOP HERO HEADER CARD */}
        <header className="relative w-full">
          <div className="absolute -inset-1 sm:-inset-2 bg-linear-to-r from-blue-600 via-cyan-400 to-blue-800 -skew-x-3 sm:-skew-x-6 opacity-30 border border-cyan-400/40 shadow-[0_0_30px_rgba(0,240,255,0.2)] pointer-events-none" />
          <div className="absolute -inset-0.5 sm:-inset-1 bg-p3-surface skew-x-2 sm:skew-x-3 border-2 border-cyan-400/50 shadow-[4px_4px_0px_0px_#000c29] pointer-events-none" />

          <div className="relative bg-p3-surface border-2 border-cyan-400 shadow-[5px_5px_0px_0px_#002288] sm:shadow-[10px_10px_0px_0px_#002288] -skew-x-1 sm:-skew-x-2 p-4 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 overflow-hidden">
            
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-cyan-400 [clip-path:polygon(100%_0,0_100%,100%_100%)] pointer-events-none" />

            {/* Operative Bio Info */}
            <div className="space-y-1.5 sm:space-y-2 z-10 w-full md:w-auto">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <div className="inline-block bg-[#00f0ff] text-[#020612] px-2.5 py-0.5 -skew-x-12 border-r-4 border-blue-800 shadow-[2px_2px_0px_0px_#001a66]">
                  <span className="font-black italic text-[9px] sm:text-[10px] tracking-widest uppercase">
                    SYSTEM ONLINE
                  </span>
                </div>
                <span className="font-mono text-[9px] sm:text-[10px] font-bold text-cyan-300 tracking-widest uppercase bg-p3-surface border border-cyan-500/40 px-2 py-0.5 -skew-x-6">
                  OPERATIVE_ID // ACTIVE
                </span>
              </div>

              <h1 className="font-black italic text-2xl xs:text-3xl sm:text-4xl md:text-5xl text-white -skew-x-4 sm:-skew-x-6 tracking-wider drop-shadow-[2px_2px_0px_#00f0ff] leading-tight">
                OPERATIVE DASHBOARD
              </h1>

              <div className="inline-flex items-center gap-2 bg-p3-surface border border-slate-700 px-2.5 py-1 -skew-x-6 shadow-[2px_2px_0px_0px_#000] max-w-full overflow-hidden">
                <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
                <span className="font-black italic text-[11px] sm:text-xs text-slate-300 tracking-wider truncate">
                  OPERATIVE: <strong className="text-white">{user_info.username.toUpperCase()}</strong> ({user_info.email})
                </span>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2.5 z-10 shrink-0 w-full md:w-auto">
              {isAdmin && (
                <button
                  onClick={() => navigate("/admin/dashboard")}
                  className="flex-1 md:flex-none group relative px-3 sm:px-4 py-2 sm:py-2.5 -skew-x-6 border-2 border-cyan-400 bg-linear-to-r from-blue-700 via-blue-600 to-cyan-600 text-white shadow-[3px_3px_0px_0px_#001a66] hover:shadow-[4px_4px_0px_0px_#00f0ff] hover:translate-x-0.5 cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="font-black italic text-[10px] sm:text-xs tracking-wider uppercase truncate">
                    ADMIN COMMAND
                  </span>
                </button>
              )}

              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="flex-1 md:flex-none group relative px-3 sm:px-4 py-2 sm:py-2.5 -skew-x-6 border-2 border-rose-400 bg-linear-to-r from-rose-800 via-rose-700 to-rose-600 text-white shadow-[3px_3px_0px_0px_#4c0519] hover:shadow-[4px_4px_0px_0px_#f43f5e] hover:translate-x-0.5 cursor-pointer flex items-center justify-center gap-1.5 transition-all"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-200 group-hover:-translate-x-0.5 transition-transform shrink-0" />
                <span className="font-black italic text-[10px] sm:text-xs tracking-wider uppercase truncate">
                  LOG OUT
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* INTERACTIVE NAVIGATION TABS BAR (OVERVIEW & QUIZZES ONLY) */}
        <nav className="w-full flex items-center gap-2 sm:gap-3 pt-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 sm:flex-none px-3.5 sm:px-6 py-2.5 sm:py-3 -skew-x-6 sm:-skew-x-12 border-2 font-black italic text-[11px] sm:text-xs tracking-wider sm:tracking-widest uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_0px_#000] ${
              activeTab === "overview"
                ? "bg-linear-to-r from-cyan-400 to-blue-600 text-p3-surface border-white shadow-[3px_3px_0px_0px_#00f0ff] translate-x-0.5"
                : "bg-p3-surface border-cyan-500/50 text-cyan-300 hover:border-cyan-400"
            }`}
          >
            <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>01 // OVERVIEW</span>
          </button>

          <button
            onClick={() => setActiveTab("quizzes")}
            className={`flex-1 sm:flex-none px-3.5 sm:px-6 py-2.5 sm:py-3 -skew-x-6 sm:-skew-x-12 border-2 font-black italic text-[11px] sm:text-xs tracking-wider sm:tracking-widest uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_0px_#000] ${
              activeTab === "quizzes"
                ? "bg-linear-to-r from-cyan-400 to-blue-600 text-p3-surface border-white shadow-[3px_3px_0px_0px_#00f0ff] translate-x-0.5"
                : "bg-p3-surface border-cyan-500/50 text-cyan-300 hover:border-cyan-400"
            }`}
          >
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>02 // QUIZZES</span>
          </button>
        </nav>

        {/* TAB CONTENT VIEW 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="w-full space-y-4 sm:space-y-6 animate-slash-reveal">
            
            {/* CONSOLIDATED 1-CARD OVERVIEW SHOWCASING ALL 3 METRICS */}
            <div className="group relative w-full">
              <div className="absolute -inset-1 sm:-inset-1.5 bg-linear-to-r from-blue-600/40 via-cyan-400/40 to-blue-800/40 -skew-x-3 sm:-skew-x-6 border border-cyan-400/30 pointer-events-none" />
              <div className="absolute -inset-0.5 sm:-inset-1 bg-p3-surface skew-x-2 sm:skew-x-3 border-2 border-cyan-400/40 shadow-[3px_3px_0px_0px_#000c29] pointer-events-none" />

              <div className="relative bg-p3-surface border-2 border-cyan-400 -skew-x-1 sm:-skew-x-2 p-3.5 sm:p-6 shadow-[5px_5px_0px_0px_#002288] sm:shadow-[8px_8px_0px_0px_#002288] transition-all duration-300">
                
                {/* Header Tag */}
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-2.5 mb-3 sm:mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-black italic text-[9px] sm:text-xs px-2 py-0.5 bg-cyan-400 text-p3-surface -skew-x-12 shadow-[2px_2px_0px_0px_#000]">
                      TELEMETRY METRICS
                    </span>
                    <span className="font-mono text-[9px] sm:text-xs text-cyan-300 uppercase tracking-wider hidden xs:inline-block">
                      OPERATIVE_PERFORMANCE
                    </span>
                  </div>
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                </div>

                {/* 3 Metrics Grid Inside ONE Card */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-6 divide-x divide-slate-800/80">
                  
                  {/* Metric 1: Total Completed */}
                  <div className="flex flex-col items-center sm:items-start px-1 sm:px-4 text-center sm:text-left">
                    <div className="flex items-center gap-1 text-[#00f0ff] mb-1">
                      <Activity className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                      <span className="font-black italic text-[8px] sm:text-xs tracking-wider uppercase truncate">
                        COMPLETED
                      </span>
                    </div>
                    <span className="font-black italic text-xl xs:text-2xl sm:text-4xl lg:text-5xl text-white tracking-wider drop-shadow-[2px_2px_0px_#00f0ff] my-0.5 sm:my-1">
                      {performance_summary.total_quizzes_completed}
                    </span>
                    <span className="font-mono text-[7.5px] sm:text-[10px] text-slate-400 uppercase tracking-tight">
                      QUIZZES
                    </span>
                  </div>

                  {/* Metric 2: Lifetime Accuracy */}
                  <div className="flex flex-col items-center sm:items-start px-1 sm:px-4 text-center sm:text-left">
                    <div className="flex items-center gap-1 text-[#00f0ff] mb-1">
                      <Target className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                      <span className="font-black italic text-[8px] sm:text-xs tracking-wider uppercase truncate">
                        ACCURACY
                      </span>
                    </div>
                    <span className="font-black italic text-xl xs:text-2xl sm:text-4xl lg:text-5xl text-white tracking-wider drop-shadow-[2px_2px_0px_#00f0ff] my-0.5 sm:my-1">
                      {performance_summary.lifetime_accuracy_rate}%
                    </span>
                    <span className="font-mono text-[7.5px] sm:text-[10px] text-slate-400 uppercase tracking-tight">
                      LIFETIME AVG
                    </span>
                  </div>

                  {/* Metric 3: Pressure Score */}
                  <div className="flex flex-col items-center sm:items-start px-1 sm:px-4 text-center sm:text-left">
                    <div className="flex items-center gap-1 text-[#00f0ff] mb-1">
                      <Zap className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                      <span className="font-black italic text-[8px] sm:text-xs tracking-wider uppercase truncate">
                        PRESSURE
                      </span>
                    </div>
                    <span className="font-black italic text-xl xs:text-2xl sm:text-4xl lg:text-5xl text-white tracking-wider drop-shadow-[2px_2px_0px_#00f0ff] my-0.5 sm:my-1">
                      {performance_summary.lifetime_pressure_score}
                    </span>
                    <span className="font-mono text-[7.5px] sm:text-[10px] text-slate-400 uppercase tracking-tight">
                      SCORE INDEX
                    </span>
                  </div>

                </div>

              </div>
            </div>

            {/* QUICK LAUNCH QUIZZES BANNER */}
            <div className="relative border-2 border-cyan-400 bg-p3-surface -skew-x-1 sm:-skew-x-2 p-4 sm:p-6 shadow-[5px_5px_0px_0px_#002288] sm:shadow-[8px_8px_0px_0px_#002288] flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="space-y-0.5 text-center sm:text-left">
                <span className="font-black italic text-[10px] sm:text-xs text-cyan-300 uppercase tracking-widest block">
                  TACTICAL ASSESSMENT READY
                </span>
                <h3 className="font-black italic text-lg sm:text-2xl text-white uppercase tracking-wider">
                  LAUNCH ACTIVE QUIZZES
                </h3>
              </div>
              <button
                onClick={() => setActiveTab("quizzes")}
                className="w-full sm:w-auto px-5 py-2.5 sm:py-3 -skew-x-6 border-2 border-cyan-400 bg-linear-to-r from-blue-700 to-cyan-600 text-white font-black italic text-xs tracking-widest uppercase transition-all shadow-[3px_3px_0px_0px_#001a66] hover:shadow-[4px_4px_0px_0px_#00f0ff] hover:translate-x-1 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>GO TO QUIZZES</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB CONTENT VIEW 2: QUIZZES */}
        {activeTab === "quizzes" && (
          <div className="w-full animate-slash-reveal">
            <div className="relative mb-3 sm:mb-4 flex items-center gap-3">
              <div className="inline-block bg-linear-to-r from-cyan-400 to-blue-600 text-p3-surface px-3.5 py-1 -skew-x-12 border-r-6 sm:border-r-8 border-blue-900 shadow-[3px_3px_0px_0px_#001a66]">
                <span className="font-black italic text-xs sm:text-sm tracking-widest uppercase">
                  AVAILABLE QUIZZES
                </span>
              </div>
              <div className="h-1 flex-1 bg-linear-to-r from-cyan-400/60 to-transparent -skew-x-12 hidden sm:block" />
            </div>

            <QuizList onViewResults={handleViewResults} />
          </div>
        )}
      </div>

      {/* RESULTS DOSSIER MODAL */}
      {selectedAttemptId && (
        <div className="fixed inset-0 bg-p3-surface/90 backdrop-blur-md z-50 flex items-center justify-center p-2.5 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[90vh] my-auto">
            <div className="absolute -inset-1 sm:-inset-2 bg-linear-to-r from-blue-600 via-cyan-400 to-blue-800 -skew-x-3 sm:-skew-x-6 opacity-40 border border-cyan-400/40 shadow-[0_0_35px_rgba(0,240,255,0.3)] pointer-events-none" />
            <div className="absolute -inset-0.5 sm:-inset-1 bg-p3-surface skew-x-2 sm:skew-x-3 border-2 border-cyan-400/50 shadow-[4px_4px_0px_0px_#000c29] pointer-events-none" />

            <div className="relative bg-p3-surface border-2 border-cyan-400 shadow-[8px_8px_0px_0px_#002288] -skew-x-1 sm:-skew-x-2 p-4 sm:p-8 flex flex-col gap-4 sm:gap-6 overflow-y-auto max-h-[85vh]">
              <div className="bg-linear-to-r from-blue-800 via-blue-600 to-cyan-500 text-white p-3 sm:p-4 -skew-x-3 border-b-2 border-cyan-300 shadow-[3px_3px_0px_0px_#001a66] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-200 shrink-0" />
                  <h2 className="font-black italic text-lg sm:text-2xl tracking-wider uppercase drop-shadow-[1px_1px_0px_#000]">
                    PERFORMANCE DOSSIER
                  </h2>
                </div>
                <span className="font-mono text-[10px] sm:text-xs font-bold bg-p3-surface text-cyan-300 px-2.5 py-0.5 -skew-x-6 border border-cyan-400/40">
                  DATA_ID // {selectedAttemptId.slice(0, 8).toUpperCase()}
                </span>
              </div>

              {loadingResults ? (
                <div className="py-12 sm:py-16 text-center">
                  <PersonaLoading message="EXTRACTING DOSSIER DATA..." />
                </div>
              ) : resultsError ? (
                <div className="p-4 bg-p3-surface border-2 border-rose-500 text-rose-200 font-black italic text-xs tracking-wider uppercase text-center shadow-[4px_4px_0px_0px_#9f1239]">
                  {resultsError}
                </div>
              ) : resultsData ? (
                (() => {
                  const stats = resultsData.research_stats;
                  const formattedDate = resultsData.finished_at
                    ? new Date(resultsData.finished_at).toLocaleString()
                    : "N/A";

                  return (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="border-b-2 border-slate-800 pb-3 sm:pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <span className="font-mono text-[9px] sm:text-[10px] text-cyan-300 uppercase tracking-widest block mb-1">
                            COMPLETED: {formattedDate}
                          </span>
                          <h3 className="font-black italic text-xl sm:text-3xl text-white -skew-x-4 tracking-wider">
                            {resultsData.title}
                          </h3>
                          <p className="font-black italic text-xs text-slate-400 mt-1">
                            {resultsData.message}
                          </p>
                        </div>

                        <div className="bg-p3-surface border-2 border-cyan-400 px-4 py-1.5 sm:py-2 -skew-x-6 shadow-[3px_3px_0px_0px_#001a66] flex flex-col items-center shrink-0">
                          <span className="font-mono text-[8px] sm:text-[9px] text-cyan-300 uppercase">PRESSURE GRADE</span>
                          <span className="font-black italic text-2xl sm:text-4xl text-cyan-300 drop-shadow-[1px_1px_0px_#000]">
                            {resultsData.pressure_score_grade}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
                        <div className="bg-p3-surface border-2 border-slate-700 hover:border-cyan-400 -skew-x-3 p-3 sm:p-4 text-center transition-colors shadow-[3px_3px_0px_0px_#002288]">
                          <span className="font-mono text-[8px] sm:text-[9px] text-cyan-300 uppercase tracking-wider block">ACCURACY RATE</span>
                          <span className="font-black italic text-2xl sm:text-4xl text-white my-1 block">
                            {Math.round(stats?.accuracy_rate ?? 0)}%
                          </span>
                          <span className="font-mono text-[8px] sm:text-[9px] text-slate-400 uppercase block truncate">
                            {resultsData.accuracy_integrity_lvl}
                          </span>
                        </div>

                        <div className="bg-p3-surface border-2 border-slate-700 hover:border-cyan-400 -skew-x-3 p-3 sm:p-4 text-center transition-colors shadow-[3px_3px_0px_0px_#002288]">
                          <span className="font-mono text-[8px] sm:text-[9px] text-cyan-300 uppercase tracking-wider block">SCORE BREAKDOWN</span>
                          <div className="flex items-center justify-center gap-1 my-1">
                            <span className="font-black italic text-lg sm:text-xl text-emerald-400 flex items-center">
                              <CheckCircle2 className="w-3 h-3 mr-0.5" />
                              {stats?.total_correct_answers ?? 0}
                            </span>
                            <span className="text-slate-500 text-xs">/</span>
                            <span className="font-black italic text-lg sm:text-xl text-rose-400 flex items-center">
                              <XCircle className="w-3 h-3 mr-0.5" />
                              {stats?.total_incorrect_answers ?? 0}
                            </span>
                            <span className="text-slate-500 text-xs">/</span>
                            <span className="font-black italic text-lg sm:text-xl text-amber-400 flex items-center">
                              <MinusCircle className="w-3 h-3 mr-0.5" />
                              {stats?.total_skipped_answers ?? 0}
                            </span>
                          </div>
                          <span className="font-mono text-[7px] sm:text-[8px] text-slate-400 uppercase block">
                            RIGHT / WRONG / SKIPPED
                          </span>
                        </div>

                        <div className="bg-p3-surface border-2 border-slate-700 hover:border-cyan-400 -skew-x-3 p-3 sm:p-4 text-center transition-colors shadow-[3px_3px_0px_0px_#002288]">
                          <span className="font-mono text-[8px] sm:text-[9px] text-cyan-300 uppercase tracking-wider block">AVG RESPONSE</span>
                          <span className="font-black italic text-2xl sm:text-4xl text-white my-1 block">
                            {stats?.avg_response_time ?? 0}s
                          </span>
                          <span className="font-mono text-[8px] sm:text-[9px] text-slate-400 uppercase block">
                            TOTAL: {stats?.sum_taken_secs ?? 0}s
                          </span>
                        </div>

                        <div className="bg-p3-surface border-2 border-slate-700 hover:border-cyan-400 -skew-x-3 p-3 sm:p-4 text-center transition-colors shadow-[3px_3px_0px_0px_#002288]">
                          <span className="font-mono text-[8px] sm:text-[9px] text-cyan-300 uppercase tracking-wider block">PRESSURE INDEX</span>
                          <span className="font-black italic text-2xl sm:text-4xl text-cyan-300 my-1 block">
                            {stats?.pressure_score ?? 0}
                          </span>
                          <span className="font-mono text-[8px] sm:text-[9px] text-slate-400 uppercase block truncate">
                            {resultsData.pressure_score_info}
                          </span>
                        </div>
                      </div>

                      <div className="bg-p3-surface border-l-4 border-cyan-400 p-3 sm:p-4 font-mono text-[11px] sm:text-xs text-cyan-200 -skew-x-2 shadow-[3px_3px_0px_0px_#001a66] space-y-1.5">
                        <div className="flex items-center gap-1.5 text-cyan-400 font-bold border-b border-slate-800 pb-1">
                          <Sparkles className="w-3.5 h-3.5 shrink-0" />
                          <span>TELEMETRY EVALUATION DIAGNOSIS</span>
                        </div>
                        <p>
                          <strong className="text-white">Classification:</strong> {resultsData.accuracy_classification}
                        </p>
                        <p>
                          <strong className="text-white">Pacing Velocity:</strong> {resultsData.avg_rs_pacing_velocity}
                        </p>
                        <p>
                          <strong className="text-white">Diagnosis:</strong> {resultsData.avg_rs_diagnosis}
                        </p>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={closeResultsModal}
                          className="px-5 py-2 sm:py-2.5 -skew-x-6 border-2 border-cyan-400 bg-linear-to-r from-blue-700 to-cyan-600 text-white font-black italic text-xs tracking-widest uppercase transition-all shadow-[3px_3px_0px_0px_#001a66] hover:shadow-[4px_4px_0px_0px_#00f0ff] hover:translate-x-1 cursor-pointer flex items-center gap-1.5"
                        >
                          <X className="w-4 h-4" />
                          <span>CLOSE REPORT</span>
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT MODAL */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-p3-surface/90 backdrop-blur-sm z-50 flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md">
            <div className="absolute -inset-1 sm:-inset-2 bg-linear-to-r from-rose-700 via-red-600 to-rose-900 -skew-x-3 sm:-skew-x-6 opacity-40 border border-rose-500/50 shadow-[0_0_25px_rgba(244,63,94,0.3)] pointer-events-none" />
            <div className="absolute -inset-0.5 sm:-inset-1 bg-p3-surface skew-x-2 sm:skew-x-3 border-2 border-rose-500/60 shadow-[4px_4px_0px_0px_#4c0519] pointer-events-none" />

            <div className="relative bg-p3-surface text-white p-5 sm:p-8 -skew-x-1 sm:-skew-x-2 border-2 border-rose-500 shadow-[6px_6px_0px_0px_#9f1239] space-y-4">
              <div className="flex items-center gap-2 text-rose-500 border-b border-rose-900/80 pb-2">
                <ShieldAlert className="w-5 h-5 shrink-0 animate-bounce" />
                <h3 className="font-black italic text-lg sm:text-xl uppercase tracking-wider -skew-x-4 text-white">
                  CONFIRM DEAUTHENTICATION
                </h3>
              </div>
              
              <p className="font-black italic text-[11px] sm:text-xs text-rose-200 leading-relaxed">
                ARE YOU SURE YOU WANT TO TERMINATE THIS OPERATIVE SESSION?
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="px-3.5 py-1.5 sm:py-2 -skew-x-6 border-2 border-slate-700 bg-p3-surface text-slate-300 font-black italic text-[11px] sm:text-xs tracking-wider uppercase hover:border-white transition-all cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-4 py-1.5 sm:py-2 -skew-x-6 border-2 border-rose-400 bg-linear-to-r from-rose-700 to-red-600 text-white font-black italic text-[11px] sm:text-xs tracking-wider uppercase shadow-[3px_3px_0px_0px_#4c0519] hover:shadow-[4px_4px_0px_0px_#f43f5e] hover:translate-x-0.5 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>LOGOUT</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
