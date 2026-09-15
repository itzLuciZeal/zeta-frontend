import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { 
  getAdminDashboardApi, 
  getUserDashboardApi, 
  getLiveQuizSessionApi,
  getQuizOverallAnalyticsApi,
  getQuizParticipantsApi,
} from "../../services/dashboard.service";
import type { QuizParticipantTelemetry, QuizOverallAnalytics } from "../../types/dashboard.types";
import { getActiveQuizzesApi } from "../../services/quiz.service";
import { fetchQuizItemAnalysis } from "../../services/analyticsService";
import type { Quiz } from "../../types/quiz.types";
import type { QuizItemAnalysisResponse } from "../../types/analytics.types";
import Footer from "../../components/ui/Footer";

interface PerformanceSummary {
  total_quizzes_completed: number;
  lifetime_accuracy_rate: number;
  lifetime_pressure_score: number;
}

interface AdminSystemMetrics {
  total_registered_users: number;
  total_quizzes_created: number;
  live_active_attempts: number;
  status?: string;
}

interface LiveQuizUserRoster {
  user_id: string;
  username: string;
  status: string;
  started_at: string | null;
  expires_at: string | null;
  current_question_index: number | null;
  slot_elapsed_sec: number | null;
  completed_at: string | null;
}

interface LiveQuizSummary {
  assigned_total: number;
  not_started_count: number;
  in_progress_count: number;
  completed_count: number;
  expired_count: number;
}

interface LiveQuizSessionResponse {
  quiz_details: Quiz;
  summary: LiveQuizSummary;
  roster: LiveQuizUserRoster[];
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

  // Per-Quiz Expanded Analytics & Participants State (Admin View)
  const [quizAnalyticsMap, setQuizAnalyticsMap] = useState<Record<string, QuizOverallAnalytics>>({});
  const [quizParticipantsMap, setQuizParticipantsMap] = useState<Record<string, QuizParticipantTelemetry[]>>({});
  const [quizSearchMap, setQuizSearchMap] = useState<Record<string, string>>({});
  const [loadingExpandedMap, setLoadingExpandedMap] = useState<Record<string, boolean>>({});

  // Live Telemetry State
  const [selectedLiveQuizId, setSelectedLiveQuizId] = useState<string | null>(null);
  const [liveSessionData, setLiveSessionData] = useState<LiveQuizSessionResponse | null>(null);
  const [isLiveModalLoading, setIsLiveModalLoading] = useState<boolean>(false);

  // Quiz Item Analytics State
  const [selectedAnalyticsQuizId, setSelectedAnalyticsQuizId] = useState<string | null>(null);
  const [quizAnalyticsData, setQuizAnalyticsData] = useState<QuizItemAnalysisResponse | null>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState<boolean>(false);

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

  // Fetch expanded analytics & participants when a quiz is expanded in ADMIN mode
  useEffect(() => {
    if (!expandedQuizId || viewMode !== "ADMIN") return;

    const fetchExpandedData = async (searchQuery?: string) => {
      try {
        setLoadingExpandedMap((prev) => ({ ...prev, [expandedQuizId]: true }));
        const [analyticsRes, participantsRes] = await Promise.all([
          getQuizOverallAnalyticsApi(expandedQuizId).catch(() => null),
          getQuizParticipantsApi(expandedQuizId, searchQuery).catch(() => []),
        ]);

        if (analyticsRes) {
          setQuizAnalyticsMap((prev) => ({ ...prev, [expandedQuizId]: analyticsRes }));
        }
        setQuizParticipantsMap((prev) => ({ ...prev, [expandedQuizId]: participantsRes }));
      } catch (err) {
        console.error("Failed to load expanded quiz analytics:", err);
      } finally {
        setLoadingExpandedMap((prev) => ({ ...prev, [expandedQuizId]: false }));
      }
    };

    const currentQuery = quizSearchMap[expandedQuizId] || "";
    fetchExpandedData(currentQuery);
  }, [expandedQuizId, viewMode, quizSearchMap]);

  useEffect(() => {
    if (!selectedLiveQuizId) return;

    const fetchLive = async () => {
      try {
        const data = await getLiveQuizSessionApi(selectedLiveQuizId);
        setLiveSessionData(data);
      } catch (err) {
        console.error("Failed to fetch live session telemetry:", err);
      } finally {
        setIsLiveModalLoading(false);
      }
    };

    fetchLive();
    const interval = setInterval(fetchLive, 4000);
    return () => clearInterval(interval);
  }, [selectedLiveQuizId]);

  useEffect(() => {
    if (!selectedAnalyticsQuizId) return;

    const fetchAnalytics = async () => {
      try {
        setIsAnalyticsLoading(true);
        const data = await fetchQuizItemAnalysis(selectedAnalyticsQuizId);
        setQuizAnalyticsData(data);
      } catch (err) {
        console.error("Failed to fetch item analytics:", err);
        setQuizAnalyticsData(null);
      } finally {
        setIsAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedAnalyticsQuizId]);

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
    if (!dateStr) return "N/A";
    try {
      const parsed = new Date(dateStr);
      if (isNaN(parsed.getTime())) return dateStr;
      const month = parsed.getUTCMonth() + 1;
      const day = parsed.getUTCDate();
      const year = parsed.getUTCFullYear();
      let hours = parsed.getUTCHours();
      const minutes = parsed.getUTCMinutes();
      const seconds = parsed.getUTCSeconds();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minStr = minutes < 10 ? `0${minutes}` : minutes;
      const secStr = seconds < 10 ? `0${seconds}` : seconds;
      return `${month}/${day}/${year}, ${hours}:${minStr}:${secStr} ${ampm} UTC`;
    } catch {
      return dateStr;
    }
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
      case "EXPIRED":
        return "bg-red-600 text-white border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.4)]";
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

  const userQuizzesCompleted = userMetrics?.total_quizzes_completed ?? 0;
  const userAccuracy = userMetrics?.lifetime_accuracy_rate ?? 0;
  const userPressureScore = userMetrics?.lifetime_pressure_score ?? 0;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-8 pb-28 select-none overflow-x-hidden">
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

            <div className="flex items-center gap-3 flex-wrap">
              {viewMode === "ADMIN" && (
                <button
                  onClick={() => navigate("/admin/quiz/create")}
                  className={`${btnBase} bg-emerald-400 text-slate-950 hover:bg-emerald-300 border border-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.5)] flex items-center gap-1.5`}
                >
                  <span className="text-base font-black leading-none">+</span> CREATE QUIZ
                </button>
              )}

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
          </div>

          <div className="grid grid-cols-1 gap-10 mb-16">
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

                const analytics = quizAnalyticsMap[quizId];
                const participants = quizParticipantsMap[quizId] || [];
                const isExpandedLoading = loadingExpandedMap[quizId] ?? false;
                const searchQuery = quizSearchMap[quizId] || "";

                return (
                  <div
                    key={quizId}
                    className="group relative p-6 flex flex-col transition-all duration-200 ease-out hover:translate-x-1 mb-4"
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
                            <button
                              onClick={() => {
                                setSelectedLiveQuizId(quizId);
                                setIsLiveModalLoading(true);
                              }}
                              className={`${btnBase} bg-emerald-400 text-slate-950 hover:bg-emerald-300 border border-emerald-300`}
                            >
                              LIVE
                            </button>
                            <button
                              onClick={() => navigate(`/admin/quiz/${quizId}/edit`)}
                              className={`${btnBase} bg-p3-primary text-p3-highlight hover:bg-p3-surface hover:text-p3-primary`}
                            >
                              EDIT
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAnalyticsQuizId(quizId);
                                setIsAnalyticsLoading(true);
                              }}
                              className={`${btnBase} bg-p3-accent text-p3-primary hover:bg-p3-primary hover:text-p3-highlight border border-p3-primary`}
                            >
                              ANALYTICS
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => navigate(`/quiz/${quizId}`)}
                            className={`${btnBase} bg-p3-primary text-p3-highlight hover:bg-p3-surface hover:text-p3-primary`}
                          >
                            {quizStatus === "COMPLETED" ? "VIEW RESULTS" : "START ASSESSMENT"}
                          </button>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="z-10 mt-5 pt-4 border-t border-p3-primary/20 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-6">
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

                          <div>
                            <span className="block font-rajdhani font-bold italic text-xs text-p3-muted -skew-x-6 uppercase tracking-wider mb-0.5">
                              DEPLOYMENT CREATOR ID
                            </span>
                            <span className="font-kanit font-extrabold italic text-xs text-p3-primary -skew-x-6 uppercase break-all">
                              {quiz.created_by || quiz.deployment_creator_id || quiz.creator_id || quiz.user_id || "N/A"}
                            </span>
                          </div>

                          <div>
                            <span className="block font-rajdhani font-bold italic text-xs text-p3-muted -skew-x-6 uppercase tracking-wider mb-0.5">
                              DEPLOYED / CREATED AT
                            </span>
                            <span className="font-kanit font-extrabold italic text-xs text-p3-primary -skew-x-6 uppercase">
                              {formatTimestamp(quiz.created_at || quiz.activated_at || quiz.deployed_at || quiz.published_at)}
                            </span>
                          </div>
                        </div>

                        {/* Overall Analytics & Participant Telemetry (Admin Only) */}
                        {viewMode === "ADMIN" && (
                          <div className="mt-6 pt-4 border-t border-p3-primary/30 space-y-5">
                            <div className="flex items-center justify-between">
                              <h4 className="font-kanit font-extrabold italic text-base text-p3-primary uppercase tracking-wide">
                                [ OVERALL QUIZ TELEMETRY & PARTICIPANTS ]
                              </h4>
                              {isExpandedLoading && (
                                <span className="text-xs font-jakarta italic text-p3-accent animate-pulse">
                                  SYNCING ANALYTICS...
                                </span>
                              )}
                            </div>

                            {/* Overall Summary Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                              <div className="p-3 bg-p3-background border border-p3-primary/20 text-center">
                                <span className="block text-[10px] font-rajdhani text-p3-muted">TOTAL PARTICIPANTS</span>
                                <span className="font-kanit font-extrabold text-2xl text-p3-primary">{analytics?.total_participants ?? 0}</span>
                              </div>
                              <div className="p-3 bg-p3-background border border-p3-primary/20 text-center">
                                <span className="block text-[10px] font-rajdhani text-p3-muted">COMPLETION RATE</span>
                                <span className="font-kanit font-extrabold text-2xl text-emerald-400">{analytics?.completion_rate ?? 0}%</span>
                              </div>
                              <div className="p-3 bg-p3-background border border-p3-primary/20 text-center">
                                <span className="block text-[10px] font-rajdhani text-p3-muted">MEAN ACCURACY</span>
                                <span className="font-kanit font-extrabold text-2xl text-cyan-400">{analytics?.mean_accuracy_score ?? 0}%</span>
                              </div>
                              <div className="p-3 bg-p3-background border border-p3-primary/20 text-center">
                                <span className="block text-[10px] font-rajdhani text-p3-muted">MEAN RESPONSE TIME</span>
                                <span className="font-kanit font-extrabold text-2xl text-amber-400">{analytics?.mean_response_time ?? 0}S</span>
                              </div>
                              <div className="p-3 bg-p3-background border border-p3-primary/20 text-center col-span-2 sm:col-span-1">
                                <span className="block text-[10px] font-rajdhani text-p3-muted">MEAN PRESSURE</span>
                                <span className="font-kanit font-extrabold text-2xl text-purple-400">{analytics?.mean_pressure_score ?? 0}</span>
                              </div>
                            </div>

                            {/* Participants Search & Table */}
                            <div className="space-y-3 pt-2">
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                <span className="font-rajdhani font-bold italic text-xs text-p3-muted uppercase">
                                  PARTICIPANTS ROSTER ({participants.length})
                                </span>
                                <div className="w-full sm:w-72">
                                  <input
                                    type="text"
                                    placeholder="Search by username or email..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setQuizSearchMap((prev) => ({ ...prev, [quizId]: val }));
                                    }}
                                    className="w-full bg-p3-background border border-p3-primary/30 px-3 py-1.5 font-jakarta text-xs text-p3-primary placeholder:text-p3-muted focus:outline-none focus:border-p3-primary"
                                  />
                                </div>
                              </div>

                              <div className="overflow-x-auto border border-p3-primary/20 bg-p3-background/40">
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="bg-p3-background font-rajdhani font-bold text-xs text-p3-muted uppercase tracking-wider border-b border-p3-primary/20">
                                      <th className="p-2.5">User</th>
                                      <th className="p-2.5">Status</th>
                                      <th className="p-2.5">Accuracy</th>
                                      <th className="p-2.5">Avg Time</th>
                                      <th className="p-2.5">Pressure</th>
                                    </tr>
                                  </thead>
                                  <tbody className="font-jakarta text-xs divide-y divide-p3-primary/10">
                                    {participants.length > 0 ? (
                                      participants.map((p, idx) => (
                                        <tr key={idx} className="hover:bg-p3-background/60 transition-colors">
                                          <td className="p-2.5">
                                            <div className="font-bold text-p3-primary">{p.username}</div>
                                            <div className="text-[10px] text-p3-muted">{p.email}</div>
                                          </td>
                                          <td className="p-2.5">
                                            <span className={`px-2 py-0.5 text-[10px] font-black uppercase border ${getStatusBadgeStyle(p.status)}`}>
                                              {p.status}
                                            </span>
                                          </td>
                                          <td className="p-2.5 font-bold text-cyan-400">{p.accuracy_rate}%</td>
                                          <td className="p-2.5 font-bold text-amber-400">{p.avg_response_time}s</td>
                                          <td className="p-2.5 font-bold text-purple-400">{p.pressure_score}</td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td colSpan={5} className="p-4 text-center text-p3-muted italic">
                                          [ NO PARTICIPANTS FOUND MATCHING QUERY ]
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* Live Telemetry Modal */}
      {selectedLiveQuizId && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative bg-p3-surface p-6 max-w-4xl w-full border-2 border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.3)] -skew-x-1 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-p3-primary/20 mb-6 gap-4">
              <div className="min-w-0">
                <span className="text-[10px] font-jakarta font-black uppercase text-emerald-400 tracking-widest">
                  LIVE TELEMETRY MONITOR
                </span>
                <h3 className="font-kanit font-extrabold italic text-xl sm:text-2xl text-p3-primary uppercase wrap-break-word">
                  {liveSessionData?.quiz_details.title || "LOADING ASSESSMENT..."}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedLiveQuizId(null);
                  setLiveSessionData(null);
                }}
                className={`${btnBase} bg-red-600 text-white hover:bg-red-700 shrink-0`}
              >
                CLOSE [X]
              </button>
            </div>

            {isLiveModalLoading && !liveSessionData ? (
              <div className="py-16 text-center font-kanit italic text-emerald-400 text-xl animate-pulse">
                CONNECTING TO LIVE SOCKET STREAM...
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3 bg-p3-background border border-p3-primary/20 text-center">
                    <span className="block text-[10px] font-rajdhani text-p3-muted">ASSIGNED</span>
                    <span className="font-kanit font-extrabold text-2xl text-p3-primary">{liveSessionData?.summary.assigned_total ?? 0}</span>
                  </div>
                  <div className="p-3 bg-p3-background border border-p3-primary/20 text-center">
                    <span className="block text-[10px] font-rajdhani text-p3-muted">NOT STARTED</span>
                    <span className="font-kanit font-extrabold text-2xl text-amber-400">{liveSessionData?.summary.not_started_count ?? 0}</span>
                  </div>
                  <div className="p-3 bg-p3-background border border-p3-primary/20 text-center">
                    <span className="block text-[10px] font-rajdhani text-p3-muted">IN PROGRESS</span>
                    <span className="font-kanit font-extrabold text-2xl text-cyan-400">{liveSessionData?.summary.in_progress_count ?? 0}</span>
                  </div>
                  <div className="p-3 bg-p3-background border border-p3-primary/20 text-center">
                    <span className="block text-[10px] font-rajdhani text-p3-muted">COMPLETED</span>
                    <span className="font-kanit font-extrabold text-2xl text-emerald-400">{liveSessionData?.summary.completed_count ?? 0}</span>
                  </div>
                  <div className="p-3 bg-p3-background border border-p3-primary/20 text-center col-span-2 sm:col-span-1">
                    <span className="block text-[10px] font-rajdhani text-p3-muted">EXPIRED</span>
                    <span className="font-kanit font-extrabold text-2xl text-red-500">{liveSessionData?.summary.expired_count ?? 0}</span>
                  </div>
                </div>

                <div className="overflow-x-auto border border-p3-primary/20">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-p3-background font-rajdhani font-bold text-xs text-p3-muted uppercase tracking-wider border-b border-p3-primary/20">
                        <th className="p-3">User</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Current Q Index</th>
                        <th className="p-3">Slot Elapsed</th>
                        <th className="p-3">Completed At</th>
                      </tr>
                    </thead>
                    <tbody className="font-jakarta text-xs divide-y divide-p3-primary/10">
                      {liveSessionData?.roster && liveSessionData.roster.length > 0 ? (
                        liveSessionData.roster.map((pa) => (
                          <tr key={pa.user_id} className="hover:bg-p3-background/50 transition-colors">
                            <td className="p-3 font-bold text-p3-primary">{pa.username}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 text-[10px] font-black uppercase border ${getStatusBadgeStyle(pa.status)}`}>
                                {pa.status}
                              </span>
                            </td>
                            <td className="p-3">{pa.current_question_index !== null ? `#${pa.current_question_index + 1}` : "N/A"}</td>
                            <td className="p-3">{pa.slot_elapsed_sec !== null ? `${pa.slot_elapsed_sec}s` : "N/A"}</td>
                            <td className="p-3">
                              {pa.completed_at
                                ? formatTimestamp(pa.completed_at)
                                : pa.status?.toUpperCase() === "EXPIRED"
                                ? "N/A"
                                : "IN PROGRESS"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-p3-muted italic">NO USERS ACTIVE IN THIS SESSION</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Item Analysis Analytics Modal */}
      {selectedAnalyticsQuizId && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative bg-p3-surface p-6 max-w-5xl w-full border-2 border-p3-accent shadow-[0_0_30px_rgba(251,191,36,0.3)] -skew-x-1 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 pt-4 border-b border-p3-primary/20 mb-6 sticky top-0 -translate-y-8 bg-p3-surface z-20 gap-4">
              <div className="min-w-0">
                <span className="text-[10px] font-jakarta font-black uppercase text-p3-accent tracking-widest">
                  ITEM ANALYSIS REPORT
                </span>
                <h3 className="font-kanit font-extrabold italic text-xl sm:text-2xl text-p3-primary uppercase break-all">
                  QUIZ ID: {selectedAnalyticsQuizId}
                </h3>
                <p className="font-rajdhani font-bold italic text-xs text-p3-muted uppercase">
                  TOTAL COMPLETED ATTEMPTS: {quizAnalyticsData?.total_completed_attempts ?? 0}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedAnalyticsQuizId(null);
                  setQuizAnalyticsData(null);
                }}
                className={`${btnBase} bg-red-600 text-white hover:bg-red-700 shrink-0`}
              >
                CLOSE [X]
              </button>
            </div>

            {isAnalyticsLoading && !quizAnalyticsData ? (
              <div className="py-16 text-center font-kanit italic text-p3-accent text-xl animate-pulse">
                RETRIEVING ITEM ANALYSIS METRICS...
              </div>
            ) : (
              <div className="space-y-8">
                {quizAnalyticsData?.item_analysis && quizAnalyticsData.item_analysis.length > 0 ? (
                  quizAnalyticsData.item_analysis.map((item) => (
                    <div key={item.question_id} className="p-5 bg-p3-background border border-p3-primary/30 flex flex-col space-y-4">
                      {/* Question Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-p3-primary/10 pb-3">
                        <div>
                          <span className="text-[10px] font-jakarta font-bold uppercase text-p3-muted tracking-wider">
                            QUESTION #{item.order_index}
                          </span>
                          <h4 className="font-kanit font-extrabold italic text-lg text-p3-primary">
                            {item.question_text}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                          <span className="px-2 py-1 bg-p3-surface text-xs font-jakarta font-bold text-p3-primary border border-p3-primary/20">
                            ACCURACY: {item.accuracy_rate}%
                          </span>
                          <span className="px-2 py-1 bg-p3-surface text-xs font-jakarta font-bold text-p3-muted border border-p3-primary/20">
                            AVG TIME: {item.avg_time_taken_sec}S
                          </span>
                        </div>
                      </div>

                      {/* Question Summary Stats & Skipped Users Badges */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-jakarta text-p3-muted">
                        <div>TOTAL RESPONSES: <span className="text-p3-primary font-bold">{item.total_responses}</span></div>
                        <div>CORRECT: <span className="text-emerald-400 font-bold">{item.correct_responses}</span> | SKIPPED: <span className="text-amber-400 font-bold">{item.skipped_responses}</span></div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-rajdhani font-bold uppercase text-p3-muted mb-1">USERS THAT SKIPPED:</span>
                          <div className="flex flex-wrap gap-1 items-center">
                            {item.users_that_skipped.length > 0 ? (
                              item.users_that_skipped.map((username) => (
                                <span key={username} className="px-2 py-0.5 bg-p3-surface border border-red-500/30 text-[11px] font-jakarta font-bold text-red-400">
                                  {username}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-p3-muted italic">NONE</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Options Breakdown with Wrapped Badges */}
                      <div className="space-y-2 mt-2">
                        <span className="text-[10px] font-rajdhani font-bold uppercase text-p3-muted tracking-widest">
                          OPTIONS & USER SELECTIONS:
                        </span>
                        <div className="grid grid-cols-1 gap-3">
                          {item.options.map((opt) => (
                            <div
                              key={opt.option_id}
                              className={`p-3 border flex flex-col gap-2 ${
                                opt.is_correct
                                  ? "bg-emerald-950/20 border-emerald-500/50"
                                  : "bg-p3-surface border-p3-primary/10"
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className={`px-1.5 py-0.5 text-[9px] font-black uppercase ${opt.is_correct ? "bg-emerald-400 text-slate-950" : "bg-p3-muted text-slate-950"}`}>
                                    {opt.is_correct ? "CORRECT" : "OPTION"}
                                  </span>
                                  <span className="font-jakarta text-xs text-p3-primary font-medium">
                                    {opt.option_text}
                                  </span>
                                </div>
                                <span className="text-xs font-jakarta text-p3-muted shrink-0">
                                  SELECTED: <span className="text-p3-primary font-bold">{opt.selection_count} ({opt.selection_percentage}%)</span>
                                </span>
                              </div>

                              <div className="flex flex-col mt-1 pt-2 border-t border-p3-primary/10">
                                <span className="text-[10px] font-rajdhani font-bold uppercase text-p3-muted mb-1">PICKED BY:</span>
                                <div className="flex flex-wrap gap-1 items-center">
                                  {opt.users_that_picked.length > 0 ? (
                                    opt.users_that_picked.map((username) => (
                                      <span key={username} className="px-2 py-0.5 bg-p3-background border border-p3-primary/35 text-[11px] font-jakarta font-bold text-cyan-400">
                                        {username}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-xs text-p3-muted italic">NONE</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center font-rajdhani italic text-p3-muted">
                    [ NO ITEM ANALYSIS DATA AVAILABLE FOR THIS QUIZ ]
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-p3-surface p-6 max-w-md w-full border-2 border-red-600 shadow-[0_0_20px_rgba(239,68,68,0.3)] -skew-x-2">
            <h3 className="font-kanit font-extrabold italic text-2xl text-p3-primary uppercase mb-2">
              CONFIRM LOGOUT
            </h3>
            <p className="font-jakarta text-xs text-p3-muted italic mb-6">
              Are you sure you want to terminate your active operator session?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className={`${btnBase} bg-p3-surface border border-p3-primary text-p3-primary hover:bg-p3-primary hover:text-p3-highlight`}
              >
                CANCEL
              </button>
              <button
                onClick={confirmLogout}
                className={`${btnBase} bg-red-600 text-white hover:bg-red-700`}
              >
                CONFIRM LOGOUT
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
