import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getAdminDashboardApi, getUserDashboardApi } from "../../services/dashboard.service";
import { getActiveQuizzesApi } from "../../services/quiz.service";
import type { Quiz } from "../../types/quiz.types";
import Footer from "../../components/ui/Footer";

// Interface matching the user dashboard performance_summary payload
interface PerformanceSummary {
  total_quizzes_completed: number;
  lifetime_accuracy_rate: number;
  lifetime_pressure_score: number;
}

// Updated interface strictly matching FastAPI system_metrics payload
interface AdminSystemMetrics {
  total_registered_users: number;
  total_quizzes_created: number;
  live_active_attempts: number;
  status?: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [viewMode, setViewMode] = useState<"ADMIN" | "USER">("ADMIN");

  const [adminMetrics, setAdminMetrics] = useState<AdminSystemMetrics | null>(null);
  const [userMetrics, setUserMetrics] = useState<PerformanceSummary | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);

  const btnBase = "px-3 sm:px-4 py-2 font-jakarta font-extrabold text-xs -skew-x-8 italic tracking-wider uppercase transition-colors cursor-pointer shadow-md inline-flex items-center justify-center whitespace-nowrap";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [adminData, userData, quizData] = await Promise.all([
          getAdminDashboardApi().catch(() => null),
          getUserDashboardApi().catch(() => null),
          getActiveQuizzesApi().catch(() => []),
        ]);

        if (adminData) {
          // Extract system_metrics from FastAPI response
          const systemMetrics = adminData.system_metrics || adminData.metrics || adminData;
          setAdminMetrics(systemMetrics as AdminSystemMetrics);
        }
        
        if (userData) {
          const performance = userData.performance_summary || userData;
          setUserMetrics(performance as PerformanceSummary);
        }
        
        setQuizzes(quizData);
      } catch (err: any) {
        setError("FAILED TO SYNC DASHBOARD DATA");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const confirmLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      navigate("/login");
    }
  };

  const toggleMoreInfo = (id: string) => {
    setExpandedQuizId((prev) => (prev === id ? null : id));
  };

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return new Date().toLocaleString();
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? new Date().toLocaleString() : parsed.toLocaleString();
  };

  const getStatusBadgeStyle = (statusStr: string) => {
    switch (statusStr.toUpperCase()) {
      case "ACTIVE":
        return "bg-emerald-400 text-slate-950 border-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.4)]";
      case "PUBLISHED":
        return "bg-cyan-400 text-slate-950 border-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.4)]";
      case "PENDING":
        return "bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.4)]";
      case "COMPLETED":
        return "bg-purple-600 text-white border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]";
      default:
        return "bg-p3-primary text-p3-highlight border-p3-accent";
    }
  };

  const filteredQuizzes = quizzes.filter((quiz: any) => {
    if (activeFilter === "ALL") return true;
    const status = (quiz.status || "PENDING").toUpperCase();
    return status === activeFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-p3-primary font-kanit italic text-2xl tracking-wider animate-pulse select-none">
        LOADING DATA...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 select-none">
        <div className="bg-red-100 text-red-600 font-jakarta font-extrabold -skew-x-8 px-6 py-4 rounded text-center">
          {error}
        </div>
      </div>
    );
  }

  const adminId = user?.id || "ADM-9942";
  const username = user?.username || user?.email || "OPERATOR";

  // Aligned metric values with performance_summary schema
  const userQuizzesCompleted = userMetrics?.total_quizzes_completed ?? 0;
  const userAccuracy = userMetrics?.lifetime_accuracy_rate ?? 0;
  const userPressureScore = userMetrics?.lifetime_pressure_score ?? 0;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-8 select-none overflow-x-hidden">
      <div className="w-full flex flex-col items-center">
        {/* Header Section */}
        <header className="group relative w-full max-w-4xl my-6 flex flex-col sm:flex-row items-center justify-between p-6 transition-all duration-200 ease-out hover:translate-x-1 gap-4">
          <div className="absolute inset-0 bg-p3-highlight -skew-x-3 -z-1 group-hover:-skew-x-6 transition-transform"></div>
          <div className="absolute bg-p3-primary skew-x-6 h-[104%] w-[105%] left-1/2 -translate-x-1/2 -z-2 group-hover:skew-x-8 transition-transform"></div>
          <div className="absolute bg-p3-accent -skew-x-8 h-[108%] w-[110%] left-1/2 -translate-x-1/2 -z-3 group-hover:-skew-x-12 transition-transform"></div>

          <div className="z-10">
            <h1 className="font-extrabold italic text-3xl sm:text-5xl text-p3-primary font-kanit -skew-x-8 tracking-wide">
              {viewMode === "ADMIN" ? "ADMIN DASHBOARD" : "USER DASHBOARD"}
            </h1>
            <p className="font-rajdhani font-bold italic text-xs sm:text-sm text-p3-muted -skew-x-6 uppercase tracking-wider mt-1">
              MODE: {viewMode} | USER: <span className="text-p3-primary font-extrabold">{username}</span> | ID: <span className="text-p3-primary font-extrabold">{adminId}</span>
            </p>
          </div>

          {/* Controls */}
          <div className="z-10 flex items-center gap-2 flex-nowrap shrink-0 justify-center sm:justify-end">
            <button
              onClick={() => setViewMode((prev) => (prev === "ADMIN" ? "USER" : "ADMIN"))}
              className={`${btnBase} bg-p3-accent text-p3-primary hover:bg-p3-primary hover:text-p3-highlight border border-p3-primary`}
            >
              {viewMode === "ADMIN" ? "USER VIEW" : "ADMIN VIEW"}
            </button>

            <div className={`${btnBase} bg-p3-primary text-p3-highlight cursor-default shadow-none`}>
              MODE: {viewMode}
            </div>

            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className={`${btnBase} bg-red-600 text-white hover:bg-red-700`}
            >
              LOG OUT
            </button>
          </div>
        </header>

        {/* Metrics Grid */}
        <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {viewMode === "ADMIN" ? (
            <>
              {/* Total Quizzes Created */}
              <div className="group relative p-6 flex flex-col items-center justify-center min-h-40 transition-all duration-200 ease-out hover:scale-[1.02] hover:-translate-y-1 cursor-pointer">
                <div className="absolute inset-0 bg-p3-highlight -skew-x-3 -z-1 group-hover:-skew-x-6 transition-transform"></div>
                <div className="absolute bg-p3-primary skew-x-6 h-[104%] w-[105%] left-1/2 -translate-x-1/2 -z-2 group-hover:skew-x-8 transition-transform"></div>
                <div className="absolute bg-p3-accent -skew-x-8 h-[108%] w-[110%] left-1/2 -translate-x-1/2 -z-3 group-hover:-skew-x-12 transition-transform"></div>

                <span className="font-rajdhani font-bold italic text-xs text-p3-muted -skew-x-6 uppercase tracking-wider">
                  TOTAL ASSESSMENTS
                </span>
                <span className="font-kanit font-extrabold italic text-4xl sm:text-5xl text-p3-primary -skew-x-8 my-2">
                  {adminMetrics?.total_quizzes_created ?? quizzes.length}
                </span>
                <span className="font-jakarta text-xs text-p3-muted italic">
                  CREATED MODULES
                </span>
              </div>

              {/* Total Registered Users */}
              <div className="group relative p-6 flex flex-col items-center justify-center min-h-40 transition-all duration-200 ease-out hover:scale-[1.02] hover:-translate-y-1 cursor-pointer">
                <div className="absolute inset-0 bg-p3-highlight -skew-x-3 -z-1 group-hover:-skew-x-6 transition-transform"></div>
                <div className="absolute bg-p3-primary skew-x-6 h-[104%] w-[105%] left-1/2 -translate-x-1/2 -z-2 group-hover:skew-x-8 transition-transform"></div>
                <div className="absolute bg-p3-accent -skew-x-8 h-[108%] w-[110%] left-1/2 -translate-x-1/2 -z-3 group-hover:-skew-x-12 transition-transform"></div>

                <span className="font-rajdhani font-bold italic text-xs text-p3-muted -skew-x-6 uppercase tracking-wider">
                  REGISTERED USERS
                </span>
                <span className="font-kanit font-extrabold italic text-4xl sm:text-5xl text-p3-primary -skew-x-8 my-2">
                  {adminMetrics?.total_registered_users ?? 0}
                </span>
                <span className="font-jakarta text-xs text-p3-muted italic">
                  TOTAL ACCOUNTS
                </span>
              </div>

              {/* Live Active Attempts */}
              <div className="group relative p-6 flex flex-col items-center justify-center min-h-40 transition-all duration-200 ease-out hover:scale-[1.02] hover:-translate-y-1 cursor-pointer">
                <div className="absolute inset-0 bg-p3-highlight -skew-x-3 -z-1 group-hover:-skew-x-6 transition-transform"></div>
                <div className="absolute bg-p3-primary skew-x-6 h-[104%] w-[105%] left-1/2 -translate-x-1/2 -z-2 group-hover:skew-x-8 transition-transform"></div>
                <div className="absolute bg-p3-accent -skew-x-8 h-[108%] w-[110%] left-1/2 -translate-x-1/2 -z-3 group-hover:-skew-x-12 transition-transform"></div>

                <span className="font-rajdhani font-bold italic text-xs text-p3-muted -skew-x-6 uppercase tracking-wider">
                  LIVE ACTIVE ATTEMPTS
                </span>
                <span className="font-kanit font-extrabold italic text-4xl sm:text-5xl text-p3-primary -skew-x-8 my-2">
                  {adminMetrics?.live_active_attempts ?? 0}
                </span>
                <span className="font-jakarta text-xs text-p3-muted italic">
                  IN-PROGRESS SESSIONS
                </span>
              </div>
            </>
          ) : (
            <>
              {/* User Metric 1: Total Completed */}
              <div className="group relative p-6 flex flex-col items-center justify-center min-h-40 transition-all duration-200 ease-out hover:scale-[1.02] hover:-translate-y-1 cursor-pointer">
                <div className="absolute inset-0 bg-p3-highlight -skew-x-3 -z-1 group-hover:-skew-x-6 transition-transform"></div>
                <div className="absolute bg-p3-primary skew-x-6 h-[104%] w-[105%] left-1/2 -translate-x-1/2 -z-2 group-hover:skew-x-8 transition-transform"></div>
                <div className="absolute bg-p3-accent -skew-x-8 h-[108%] w-[110%] left-1/2 -translate-x-1/2 -z-3 group-hover:-skew-x-12 transition-transform"></div>

                <span className="font-rajdhani font-bold italic text-xs text-p3-muted -skew-x-6 uppercase tracking-wider">
                  TOTAL COMPLETED
                </span>
                <span className="font-kanit font-extrabold italic text-4xl sm:text-5xl text-p3-primary -skew-x-8 my-2">
                  {userQuizzesCompleted}
                </span>
                <span className="font-jakarta text-xs text-p3-muted italic">
                  QUIZZES
                </span>
              </div>

              {/* User Metric 2: Lifetime Accuracy */}
              <div className="group relative p-6 flex flex-col items-center justify-center min-h-40 transition-all duration-200 ease-out hover:scale-[1.02] hover:-translate-y-1 cursor-pointer">
                <div className="absolute inset-0 bg-p3-highlight -skew-x-3 -z-1 group-hover:-skew-x-6 transition-transform"></div>
                <div className="absolute bg-p3-primary skew-x-6 h-[104%] w-[105%] left-1/2 -translate-x-1/2 -z-2 group-hover:skew-x-8 transition-transform"></div>
                <div className="absolute bg-p3-accent -skew-x-8 h-[108%] w-[110%] left-1/2 -translate-x-1/2 -z-3 group-hover:-skew-x-12 transition-transform"></div>

                <span className="font-rajdhani font-bold italic text-xs text-p3-muted -skew-x-6 uppercase tracking-wider">
                  LIFETIME ACCURACY
                </span>
                <span className="font-kanit font-extrabold italic text-4xl sm:text-5xl text-p3-primary -skew-x-8 my-2">
                  {userAccuracy}%
                </span>
                <span className="font-jakarta text-xs text-p3-muted italic">
                  AVERAGE RATE
                </span>
              </div>

              {/* User Metric 3: Pressure Score */}
              <div className="group relative p-6 flex flex-col items-center justify-center min-h-40 transition-all duration-200 ease-out hover:scale-[1.02] hover:-translate-y-1 cursor-pointer">
                <div className="absolute inset-0 bg-p3-highlight -skew-x-3 -z-1 group-hover:-skew-x-6 transition-transform"></div>
                <div className="absolute bg-p3-primary skew-x-6 h-[104%] w-[105%] left-1/2 -translate-x-1/2 -z-2 group-hover:skew-x-8 transition-transform"></div>
                <div className="absolute bg-p3-accent -skew-x-8 h-[108%] w-[110%] left-1/2 -translate-x-1/2 -z-3 group-hover:-skew-x-12 transition-transform"></div>

                <span className="font-rajdhani font-bold italic text-xs text-p3-muted -skew-x-6 uppercase tracking-wider">
                  PRESSURE SCORE
                </span>
                <span className="font-kanit font-extrabold italic text-4xl sm:text-5xl text-p3-primary -skew-x-8 my-2">
                  {userPressureScore > 0 ? userPressureScore.toFixed(2) : "0.00"}
                </span>
                <span className="font-jakarta text-xs text-p3-muted italic">
                  INDEX RATING
                </span>
              </div>
            </>
          )}
        </main>

        {/* Assessment Module List */}
        <section className="w-full max-w-4xl mt-10 flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
            <div>
              <h2 className="font-kanit font-extrabold italic text-xl sm:text-2xl text-p3-primary -skew-x-6 tracking-wide">
                {viewMode === "ADMIN" ? "SYSTEM ASSESSMENTS" : "AVAILABLE ASSESSMENTS"}
              </h2>
              <p className="font-rajdhani font-bold italic text-xs text-p3-muted uppercase tracking-wider">
                SHOWING: {filteredQuizzes.length} OF {quizzes.length} ACTIVE
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {["ALL", "ACTIVE", "PUBLISHED", "PENDING", "COMPLETED"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1 font-jakarta font-extrabold text-[10px] -skew-x-8 italic tracking-wider uppercase transition-colors cursor-pointer border ${
                    activeFilter === filter
                      ? "bg-p3-primary text-p3-highlight border-p3-primary"
                      : "bg-p3-surface/60 text-p3-muted border-p3-primary/20 hover:border-p3-primary/60 hover:text-p3-primary"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {filteredQuizzes.length === 0 ? (
              <div className="relative p-8 text-center border-2 border-dashed border-p3-muted/40">
                <p className="font-rajdhani font-bold italic text-sm text-p3-muted">
                  [ NO ASSESSMENTS FOUND MATCHING FILTER: {activeFilter} ]
                </p>
              </div>
            ) : (
              filteredQuizzes.map((quiz: any) => {
                const quizId = quiz.id || quiz._id;
                const isExpanded = expandedQuizId === quizId;
                const quizStatus = quiz.status || "PENDING";

                const totalQuestions = quiz.total_questions || quiz.questions?.length || 5;
                const timeLimitVal = quiz.time_limit_sec ?? quiz.time_limit;
                const timeLimitText = timeLimitVal ? `${timeLimitVal}S` : "NONE";

                const timePerQuestionVal = quiz.time_per_question_sec ?? quiz.time_per_question;
                const timePerQuestionText = timePerQuestionVal
                  ? `${timePerQuestionVal} SECONDS`
                  : "NONE (GLOBAL LIMIT)";

                const allowBacktracking = quiz.allow_backtracking ?? quiz.allow_backtrack ?? false;
                const allowSynchronous = quiz.allow_synchronous ?? (quiz.sync_mode === "SYNCHRONOUS");

                return (
                  <div
                    key={quizId}
                    className="group relative p-6 flex flex-col transition-all duration-200 ease-out hover:translate-x-1"
                  >
                    <div className="absolute inset-0 bg-p3-highlight -skew-x-3 -z-1 group-hover:-skew-x-6 transition-transform"></div>
                    <div className="absolute bg-p3-primary skew-x-6 h-[104%] w-[105%] left-1/2 -translate-x-1/2 -z-2 group-hover:skew-x-8 transition-transform"></div>
                    <div className="absolute bg-p3-accent -skew-x-8 h-[108%] w-[110%] left-1/2 -translate-x-1/2 -z-3 group-hover:-skew-x-12 transition-transform"></div>

                    <div className="z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex flex-col max-w-xl min-w-0">
                        <div className="flex items-center space-x-2 mb-1.5 flex-wrap gap-y-1">
                          <span className={`px-2 py-0.5 text-[10px] font-jakarta font-black -skew-x-8 tracking-widest uppercase border ${getStatusBadgeStyle(quizStatus)}`}>
                            {quizStatus}
                          </span>

                          <span className="font-rajdhani font-bold italic text-xs text-p3-muted -skew-x-6 uppercase tracking-wider">
                            QUESTIONS: {totalQuestions} / TIME LIMIT: {timeLimitText}
                          </span>
                        </div>

                        <h3 className="font-kanit font-extrabold italic text-xl sm:text-2xl text-p3-primary -skew-x-6 tracking-wide wrap-break-word">
                          {quiz.title || "UNTITLED ASSESSMENT"}
                        </h3>
                        <p className="font-jakarta text-xs sm:text-sm text-p3-muted italic mt-1 leading-relaxed">
                          {quiz.description || "Operational assessment module ready for execution."}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-nowrap shrink-0 self-end md:self-center">
                        <button
                          onClick={() => toggleMoreInfo(quizId)}
                          className={`${btnBase} bg-transparent border-2 border-p3-primary text-p3-primary hover:bg-p3-primary hover:text-p3-highlight shadow-none`}
                        >
                          {isExpanded ? "HIDE DETAILS ▲" : "MORE INFO ▼"}
                        </button>

                        {viewMode === "ADMIN" ? (
                          <>
                            <a
                              href={`/admin/quiz/${quizId}/edit`}
                              className={`${btnBase} bg-p3-primary text-p3-highlight hover:bg-p3-surface hover:text-p3-primary`}
                            >
                              EDIT
                            </a>
                            <a
                              href={`/admin/quiz/${quizId}/analytics`}
                              className={`${btnBase} bg-p3-accent text-p3-primary hover:bg-p3-primary hover:text-p3-highlight`}
                            >
                              ANALYTICS
                            </a>
                          </>
                        ) : (
                          <a
                            href={`/quiz/${quizId}`}
                            className={`${btnBase} bg-p3-primary text-p3-highlight hover:bg-p3-surface hover:text-p3-primary`}
                          >
                            {quizStatus === "COMPLETED" ? "VIEW RESULTS" : "START ASSESSMENT"}
                          </a>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="z-10 mt-5 pt-4 border-t border-p3-primary/20 grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-6">
                        <div>
                          <span className="block font-rajdhani font-bold italic text-xs text-p3-muted -skew-x-6 uppercase tracking-wider mb-0.5">
                            TIME PER QUESTION
                          </span>
                          <span className="font-kanit font-extrabold italic text-sm text-p3-primary -skew-x-6 uppercase">
                            {timePerQuestionText}
                          </span>
                        </div>

                        <div>
                          <span className="block font-rajdhani font-bold italic text-xs text-p3-muted -skew-x-6 uppercase tracking-wider mb-0.5">
                            MAX SCORE & ATTEMPTS
                          </span>
                          <span className="font-kanit font-extrabold italic text-sm text-p3-primary -skew-x-6 uppercase">
                            {quiz.max_score || 100} PTS / {quiz.max_attempts || 1} ATTEMPT(S)
                          </span>
                        </div>

                        <div>
                          <span className="block font-rajdhani font-bold italic text-xs text-p3-muted -skew-x-6 uppercase tracking-wider mb-0.5">
                            NAVIGATION RULES
                          </span>
                          <div className="font-kanit font-extrabold italic text-xs text-p3-primary -skew-x-6 uppercase leading-snug">
                            <div>Backtracking: {allowBacktracking ? "ENABLED" : "DISABLED"}</div>
                            <div>Sync Mode: {allowSynchronous ? "SYNCHRONOUS" : "STANDARD"}</div>
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <span className="block font-rajdhani font-bold italic text-xs text-p3-muted -skew-x-6 uppercase tracking-wider mb-0.5">
                            DEPLOYMENT CREATOR ID / AGENT
                          </span>
                          <span className="font-kanit font-extrabold italic text-xs text-p3-primary -skew-x-6 break-all">
                            {quiz.created_by || quiz.creator_id || adminId}
                          </span>
                        </div>

                        <div>
                          <span className="block font-rajdhani font-bold italic text-xs text-p3-muted -skew-x-6 uppercase tracking-wider mb-0.5">
                            DEPLOYED AT (UTC)
                          </span>
                          <span className="font-kanit font-extrabold italic text-xs text-p3-primary -skew-x-6">
                            {formatTimestamp(quiz.created_at)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* Logout Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="relative bg-p3-surface p-6 max-w-md w-full border-2 border-red-600 shadow-2xl -skew-x-2">
            <h3 className="font-kanit font-extrabold italic text-xl text-red-500 mb-2 uppercase tracking-wide">
              CONFIRM LOGOUT
            </h3>
            <p className="font-jakarta text-xs text-p3-muted italic mb-6">
              Are you sure you want to log out? Your session token will be invalidated.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className={`${btnBase} bg-p3-primary text-p3-highlight hover:opacity-90`}
              >
                CANCEL
              </button>
              <button
                onClick={confirmLogout}
                className={`${btnBase} bg-red-600 text-white hover:bg-red-700`}
              >
                LOG OUT
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="w-full max-w-4xl mt-12 mb-2 flex flex-col items-center justify-center text-center">
        <Footer />
      </footer>
    </div>
  );
}
