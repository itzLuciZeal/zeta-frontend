import { useEffect, useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { 
  getAdminDashboardApi, 
  getLiveQuizSessionApi,
  getQuizOverallAnalyticsApi,
  getQuizParticipantsApi,
} from "../../services/dashboard.service";
import type { QuizParticipantTelemetry, QuizOverallAnalytics } from "../../types/dashboard.types";
import { getActiveQuizzesApi, updateQuizApi, getAttemptResultsApi } from "../../services/quiz.service";
import { fetchQuizItemAnalysis } from "../../services/analyticsService";
import type { Quiz, UpdateQuizRequest, QuizAttemptResultResponse } from "../../types/quiz.types";
import type { QuizItemAnalysisResponse } from "../../types/analytics.types";
import { getPressureScoreBadge, getAccuracyBadge, getPacingVelocityBadge } from "../../utils/quizMetrics";
import Footer from "../../components/ui/Footer";
import GrantQuizAccessSection from "../admin/GrantQuizAccessSection";

type DashboardQuiz = Quiz & {
  _id?: string;
  time_limit?: number;
  time_per_question?: number;
  allow_backtrack?: boolean;
  sync_mode?: string;
  latest_completed_attempt_id?: string;
  attempt_id?: string;
  deployment_creator_id?: string;
  creator_id?: string;
  user_id?: string;
  activated_at?: string;
  deployed_at?: string;
  published_at?: string;
};

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

  const [adminMetrics, setAdminMetrics] = useState<AdminSystemMetrics | null>(null);
  const [quizzes, setQuizzes] = useState<DashboardQuiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);

  // Per-Quiz Expanded Analytics & Participants State
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

  // Quiz Results Modal State
  const [selectedResultAttemptId, setSelectedResultAttemptId] = useState<string | null>(null);
  const [attemptResultData, setAttemptResultData] = useState<QuizAttemptResultResponse | null>(null);
  const [isResultLoading, setIsResultLoading] = useState<boolean>(false);

  // Quiz Update Modal State
  const [selectedUpdateQuiz, setSelectedUpdateQuiz] = useState<DashboardQuiz | null>(null);
  const [updateFormData, setUpdateFormData] = useState<UpdateQuizRequest>({
    status: "pending",
    shuffle_questions: false,
    allow_synchronous: false,
  });
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const btnBase =
    "relative px-3 sm:px-4 py-2 font-jakarta font-extrabold text-[10px] sm:text-xs italic tracking-wider uppercase transition-all duration-200 cursor-pointer inline-flex items-center justify-center whitespace-nowrap border-2 -skew-x-6";

  const frameBase =
    "relative isolate border-2 border-cyan-400/90 overflow-hidden";

  const frameAccent =
    "pointer-events-none absolute -z-0 border border-cyan-400/35";

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [adminData, quizData] = await Promise.all([
          getAdminDashboardApi().catch(() => null),
          getActiveQuizzesApi().catch(() => []),
        ]);

        if (adminData) {
          const systemMetrics = adminData.system_metrics || adminData.metrics || adminData;
          setAdminMetrics(systemMetrics as AdminSystemMetrics);
        }
        
        setQuizzes(quizData as DashboardQuiz[]);
      } catch {
        setError("FAILED TO SYNC DASHBOARD DATA");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!expandedQuizId) return;

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
  }, [expandedQuizId, quizSearchMap]);

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

  useEffect(() => {
    if (!selectedResultAttemptId) return;

    const fetchResults = async () => {
      try {
        setIsResultLoading(true);
        const data = await getAttemptResultsApi(selectedResultAttemptId);
        setAttemptResultData(data);
      } catch (err) {
        console.error("Failed to fetch attempt results:", err);
        setAttemptResultData(null);
      } finally {
        setIsResultLoading(false);
      }
    };

    fetchResults();
  }, [selectedResultAttemptId]);

  const confirmLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch {
      navigate("/login");
    }
  };

  const toggleMoreInfo = (id: string) => {
    setExpandedQuizId((prev) => (prev === id ? null : id));
  };

  const openUpdateModal = (quiz: DashboardQuiz) => {
    setSelectedUpdateQuiz(quiz);
    setUpdateFormData({
      status: (quiz.status || "pending").toLowerCase(),
      shuffle_questions: quiz.shuffle_questions ?? true,
      allow_synchronous: quiz.allow_synchronous ?? true,
    });
    setUpdateError(null);
  };

  const handleUpdateQuizSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUpdateQuiz) return;

    const targetQuizId = selectedUpdateQuiz.id || selectedUpdateQuiz._id || "";

    try {
      setIsUpdating(true);
      setUpdateError(null);

      const updatedRes = await updateQuizApi(targetQuizId, updateFormData);

      setQuizzes((prevQuizzes) =>
        prevQuizzes.map((q) => {
          const qId = q.id || q._id;
          return qId === targetQuizId
            ? { ...q, ...updateFormData, ...(updatedRes || {}) }
            : q;
        })
      );

      setSelectedUpdateQuiz(null);
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setUpdateError(errorMsg || "FAILED TO UPDATE QUIZ CONFIGURATION");
    } finally {
      setIsUpdating(false);
    }
  };

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const parsed = new Date(dateStr);
      if (isNaN(parsed.getTime())) return dateStr;
      const month = parsed.getMonth() + 1;
      const day = parsed.getDate();
      const year = parsed.getFullYear();
      let hours = parsed.getHours();
      const minutes = parsed.getMinutes();
      const seconds = parsed.getSeconds();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minStr = minutes < 10 ? `0${minutes}` : minutes;
      const secStr = seconds < 10 ? `0${seconds}` : seconds;
      return `${month}/${day}/${year}, ${hours}:${minStr}:${secStr} ${ampm}`;
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
        return "bg-rose-600 text-white border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.4)]";
      default:
        return "bg-p3-primary text-p3-highlight border-p3-accent";
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
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

  return (
    <div className="min-h-screen w-full px-3 py-3 sm:px-6 lg:px-10 pb-20 select-none overflow-x-hidden">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 sm:gap-6">

        {/* OPERATIVE HEADER */}
        <header
          className={`${frameBase} mt-1 px-5 py-5 sm:px-8 sm:py-7 lg:px-9 lg:py-8`}
        >
          <div className={`${frameAccent} inset-2`} />
          <div className="pointer-events-none absolute -right-1 top-0 h-5 w-16 bg-cyan-400/15 [clip-path:polygon(30%_0,100%_0,100%_100%,0_100%)]" />
          <div className="pointer-events-none absolute -bottom-2 left-10 h-1.5 w-[55%] bg-blue-700/80 -skew-x-12" />

          <div className="relative z-10 flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-cyan-400 px-3 py-1 text-[9px] sm:text-[10px] font-black italic tracking-widest text-slate-950 [clip-path:polygon(5%_0,100%_0,94%_100%,0_100%)]">
                SYSTEM ONLINE
              </span>
              <span className="border-2 border-cyan-400/45 bg-transparent px-3 py-1 text-[9px] sm:text-[10px] font-black italic tracking-widest text-cyan-300 [clip-path:polygon(5%_0,100%_0,94%_100%,0_100%)]">
                ADMIN_ID // ACTIVE
              </span>
            </div>

            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <h1 className="font-kanit text-4xl font-black italic uppercase leading-none tracking-tight text-slate-50 drop-shadow-[3px_3px_0_rgba(6,182,212,0.9)] sm:text-6xl lg:text-7xl">
                  ADMIN DASHBOARD
                </h1>

                <div className="mt-4 inline-flex max-w-full items-center gap-2 border border-slate-600/80 px-3 py-1.5">
                  <span className="font-jakarta text-[10px] font-black italic text-cyan-400">↯</span>
                  <p className="min-w-0 truncate font-jakarta text-[10px] font-extrabold italic uppercase tracking-wide text-slate-300 sm:text-xs">
                    USER: <span className="text-slate-100">{username}</span>
                    <span className="mx-2 text-cyan-500">|</span>
                    ID: <span className="text-slate-100">{adminId}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => navigate("/user/dashboard")}
                  className={`${btnBase} border-cyan-400 bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400 hover:text-slate-950`}
                >
                  ◉ ADMIN COMMAND
                </button>

                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className={`${btnBase} border-rose-500 bg-rose-500/10 text-rose-300 hover:bg-rose-500 hover:text-white`}
                >
                  ⇥ LOG OUT
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* NAVIGATION */}
        <nav className="flex flex-wrap gap-2 px-1 sm:px-2" aria-label="Dashboard sections">
          <button
            onClick={() => scrollToSection("overview")}
            className={`px-5 py-2.5 font-jakarta text-[10px] font-black italic uppercase tracking-widest transition-all ${
              activeFilter === "ALL"
                ? "border-2 border-slate-100 bg-slate-100 text-slate-950 [clip-path:polygon(3%_0,100%_0,96%_100%,0_100%)]"
                : "border-2 border-cyan-400/80 text-cyan-300 hover:bg-cyan-400/10 [clip-path:polygon(3%_0,100%_0,96%_100%,0_100%)]"
            }`}
          >
            ⌂ 01 // OVERVIEW
          </button>

          <button
            onClick={() => scrollToSection("assessments")}
            className="border-2 border-cyan-400/55 px-5 py-2.5 font-jakarta text-[10px] font-black italic uppercase tracking-widest text-cyan-300 transition-all hover:bg-cyan-400/10 [clip-path:polygon(3%_0,100%_0,96%_100%,0_100%)]"
          >
            ◎ 02 // QUIZZES
          </button>
        </nav>

        {/* OVERVIEW / TELEMETRY */}
        <main id="overview" className={`${frameBase} scroll-mt-5 px-5 py-5 sm:px-8 sm:py-7`}>
          <div className={`${frameAccent} inset-[7px]`} />
          <div className="relative z-10">
            <div className="flex items-center justify-between border-b border-slate-700/70 pb-3">
              <span className="bg-cyan-400 px-3 py-1 text-[9px] sm:text-[10px] font-black italic uppercase tracking-widest text-slate-950 [clip-path:polygon(5%_0,100%_0,94%_100%,0_100%)]">
                TELEMETRY METRICS
              </span>
              <span className="font-jakarta text-lg font-black italic text-cyan-400">〽</span>
            </div>

            <div className="mt-5 grid grid-cols-1 divide-y divide-slate-800/80 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="px-1 py-4 sm:px-7 sm:py-1">
                <span className="font-jakarta text-[10px] font-black italic uppercase tracking-widest text-cyan-400">
                  ∿ ASSESSMENTS
                </span>
                <div className="mt-2 font-kanit text-5xl font-black italic leading-none text-slate-50 sm:text-6xl">
                  {adminMetrics?.total_quizzes_created ?? quizzes.length}
                </div>
                <span className="font-rajdhani text-[10px] font-bold italic uppercase tracking-widest text-slate-400">
                  CREATED MODULES
                </span>
              </div>

              <div className="px-1 py-4 sm:px-7 sm:py-1">
                <span className="font-jakarta text-[10px] font-black italic uppercase tracking-widest text-cyan-400">
                  ◎ USERS
                </span>
                <div className="mt-2 font-kanit text-5xl font-black italic leading-none text-slate-50 sm:text-6xl">
                  {adminMetrics?.total_registered_users ?? 0}
                </div>
                <span className="font-rajdhani text-[10px] font-bold italic uppercase tracking-widest text-slate-400">
                  REGISTERED ACCOUNTS
                </span>
              </div>

              <div className="px-1 py-4 sm:px-7 sm:py-1">
                <span className="font-jakarta text-[10px] font-black italic uppercase tracking-widest text-cyan-400">
                  ⚡ LIVE
                </span>
                <div className="mt-2 font-kanit text-5xl font-black italic leading-none text-slate-50 sm:text-6xl">
                  {adminMetrics?.live_active_attempts ?? 0}
                </div>
                <span className="font-rajdhani text-[10px] font-bold italic uppercase tracking-widest text-slate-400">
                  IN-PROGRESS SESSIONS
                </span>
              </div>
            </div>
          </div>
        </main>

        {/* ASSESSMENTS COMMAND */}
        <section id="assessments" className="scroll-mt-5">
          <div className={`${frameBase} px-5 py-5 sm:px-7 sm:py-6`}>
            <div className={`${frameAccent} inset-[7px]`} />

            <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <span className="font-jakarta text-[10px] font-black italic uppercase tracking-widest text-cyan-400">
                  TACTICAL ASSESSMENT READY
                </span>
                <h2 className="mt-1 font-kanit text-2xl font-black italic uppercase leading-tight text-slate-100 sm:text-3xl">
                  LAUNCH ACTIVE QUIZZES
                </h2>
                <p className="mt-1 font-rajdhani text-[10px] font-bold italic uppercase tracking-widest text-slate-400">
                  SHOWING: {filteredQuizzes.length} OF {quizzes.length} ACTIVE
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                <button
                  onClick={() => scrollToSection("quiz-list")}
                  className={`${btnBase} border-cyan-400 bg-cyan-400/10 px-5 py-2.5 text-cyan-300 hover:bg-cyan-400 hover:text-slate-950`}
                >
                  GO TO QUIZZES 〉
                </button>

                <button
                  onClick={() => navigate("/admin/quiz/create")}
                  className={`${btnBase} border-emerald-400 bg-emerald-400/10 px-5 py-2.5 text-emerald-300 hover:bg-emerald-400 hover:text-slate-950`}
                >
                  + CREATE QUIZ
                </button>

                <div className="flex flex-wrap gap-1">
                  {["ALL", "ACTIVE", "PUBLISHED", "PENDING", "COMPLETED"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`border px-2.5 py-1.5 font-jakarta text-[9px] font-black italic uppercase tracking-wider transition-all ${
                        activeFilter === filter
                          ? "border-slate-100 bg-slate-100 text-slate-950"
                          : "border-slate-600 text-slate-400 hover:border-cyan-400 hover:text-cyan-300"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* QUIZ LIST */}
          <div id="quiz-list" className="mt-4 scroll-mt-5 space-y-3">
            {filteredQuizzes.length === 0 ? (
              <div className="border border-dashed border-slate-600 px-5 py-12 text-center">
                <p className="font-rajdhani text-sm font-bold italic uppercase tracking-widest text-slate-500">
                  [ NO ASSESSMENTS FOUND MATCHING FILTER: {activeFilter} ]
                </p>
              </div>
            ) : (
              filteredQuizzes.map((quiz) => {
                const quizId = quiz.id || quiz._id || "";
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
                  <article
                    key={quizId}
                    className={`${frameBase} group px-4 py-4 sm:px-6 sm:py-5 transition-transform duration-200 hover:-translate-y-0.5`}
                  >
                    <div className={`${frameAccent} inset-1.5 opacity-50`} />
                    <div className="relative z-10">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`border px-2 py-0.5 text-[9px] font-black italic uppercase tracking-widest ${getStatusBadgeStyle(quizStatus)}`}>
                              {quizStatus}
                            </span>

                            <span className="font-rajdhani text-[10px] font-bold italic uppercase tracking-widest text-slate-400">
                              Q:{totalQuestions} / LIMIT:{timeLimitText}
                            </span>
                          </div>

                          <h3 className="mt-2 break-words font-kanit text-xl font-black italic uppercase leading-tight text-slate-100 sm:text-2xl">
                            {quiz.title || "UNTITLED ASSESSMENT"}
                          </h3>

                          <p className="mt-1 max-w-4xl font-jakarta text-[11px] italic leading-relaxed text-slate-400 sm:text-xs">
                            {quiz.description || "Operational assessment module ready for execution."}
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center gap-1.5 xl:max-w-[620px] xl:justify-end">
                          <button
                            onClick={() => toggleMoreInfo(quizId)}
                            className={`${btnBase} border-cyan-400/70 text-cyan-300 hover:bg-cyan-400 hover:text-slate-950`}
                          >
                            {isExpanded ? "HIDE DETAILS ▲" : "MORE INFO ▼"}
                          </button>

                          <button
                            onClick={() => {
                              setSelectedLiveQuizId(quizId);
                              setIsLiveModalLoading(true);
                            }}
                            className={`${btnBase} border-emerald-400/70 text-emerald-300 hover:bg-emerald-400 hover:text-slate-950`}
                          >
                            LIVE
                          </button>

                          <button
                            onClick={() => openUpdateModal(quiz)}
                            className={`${btnBase} border-slate-300/80 text-slate-100 hover:bg-slate-100 hover:text-slate-950`}
                          >
                            UPDATE NOW
                          </button>

                          <button
                            onClick={() => {
                              setSelectedAnalyticsQuizId(quizId);
                              setIsAnalyticsLoading(true);
                            }}
                            className={`${btnBase} border-amber-400/80 text-amber-300 hover:bg-amber-400 hover:text-slate-950`}
                          >
                            ANALYTICS
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-5 border-t border-slate-700/70 pt-5">
                          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                              <span className="block font-rajdhani text-[10px] font-bold italic uppercase tracking-widest text-slate-500">
                                TIME PER QUESTION
                              </span>
                              <span className="font-kanit text-sm font-black italic uppercase text-cyan-300">
                                {timePerQuestionText}
                              </span>
                            </div>

                            <div>
                              <span className="block font-rajdhani text-[10px] font-bold italic uppercase tracking-widest text-slate-500">
                                MAX SCORE & ATTEMPTS
                              </span>
                              <span className="font-kanit text-sm font-black italic uppercase text-slate-100">
                                {quiz.max_score || 100} PTS / {quiz.max_attempts || 1} ATTEMPT(S)
                              </span>
                            </div>

                            <div>
                              <span className="block font-rajdhani text-[10px] font-bold italic uppercase tracking-widest text-slate-500">
                                NAVIGATION RULES
                              </span>
                              <div className="font-kanit text-xs font-black italic uppercase leading-snug text-slate-100">
                                <div>Backtracking: {allowBacktracking ? "ENABLED" : "DISABLED"}</div>
                                <div>Sync Mode: {allowSynchronous ? "SYNCHRONOUS" : "STANDARD"}</div>
                              </div>
                            </div>

                            <div>
                              <span className="block font-rajdhani text-[10px] font-bold italic uppercase tracking-widest text-slate-500">
                                DEPLOYMENT CREATOR ID
                              </span>
                              <span className="break-all font-kanit text-xs font-black italic uppercase text-cyan-300">
                                {quiz.created_by || quiz.deployment_creator_id || quiz.creator_id || quiz.user_id || "N/A"}
                              </span>
                            </div>

                            <div>
                              <span className="block font-rajdhani text-[10px] font-bold italic uppercase tracking-widest text-slate-500">
                                DEPLOYED / CREATED AT
                              </span>
                              <span className="font-kanit text-xs font-black italic uppercase text-slate-100">
                                {formatTimestamp(quiz.created_at || quiz.activated_at || quiz.deployed_at || quiz.published_at)}
                              </span>
                            </div>
                          </div>

                          <div className="mt-6 border-t border-slate-700/70 pt-5">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <h4 className="font-kanit text-base font-black italic uppercase tracking-widest text-cyan-300">
                                [ OVERALL QUIZ TELEMETRY & PARTICIPANTS ]
                              </h4>
                              {isExpandedLoading && (
                                <span className="font-jakarta text-[10px] font-black italic uppercase tracking-widest text-amber-300 animate-pulse">
                                  SYNCING ANALYTICS...
                                </span>
                              )}
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                              <div className="border border-slate-700 px-3 py-3">
                                <span className="block font-rajdhani text-[9px] font-bold uppercase tracking-widest text-slate-500">TOTAL PARTICIPANTS</span>
                                <span className="font-kanit text-2xl font-black italic text-slate-100">{analytics?.total_participants ?? 0}</span>
                              </div>

                              <div className="border border-slate-700 px-3 py-3">
                                <span className="block font-rajdhani text-[9px] font-bold uppercase tracking-widest text-slate-500">COMPLETION RATE</span>
                                <span className="font-kanit text-2xl font-black italic text-emerald-300">{analytics?.completion_rate ?? 0}%</span>
                              </div>

                              <div className="border border-slate-700 px-3 py-3">
                                <span className="block font-rajdhani text-[9px] font-bold uppercase tracking-widest text-slate-500">MEAN ACCURACY</span>
                                <span className="font-kanit text-2xl font-black italic text-cyan-300">{analytics?.mean_accuracy_score ?? 0}%</span>
                              </div>

                              <div className="border border-slate-700 px-3 py-3">
                                <span className="block font-rajdhani text-[9px] font-bold uppercase tracking-widest text-slate-500">MEAN RESPONSE TIME</span>
                                <span className="font-kanit text-2xl font-black italic text-amber-300">{analytics?.mean_response_time ?? 0}S</span>
                              </div>

                              <div className="border border-slate-700 px-3 py-3">
                                <span className="block font-rajdhani text-[9px] font-bold uppercase tracking-widest text-slate-500">MEAN PRESSURE</span>
                                <span className="font-kanit text-2xl font-black italic text-purple-300">{analytics?.mean_pressure_score ?? 0}</span>
                              </div>
                            </div>

                            <div className="mt-5 space-y-3">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <span className="font-rajdhani text-[10px] font-bold italic uppercase tracking-widest text-slate-400">
                                  PARTICIPANTS ROSTER ({participants.length})
                                </span>

                                <div className="w-full sm:w-80">
                                  <input
                                    type="text"
                                    placeholder="SEARCH USERNAME OR EMAIL..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setQuizSearchMap((prev) => ({ ...prev, [quizId]: val }));
                                    }}
                                    className="w-full border border-slate-600 bg-transparent px-3 py-2 font-jakarta text-[10px] font-bold uppercase tracking-wide text-slate-100 placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none"
                                  />
                                </div>
                              </div>

                              <div className="overflow-x-auto border border-slate-700">
                                <table className="w-full min-w-[700px] border-collapse text-left">
                                  <thead>
                                    <tr className="border-b border-slate-700 font-rajdhani text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                      <th className="p-3">User</th>
                                      <th className="p-3">Status</th>
                                      <th className="p-3">Accuracy</th>
                                      <th className="p-3">Avg Time</th>
                                      <th className="p-3">Pressure</th>
                                    </tr>
                                  </thead>

                                  <tbody className="font-jakarta text-[10px] divide-y divide-slate-800">
                                    {participants.length > 0 ? (
                                      participants.map((p, idx) => (
                                        <tr key={idx} className="transition-colors hover:bg-cyan-400/5">
                                          <td className="p-3">
                                            <div className="font-bold text-slate-100">{p.username}</div>
                                            <div className="text-[9px] text-slate-500">{p.email}</div>
                                          </td>
                                          <td className="p-3">
                                            <span className={`border px-2 py-0.5 text-[9px] font-black uppercase ${getStatusBadgeStyle(p.status)}`}>
                                              {p.status}
                                            </span>
                                          </td>
                                          <td className="p-3 font-bold text-cyan-300">{p.accuracy_rate}%</td>
                                          <td className="p-3 font-bold text-amber-300">{p.avg_response_time}s</td>
                                          <td className="p-3 font-bold text-purple-300">{p.pressure_score}</td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td colSpan={5} className="p-4 text-center font-jakarta italic text-slate-500">
                                          [ NO PARTICIPANTS FOUND MATCHING QUERY ]
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* QUIZ RESULTS TELEMETRY MODAL */}
      {selectedResultAttemptId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
          <div className={`${frameBase} my-8 max-h-[90vh] w-full max-w-3xl overflow-y-auto px-5 py-6 sm:px-7`}>
            <div className={`${frameAccent} inset-1.5`} />
            <div className="relative z-10">
              <div className="sticky top-0 z-10 mb-5 flex items-center justify-between gap-4 border-b border-slate-700 bg-transparent pb-4">
                <div>
                  <span className="font-jakarta text-[9px] font-black uppercase tracking-widest text-cyan-400">
                    ASSESSMENT COMPLETE TELEMETRY
                  </span>
                  <h3 className="font-kanit text-xl font-black italic uppercase text-slate-100 sm:text-2xl">
                    QUIZ PERFORMANCE REPORT
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedResultAttemptId(null);
                    setAttemptResultData(null);
                  }}
                  className={`${btnBase} shrink-0 border-rose-500 text-rose-300 hover:bg-rose-500 hover:text-white`}
                >
                  CLOSE [X]
                </button>
              </div>

              {isResultLoading && !attemptResultData ? (
                <div className="py-16 text-center font-kanit text-xl font-black italic text-cyan-300 animate-pulse">
                  COMPUTING ANALYTICS & METRICS...
                </div>
              ) : attemptResultData ? (
                <div className="space-y-5 font-jakarta">
                  <div className="border border-slate-700 px-4 py-4">
                    <h4 className="font-kanit text-lg font-black italic text-slate-100">{attemptResultData.title}</h4>
                    <p className="mt-1 text-xs italic leading-relaxed text-slate-400">{attemptResultData.message}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="border border-slate-700 p-4 text-center">
                      <span className="mb-1 block font-rajdhani text-[9px] font-bold uppercase tracking-widest text-slate-500">PRESSURE SCORE GRADE</span>
                      <span className={`my-1 inline-flex border px-3 py-1 font-kanit text-xl font-black italic uppercase ${getPressureScoreBadge(attemptResultData.pressure_score_grade)}`}>
                        {attemptResultData.pressure_score_grade} ({attemptResultData.research_stats?.pressure_score})
                      </span>
                      <span className="mt-1 block text-[10px] italic text-slate-500">{attemptResultData.pressure_score_info}</span>
                    </div>

                    <div className="border border-slate-700 p-4 text-center">
                      <span className="mb-1 block font-rajdhani text-[9px] font-bold uppercase tracking-widest text-slate-500">ACCURACY INTEGRITY</span>
                      <span className={`my-1 inline-flex border px-2 py-1 text-xs font-black italic uppercase ${getAccuracyBadge(attemptResultData.accuracy_integrity_lvl)}`}>
                        {attemptResultData.accuracy_integrity_lvl} ({attemptResultData.research_stats?.accuracy_rate}%)
                      </span>
                      <span className="mt-1 block text-[10px] italic text-slate-500">{attemptResultData.accuracy_classification}</span>
                    </div>

                    <div className="border border-slate-700 p-4 text-center">
                      <span className="mb-1 block font-rajdhani text-[9px] font-bold uppercase tracking-widest text-slate-500">PACING VELOCITY</span>
                      <span className={`my-1 inline-flex border px-2 py-1 text-xs font-black italic uppercase ${getPacingVelocityBadge(attemptResultData.avg_rs_pacing_velocity)}`}>
                        {attemptResultData.avg_rs_pacing_velocity} ({attemptResultData.research_stats?.avg_response_time}s avg)
                      </span>
                      <span className="mt-1 block text-[10px] italic text-slate-500">{attemptResultData.avg_rs_diagnosis}</span>
                    </div>
                  </div>

                  <div className="border border-slate-700 p-4">
                    <span className="block font-rajdhani text-[9px] font-bold uppercase tracking-widest text-cyan-400">
                      RESEARCH TELEMETRY BREAKDOWN
                    </span>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                      <div>Correct Answers: <span className="font-bold text-emerald-300">{attemptResultData.research_stats?.total_correct_answers}</span></div>
                      <div>Incorrect Answers: <span className="font-bold text-rose-300">{attemptResultData.research_stats?.total_incorrect_answers}</span></div>
                      <div>Skipped Answers: <span className="font-bold text-amber-300">{attemptResultData.research_stats?.total_skipped_answers}</span></div>
                      <div>Time Ratio Saved: <span className="font-bold text-cyan-300">{attemptResultData.research_stats?.time_ratio_saved}</span></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center font-jakarta text-xs italic text-rose-300">
                  FAILED TO LOAD ASSESSMENT RESULTS FOR ATTEMPT ID: {selectedResultAttemptId}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QUIZ UPDATE MODAL */}
      {selectedUpdateQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
          <div className={`${frameBase} my-8 max-h-[90vh] w-full max-w-lg overflow-y-auto px-5 py-6 sm:px-7`}>
            <div className={`${frameAccent} inset-1.5`} />
            <div className="relative z-10">
              <div className="mb-5 flex items-center justify-between gap-4 border-b border-slate-700 pb-4">
                <div>
                  <span className="font-jakarta text-[9px] font-black uppercase tracking-widest text-amber-300">
                    ASSESSMENT RECONFIGURATION
                  </span>
                  <h3 className="font-kanit text-2xl font-black italic uppercase text-slate-100">UPDATE QUIZ</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUpdateQuiz(null)}
                  className="font-jakarta text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-100"
                >
                  CLOSE [X]
                </button>
              </div>

              {updateError && (
                <div className="mb-4 border border-rose-500 px-3 py-3 font-jakarta text-xs font-bold italic text-rose-300">
                  {updateError}
                </div>
              )}

              <form onSubmit={handleUpdateQuizSubmit} className="space-y-5 font-jakarta">
                <div className="border border-slate-700 px-3 py-3 text-xs">
                  <span className="block font-rajdhani text-[9px] font-bold uppercase tracking-widest text-slate-500">QUIZ TITLE:</span>
                  <span className="font-kanit text-base font-black italic text-slate-100">{selectedUpdateQuiz.title}</span>
                </div>

                <div>
                  <label className="mb-2 block font-rajdhani text-[10px] font-bold italic uppercase tracking-widest text-slate-500">
                    STATUS
                  </label>
                  <select
                    value={updateFormData.status}
                    onChange={(e) =>
                      setUpdateFormData((prev) => ({ ...prev, status: e.target.value }))
                    }
                    className="w-full border border-slate-600 bg-transparent px-3 py-2 font-kanit text-sm font-black italic uppercase text-slate-100 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="pending" className="bg-slate-950 text-amber-300">PENDING</option>
                    <option value="published" className="bg-slate-950 text-cyan-300">PUBLISHED</option>
                    <option value="active" className="bg-slate-950 text-emerald-300">ACTIVE</option>
                    <option value="completed" className="bg-slate-950 text-purple-300">COMPLETED</option>
                  </select>
                </div>

                <div className="space-y-3 border-t border-slate-700 pt-4">
                  <label className="flex cursor-pointer items-center gap-3 group">
                    <input
                      type="checkbox"
                      checked={updateFormData.shuffle_questions}
                      onChange={(e) =>
                        setUpdateFormData((prev) => ({
                          ...prev,
                          shuffle_questions: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 accent-cyan-400"
                    />
                    <span className="font-kanit text-sm font-black italic uppercase text-slate-100 transition-colors group-hover:text-cyan-300">
                      SHUFFLE QUESTIONS
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 group">
                    <input
                      type="checkbox"
                      checked={updateFormData.allow_synchronous}
                      onChange={(e) =>
                        setUpdateFormData((prev) => ({
                          ...prev,
                          allow_synchronous: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 accent-cyan-400"
                    />
                    <span className="font-kanit text-sm font-black italic uppercase text-slate-100 transition-colors group-hover:text-cyan-300">
                      ALLOW SYNCHRONOUS MODE
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-700 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedUpdateQuiz(null)}
                    className={`${btnBase} border-slate-600 text-slate-300 hover:border-slate-100 hover:bg-slate-100 hover:text-slate-950`}
                  >
                    CANCEL
                  </button>

                  <button
                    type="submit"
                    disabled={isUpdating}
                    className={`${btnBase} border-emerald-400 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400 hover:text-slate-950 ${
                      isUpdating ? "cursor-not-allowed opacity-50" : ""
                    }`}
                  >
                    {isUpdating ? "SENDING UPDATE..." : "SEND UPDATE"}
                  </button>
                </div>
              </form>

              <div className="mt-6 border-t border-slate-700 pt-5">
                <GrantQuizAccessSection
                  quizId={selectedUpdateQuiz.id || selectedUpdateQuiz._id || ""}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIVE TELEMETRY MODAL */}
      {selectedLiveQuizId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
          <div className={`${frameBase} my-8 max-h-[90vh] w-full max-w-5xl overflow-y-auto px-5 py-6 sm:px-7`}>
            <div className="relative z-10">
              <div className="mb-5 flex items-center justify-between gap-4 border-b border-slate-700 pb-4">
                <div className="min-w-0">
                  <span className="font-jakarta text-[9px] font-black uppercase tracking-widest text-emerald-300">
                    LIVE TELEMETRY MONITOR
                  </span>
                  <h3 className="break-words font-kanit text-xl font-black italic uppercase text-slate-100 sm:text-2xl">
                    {liveSessionData?.quiz_details.title || "LOADING ASSESSMENT..."}
                  </h3>
                </div>

                <button
                  onClick={() => {
                    setSelectedLiveQuizId(null);
                    setLiveSessionData(null);
                  }}
                  className={`${btnBase} shrink-0 border-rose-500 text-rose-300 hover:bg-rose-500 hover:text-white`}
                >
                  CLOSE [X]
                </button>
              </div>

              {isLiveModalLoading && !liveSessionData ? (
                <div className="py-16 text-center font-kanit text-xl font-black italic text-emerald-300 animate-pulse">
                  CONNECTING TO LIVE SOCKET STREAM...
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    <div className="border border-slate-700 p-3 text-center">
                      <span className="block font-rajdhani text-[9px] font-bold uppercase tracking-widest text-slate-500">ASSIGNED</span>
                      <span className="font-kanit text-2xl font-black italic text-slate-100">{liveSessionData?.summary.assigned_total ?? 0}</span>
                    </div>
                    <div className="border border-slate-700 p-3 text-center">
                      <span className="block font-rajdhani text-[9px] font-bold uppercase tracking-widest text-slate-500">NOT STARTED</span>
                      <span className="font-kanit text-2xl font-black italic text-amber-300">{liveSessionData?.summary.not_started_count ?? 0}</span>
                    </div>
                    <div className="border border-slate-700 p-3 text-center">
                      <span className="block font-rajdhani text-[9px] font-bold uppercase tracking-widest text-slate-500">IN PROGRESS</span>
                      <span className="font-kanit text-2xl font-black italic text-cyan-300">{liveSessionData?.summary.in_progress_count ?? 0}</span>
                    </div>
                    <div className="border border-slate-700 p-3 text-center">
                      <span className="block font-rajdhani text-[9px] font-bold uppercase tracking-widest text-slate-500">COMPLETED</span>
                      <span className="font-kanit text-2xl font-black italic text-emerald-300">{liveSessionData?.summary.completed_count ?? 0}</span>
                    </div>
                    <div className="border border-slate-700 p-3 text-center">
                      <span className="block font-rajdhani text-[9px] font-bold uppercase tracking-widest text-slate-500">EXPIRED</span>
                      <span className="font-kanit text-2xl font-black italic text-rose-300">{liveSessionData?.summary.expired_count ?? 0}</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-700">
                    <table className="w-full min-w-[760px] border-collapse text-left">
                      <thead>
                        <tr className="border-b border-slate-700 font-rajdhani text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          <th className="p-3">User</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Current Q Index</th>
                          <th className="p-3">Slot Elapsed</th>
                          <th className="p-3">Completed At</th>
                        </tr>
                      </thead>
                      <tbody className="font-jakarta text-[10px] divide-y divide-slate-800">
                        {liveSessionData?.roster && liveSessionData.roster.length > 0 ? (
                          liveSessionData.roster.map((pa) => (
                            <tr key={pa.user_id} className="transition-colors hover:bg-cyan-400/5">
                              <td className="p-3 font-bold text-slate-100">{pa.username}</td>
                              <td className="p-3">
                                <span className={`border px-2 py-0.5 text-[9px] font-black uppercase ${getStatusBadgeStyle(pa.status)}`}>
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
                            <td colSpan={5} className="p-4 text-center italic text-slate-500">
                              NO USERS ACTIVE IN THIS SESSION
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ITEM ANALYSIS MODAL */}
      {selectedAnalyticsQuizId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
          <div className={`${frameBase} my-8 max-h-[90vh] w-full max-w-6xl overflow-y-auto px-5 py-6 sm:px-7`}>
            <div className="relative z-10">
              <div className="sticky top-0 z-20 mb-6 flex items-center justify-between gap-4 border-b border-slate-700 bg-transparent pb-4 pt-1">
                <div className="min-w-0">
                  <span className="font-jakarta text-[9px] font-black uppercase tracking-widest text-amber-300">ITEM ANALYSIS REPORT</span>
                  <h3 className="break-all font-kanit text-xl font-black italic uppercase text-slate-100 sm:text-2xl">
                    QUIZ ID: {selectedAnalyticsQuizId}
                  </h3>
                  <p className="font-rajdhani text-[10px] font-bold italic uppercase tracking-widest text-slate-500">
                    TOTAL COMPLETED ATTEMPTS: {quizAnalyticsData?.total_completed_attempts ?? 0}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedAnalyticsQuizId(null);
                    setQuizAnalyticsData(null);
                  }}
                  className={`${btnBase} shrink-0 border-rose-500 text-rose-300 hover:bg-rose-500 hover:text-white`}
                >
                  CLOSE [X]
                </button>
              </div>

              {isAnalyticsLoading && !quizAnalyticsData ? (
                <div className="py-16 text-center font-kanit text-xl font-black italic text-amber-300 animate-pulse">
                  RETRIEVING ITEM ANALYSIS METRICS...
                </div>
              ) : (
                <div className="space-y-7">
                  {quizAnalyticsData?.item_analysis && quizAnalyticsData.item_analysis.length > 0 ? (
                    quizAnalyticsData.item_analysis.map((item) => (
                      <div key={item.question_id} className="border border-slate-700 px-5 py-5">
                        <div className="flex flex-col gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <span className="font-jakarta text-[9px] font-bold uppercase tracking-widest text-slate-500">
                              QUESTION #{item.order_index}
                            </span>
                            <h4 className="font-kanit text-lg font-black italic text-slate-100">
                              {item.question_text}
                            </h4>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <span className="border border-cyan-400/45 px-2 py-1 font-jakarta text-[9px] font-bold uppercase text-cyan-300">
                              ACCURACY: {item.accuracy_rate}%
                            </span>
                            <span className="border border-slate-700 px-2 py-1 font-jakarta text-[9px] font-bold uppercase text-slate-400">
                              AVG TIME: {item.avg_time_taken_sec}S
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 text-[10px] font-jakarta text-slate-400 sm:grid-cols-3">
                          <div>TOTAL RESPONSES: <span className="font-bold text-slate-100">{item.total_responses}</span></div>
                          <div>
                            CORRECT: <span className="font-bold text-emerald-300">{item.correct_responses}</span>
                            <span className="mx-1">|</span>
                            SKIPPED: <span className="font-bold text-amber-300">{item.skipped_responses}</span>
                          </div>
                          <div>
                            <span className="mb-1 block font-rajdhani text-[9px] font-bold uppercase tracking-widest text-slate-500">USERS THAT SKIPPED:</span>
                            <div className="flex flex-wrap gap-1">
                              {item.users_that_skipped.length > 0 ? (
                                item.users_that_skipped.map((username) => (
                                  <span key={username} className="border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                                    {username}
                                  </span>
                                ))
                              ) : (
                                <span className="italic text-slate-600">NONE</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-5">
                          <span className="font-rajdhani text-[9px] font-bold uppercase tracking-widest text-slate-500">
                            OPTIONS & USER SELECTIONS:
                          </span>

                          <div className="mt-2 space-y-2">
                            {item.options.map((opt) => (
                              <div
                                key={opt.option_id}
                                className={`border p-3 ${
                                  opt.is_correct
                                    ? "border-emerald-400/45"
                                    : "border-slate-800"
                                }`}
                              >
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="flex min-w-0 items-center gap-2">
                                    <span className={`border px-1.5 py-0.5 text-[9px] font-black uppercase ${
                                      opt.is_correct
                                        ? "border-emerald-400 bg-emerald-400 text-slate-950"
                                        : "border-slate-600 text-slate-500"
                                    }`}>
                                      {opt.is_correct ? "CORRECT" : "OPTION"}
                                    </span>

                                    <span className="font-jakarta text-xs font-medium text-slate-200">
                                      {opt.option_text}
                                    </span>
                                  </div>

                                  <span className="shrink-0 font-jakarta text-[10px] text-slate-500">
                                    SELECTED: <span className="font-bold text-cyan-300">{opt.selection_count} ({opt.selection_percentage}%)</span>
                                  </span>
                                </div>

                                <div className="mt-3 border-t border-slate-800 pt-2">
                                  <span className="mb-1 block font-rajdhani text-[9px] font-bold uppercase tracking-widest text-slate-500">
                                    PICKED BY:
                                  </span>
                                  <div className="flex flex-wrap gap-1">
                                    {opt.users_that_picked.length > 0 ? (
                                      opt.users_that_picked.map((username) => (
                                        <span key={username} className="border border-cyan-400/30 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                                          {username}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="italic text-slate-600">NONE</span>
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
                    <div className="py-12 text-center font-rajdhani italic uppercase tracking-widest text-slate-500">
                      [ NO ITEM ANALYSIS DATA AVAILABLE FOR THIS QUIZ ]
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRMATION */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className={`${frameBase} w-full max-w-md px-5 py-6 sm:px-7`}>
            <div className="relative z-10">
              <h3 className="font-kanit text-2xl font-black italic uppercase text-slate-100">
                CONFIRM LOGOUT
              </h3>

              <p className="mt-2 font-jakarta text-xs italic leading-relaxed text-slate-400">
                Are you sure you want to terminate your active operator session?
              </p>

              <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-700 pt-4">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className={`${btnBase} border-slate-600 text-slate-300 hover:border-slate-100 hover:bg-slate-100 hover:text-slate-950`}
                >
                  CANCEL
                </button>

                <button
                  onClick={confirmLogout}
                  className={`${btnBase} border-rose-500 bg-rose-500/10 text-rose-300 hover:bg-rose-500 hover:text-white`}
                >
                  CONFIRM LOGOUT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

