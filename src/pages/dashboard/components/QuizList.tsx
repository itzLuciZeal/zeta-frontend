import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import {
  Clock,
  HelpCircle,
  CheckCircle2,
  Eye,
  Play,
  ChevronDown,
  Filter,
  Sparkles,
  ShieldAlert,
  Calendar,
  User,
  Layers,
  Award,
  Radio,
  RotateCcw,
  X
} from "lucide-react";
import { getActiveQuizzesApi, quizService } from "../../../services/quiz.service";
import type { Quiz } from "../../../types/quiz.types";

type FilterStatus = "ALL" | "ACTIVE" | "PUBLISHED" | "COMPLETED";

interface QuizListProps {
  onViewResults?: (attemptId: string) => void;
}

export default function QuizList({ onViewResults }: QuizListProps) {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [startingQuizId, setStartingQuizId] = useState<string | null>(null);

  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("ALL");

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getActiveQuizzesApi();

      const visibleQuizzes = data.filter(
        (quiz: Quiz) => (quiz.status || "").toUpperCase() !== "PENDING"
      );

      setQuizzes(visibleQuizzes);
    } catch {
      setError("FAILED TO SYNC AVAILABLE ASSESSMENTS // SYSTEM ERROR");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchQuizzes();
  }, [fetchQuizzes]);

  const toggleMoreInfo = (id: string) => {
    setExpandedQuizId((prev) => (prev === id ? null : id));
  };

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return new Date().toLocaleString();
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? new Date().toLocaleString() : parsed.toLocaleString();
  };

  const handleInitiateQuiz = async (quizId: string) => {
    try {
      setStartingQuizId(quizId);
      const attempt = await quizService.startQuiz(quizId);
      navigate(`/quiz/${quizId}`, { state: { attemptId: attempt.id } });
    } catch (err: unknown) {
      let message = "FAILED TO INITIATE SESSION";

      if (isAxiosError(err)) {
        if (err.response?.status === 403) {
          const detail = err.response?.data?.detail;
          message = detail
            ? `ACCESS DENIED: ${String(detail).toUpperCase()}`
            : "ACCESS RESTRICTED: OPERATIVE IS NOT ELIGIBLE OR AUTHORIZED TO PARTICIPATE IN THIS ASSESSMENT";
        } else if (err.response?.data?.detail) {
          message = String(err.response.data.detail).toUpperCase();
        } else if (err.message) {
          message = err.message.toUpperCase();
        }
      } else if (err instanceof Error) {
        message = err.message.toUpperCase();
      }

      setError(message);
    } finally {
      setStartingQuizId(null);
    }
  };

  const handleResumeQuiz = (quizId: string, attemptId: string) => {
    navigate(`/quiz/${quizId}`, { state: { attemptId } });
  };

  const handleResultsClick = (attemptId: string) => {
    if (onViewResults) {
      onViewResults(attemptId);
    } else {
      navigate(`/quiz/results/${attemptId}`);
    }
  };

  const getStatusBadgeStyle = (statusStr: string) => {
    switch (statusStr.toUpperCase()) {
      case "ACTIVE":
        return "bg-slate-900 text-cyan-400 border-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.6)] animate-pulse";
      case "PUBLISHED":
        return "bg-slate-900 text-cyan-300 border-cyan-500/60 shadow-[0_0_8px_rgba(0,229,255,0.3)]";
      case "COMPLETED":
      case "COMPLETE":
        return "bg-slate-900 text-emerald-400 border-emerald-400/80 shadow-[0_0_10px_rgba(16,185,129,0.3)]";
      default:
        return "bg-slate-900 text-slate-400 border-slate-600";
    }
  };

  const filteredQuizzes = useMemo(() => {
    if (activeFilter === "ALL") return quizzes;
    return quizzes.filter((quiz: Quiz) => {
      const quizStatus = (quiz.status || "").toUpperCase();
      const hasAttempt = Boolean(quiz.latest_attempt_id);

      if (activeFilter === "COMPLETED") {
        return (
          quizStatus === "COMPLETED" ||
          quizStatus === "COMPLETE" ||
          (hasAttempt && quiz.latest_attempt_status === "completed")
        );
      }
      return quizStatus === activeFilter;
    });
  }, [quizzes, activeFilter]);

  const filterOptions: FilterStatus[] = ["ALL", "ACTIVE", "PUBLISHED", "COMPLETED"];

  const renderQuizActionButton = (quiz: Quiz) => {
    const quizId = quiz.id;
    const attemptId = quiz.latest_attempt_id;
    const attemptStatus = quiz.latest_attempt_status;
    const quizStatus = (quiz.status || "PUBLISHED").toUpperCase();
    const isProcessing = startingQuizId === quizId;

    // 1. Active Attempt In Progress -> Allow Resume
    if (attemptId && attemptStatus === "in_progress") {
      return (
        <button
          type="button"
          onClick={() => handleResumeQuiz(quizId, attemptId)}
          className="w-full sm:w-auto group relative px-4 sm:px-6 py-2 sm:py-2.5 bg-linear-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-300 ease-out cursor-pointer shadow-[0_0_16px_rgba(251,191,36,0.5)] hover:shadow-[0_0_24px_rgba(251,191,36,0.8)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 border border-yellow-200 flex items-center justify-center space-x-2 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-180 transition-transform duration-500 ease-in-out shrink-0 text-slate-950" />
          <span className="whitespace-nowrap">RESUME QUIZ</span>
        </button>
      );
    }

    // 2. Existing Completed Attempt -> Show Results + Retake Option if Active
    if (attemptId) {
      return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={() => handleResultsClick(attemptId)}
            className="w-full sm:w-auto group relative px-3 sm:px-6 py-2 sm:py-2.5 bg-linear-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-[11px] sm:text-xs tracking-wider sm:tracking-widest uppercase transition-all duration-300 ease-out cursor-pointer shadow-[0_0_16px_rgba(0,229,255,0.5)] hover:shadow-[0_0_24px_rgba(0,229,255,0.8)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 border border-cyan-200 flex items-center justify-center space-x-1.5 sm:space-x-2"
          >
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform duration-300 ease-out shrink-0 text-slate-950" />
            <span className="whitespace-nowrap">VIEW RESULTS</span>
          </button>

          {quizStatus === "ACTIVE" && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => void handleInitiateQuiz(quizId)}
              className="w-full sm:w-auto group relative px-3 sm:px-5 py-2 sm:py-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-black text-[11px] sm:text-xs tracking-wider uppercase transition-all duration-300 ease-out cursor-pointer border border-cyan-500/50 hover:border-cyan-400 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-1.5 sm:space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isProcessing ? (
                <>
                  <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin shrink-0 text-cyan-400" />
                  <span className="whitespace-nowrap">INITIATING...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current group-hover:scale-110 transition-transform duration-300 ease-out shrink-0 text-cyan-400" />
                  <span className="whitespace-nowrap">RETAKE QUIZ</span>
                </>
              )}
            </button>
          )}
        </div>
      );
    }

    // 3. Status Based Actions (No Previous Attempts)
    switch (quizStatus) {
      case "ACTIVE":
        return (
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => void handleInitiateQuiz(quizId)}
            className="w-full sm:w-auto group relative px-3 sm:px-6 py-2 sm:py-2.5 bg-linear-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-[11px] sm:text-xs tracking-wider sm:tracking-widest uppercase transition-all duration-300 ease-out cursor-pointer shadow-[0_0_16px_rgba(0,229,255,0.5)] hover:shadow-[0_0_24px_rgba(0,229,255,0.8)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 border border-cyan-200 flex items-center justify-center space-x-1.5 sm:space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isProcessing ? (
              <>
                <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin shrink-0 text-slate-950" />
                <span className="whitespace-nowrap">INITIATING...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current group-hover:scale-110 transition-transform duration-300 ease-out shrink-0 text-slate-950" />
                <span className="whitespace-nowrap">INITIATE NOW</span>
              </>
            )}
          </button>
        );

      case "PUBLISHED":
        return (
          <button
            type="button"
            disabled
            className="w-full sm:w-auto px-2.5 sm:px-5 py-2 sm:py-2.5 bg-slate-900/80 text-slate-500 border border-slate-800 font-bold text-[10px] sm:text-xs tracking-wider uppercase cursor-not-allowed flex items-center justify-center space-x-1.5 opacity-70 transition-opacity duration-300"
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">AWAITING ACTIVATION</span>
          </button>
        );

      case "COMPLETED":
      case "COMPLETE":
        return (
          <button
            type="button"
            disabled
            className="w-full sm:w-auto px-2.5 sm:px-5 py-2 sm:py-2.5 bg-slate-900/80 text-slate-500 border border-slate-800 font-bold text-[10px] sm:text-xs tracking-wider uppercase cursor-not-allowed flex items-center justify-center space-x-1.5 transition-all duration-300"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/50 shrink-0" />
            <span className="whitespace-nowrap">COMPLETED</span>
          </button>
        );

      default:
        return (
          <button
            type="button"
            disabled
            className="w-full sm:w-auto px-2.5 sm:px-5 py-2 sm:py-2.5 bg-slate-900/80 text-slate-600 border border-slate-800 font-bold text-[10px] sm:text-xs tracking-wider uppercase cursor-not-allowed flex items-center justify-center transition-all duration-300"
          >
            <span>UNAVAILABLE</span>
          </button>
        );
    }
  };

  if (loading) {
    return (
      <div className="w-full mt-6 p-8 sm:p-12 flex flex-col items-center justify-center space-y-3 border-2 border-cyan-500/40 bg-[#0a1128] relative overflow-hidden shadow-[0_0_20px_rgba(0,85,255,0.2)] transition-all duration-300">
        <Radio className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400 animate-spin z-10" />
        <div className="font-bold text-base sm:text-xl tracking-wider text-cyan-400 z-10 animate-pulse uppercase text-center">
          SYNCING OPERATIVE ASSESSMENTS...
        </div>
      </div>
    );
  }

  return (
    <section className="w-full mt-4 sm:mt-6 flex flex-col space-y-4 sm:space-y-6 select-none overflow-x-hidden">
      {/* Dynamic Pop-up Modal for System Alert / Error Restrictions */}
      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-all h-dvh duration-300 ease-out animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#0a1128] border-2 border-red-500 p-5 sm:p-6 shadow-[0_0_35px_rgba(239,68,68,0.5)] space-y-4 transition-all duration-300 ease-out animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-red-500/40 pb-3">
              <div className="flex items-center space-x-2.5 text-red-400">
                <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 animate-pulse" />
                <h3 className="font-black text-sm sm:text-base tracking-widest uppercase text-red-200">
                  SYSTEM ALERT // ACCESS RESTRICTED
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-slate-400 hover:text-red-400 transition-colors duration-200 p-1 cursor-pointer"
                aria-label="Close Error Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Body */}
            <div className="p-4 bg-red-950/40 border border-red-500/40 text-red-200 font-bold text-xs sm:text-sm tracking-wide leading-relaxed uppercase rounded-sm">
              {error}
            </div>

            {/* Action / Dismiss */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setError(null)}
                className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest transition-all duration-300 ease-out cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              >
                ACKNOWLEDGE & DISMISS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Filter Bar */}
      <div className="w-full flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-cyan-500/40 gap-3">
        {/* Title Block */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="p-1.5 sm:p-2 bg-cyan-950 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.3)] shrink-0 transition-transform duration-300 hover:scale-105">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="font-black text-xl sm:text-2xl text-slate-100 tracking-wide">
              AVAILABLE ASSESSMENTS
            </h2>
            <div className="flex items-center space-x-1.5 font-extrabold text-[11px] sm:text-xs text-cyan-400 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0"></span>
              <span>
                STATUS: {filteredQuizzes.length} OF {quizzes.length} DEPLOYED MODULES
              </span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <div className="px-3 py-1.5 bg-cyan-950/80 border border-cyan-500/60 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_10px_rgba(0,229,255,0.2)]">
            <Filter className="w-3.5 h-3.5" />
          </div>

          {filterOptions.map((status) => {
            const isActive = activeFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setActiveFilter(status)}
                className={`px-3.5 sm:px-4 py-1.5 font-black text-[11px] sm:text-xs tracking-wider uppercase transition-all duration-300 ease-out cursor-pointer border ${
                  isActive
                    ? "bg-cyan-400 text-slate-950 border-cyan-200 shadow-[0_0_14px_rgba(0,229,255,0.7)] scale-[1.02]"
                    : "bg-slate-900/90 text-slate-400 border-slate-700/80 hover:text-cyan-300 hover:border-cyan-500/50 hover:bg-slate-800"
                }`}
              >
                <span>{status}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quiz List Cards */}
      <div className="w-full grid grid-cols-1 gap-4 sm:gap-6">
        {filteredQuizzes.length === 0 ? (
          <div className="w-full relative p-8 sm:p-12 text-center border-2 border-dashed border-cyan-500/40 bg-[#0a1128]/90 transition-all duration-300">
            <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400/60 mx-auto mb-2 sm:mb-3 animate-bounce" />
            <p className="font-extrabold text-sm sm:text-base text-slate-300 tracking-wider uppercase">
              [ NO OPERATIVE MODULES FOUND MATCHING STATUS: {activeFilter} ]
            </p>
          </div>
        ) : (
          filteredQuizzes.map((quiz: Quiz) => {
            const quizId = quiz.id;
            const isExpanded = expandedQuizId === quizId;
            const quizStatus = (quiz.status || "PUBLISHED").toUpperCase();

            const totalQuestions = quiz.total_questions || quiz.questions?.length || 0;
            const timeLimitVal = quiz.time_limit_sec;
            const timeLimitText = timeLimitVal ? `${timeLimitVal}S` : "NONE";

            const timePerQuestionVal = quiz.time_per_question_sec;
            const timePerQuestionText = timePerQuestionVal
              ? `${timePerQuestionVal} SEC`
              : "NONE (GLOBAL LIMIT)";

            const allowBacktracking = quiz.allow_backtracking ?? false;
            const allowSynchronous = quiz.allow_synchronous ?? false;
            const deployedAtText = formatTimestamp(quiz.created_at);

            return (
              <div key={quizId} className="group relative w-full overflow-visible transition-transform duration-300 ease-out">
                {/* Frame Background */}
                <div className="absolute inset-0 bg-cyan-950/20 border-2 border-cyan-500/50 group-hover:border-cyan-400 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(0,85,255,0.2)] group-hover:shadow-[0_0_25px_rgba(0,229,255,0.4)]"></div>

                {/* Main Card Container */}
                <div className="relative z-10 bg-[#0a1128] p-3.5 sm:p-6 flex flex-col space-y-3 sm:space-y-4 border border-cyan-500/30 transition-colors duration-300">
                  <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                    <div className="flex flex-col w-full max-w-3xl">
                      {/* Meta Pills */}
                      <div className="flex items-center space-x-2 mb-2 flex-wrap gap-1.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] sm:text-[11px] font-black tracking-wider uppercase border transition-all duration-300 ${getStatusBadgeStyle(
                            quizStatus
                          )}`}
                        >
                          <span>{quizStatus}</span>
                        </span>

                        <div className="flex items-center space-x-1.5 font-bold text-[11px] sm:text-xs text-cyan-400 uppercase tracking-wider bg-slate-900 border border-cyan-500/40 px-2 py-0.5 flex-wrap">
                          <HelpCircle className="w-3 h-3 text-cyan-400 inline shrink-0" />
                          <span>QUESTIONS: {totalQuestions}</span>
                          <span className="text-cyan-600">/</span>
                          <Clock className="w-3 h-3 text-cyan-400 inline shrink-0" />
                          <span>TIME LIMIT: {timeLimitText}</span>
                        </div>
                      </div>

                      {/* Quiz Title */}
                      <h3 className="font-black text-xl sm:text-2xl text-slate-100 tracking-wide leading-tight group-hover:text-cyan-200 transition-colors duration-300">
                        {quiz.title || "UNTITLED ASSESSMENT MODULE"}
                      </h3>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-slate-400 font-normal mt-2 leading-relaxed">
                        {quiz.description || "Operational assessment module ready for execution."}
                      </p>
                    </div>

                    {/* Responsive Action Buttons Container */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
                      {/* Toggle Button */}
                      <button
                        type="button"
                        onClick={() => toggleMoreInfo(quizId)}
                        className={`w-full sm:w-auto px-3.5 sm:px-4 py-2 sm:py-2.5 font-black text-[11px] sm:text-xs tracking-wider uppercase transition-all duration-300 ease-out cursor-pointer flex items-center justify-center space-x-1.5 border active:scale-95 ${
                          isExpanded
                            ? "bg-slate-900 border-2 border-cyan-400 text-cyan-300 shadow-[0_0_16px_rgba(0,229,255,0.35)]"
                            : "bg-slate-950/80 hover:bg-slate-900 text-slate-300 border-slate-700/80 hover:border-cyan-500/60 hover:text-cyan-300 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                        }`}
                      >
                        <span className="whitespace-nowrap">
                          {isExpanded ? "HIDE DETAILS" : "MORE INFO"}
                        </span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-300 ease-in-out shrink-0 ${
                            isExpanded ? "rotate-180 text-cyan-400" : "text-slate-400 group-hover:text-cyan-400"
                          }`}
                        />
                      </button>

                      {renderQuizActionButton(quiz)}
                    </div>
                  </div>

                  {/* Accordion Details with Smooth CSS Grid Transition */}
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isExpanded
                        ? "grid-rows-[1fr] opacity-100 mt-3 pt-3 border-t border-cyan-500/40"
                        : "grid-rows-[0fr] opacity-0 mt-0 pt-0 border-t-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="bg-slate-950/80 text-slate-200 p-3.5 sm:p-5 border-l-4 border-l-cyan-400 shadow-xl space-y-3 sm:space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
                          <div className="p-2.5 sm:p-3 bg-slate-900 border border-cyan-500/30 flex items-start space-x-2.5 transition-colors hover:border-cyan-500/60 duration-200">
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="block font-extrabold text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">
                                TIME PER QUESTION
                              </span>
                              <span className="font-black text-xs sm:text-sm text-cyan-300 uppercase">
                                {timePerQuestionText}
                              </span>
                            </div>
                          </div>

                          <div className="p-2.5 sm:p-3 bg-slate-900 border border-cyan-500/30 flex items-start space-x-2.5 transition-colors hover:border-cyan-500/60 duration-200">
                            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="block font-extrabold text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">
                                MAX SCORE & ATTEMPTS
                              </span>
                              <span className="font-black text-xs sm:text-sm text-cyan-300 uppercase">
                                {quiz.max_score || 100} PTS / {quiz.max_attempts || 1} ATTEMPT(S)
                              </span>
                            </div>
                          </div>

                          <div className="p-2.5 sm:p-3 bg-slate-900 border border-cyan-500/30 flex items-start space-x-2.5 transition-colors hover:border-cyan-500/60 duration-200">
                            <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="block font-extrabold text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">
                                NAVIGATION RULES
                              </span>
                              <div className="font-extrabold text-[11px] sm:text-xs text-slate-200 uppercase leading-tight mt-0.5">
                                <div>
                                  BACKTRACKING:{" "}
                                  <span className={allowBacktracking ? "text-emerald-400" : "text-rose-400"}>
                                    {allowBacktracking ? "ENABLED" : "DISABLED"}
                                  </span>
                                </div>
                                <div>
                                  MODE:{" "}
                                  <span className="text-cyan-400">
                                    {allowSynchronous ? "SYNCHRONOUS" : "STANDARD"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2.5 border-t border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 text-[11px] sm:text-xs font-bold text-slate-400 uppercase">
                          <div className="flex items-center space-x-1.5">
                            <User className="w-3 h-3 text-cyan-400 shrink-0" />
                            <span>CREATOR ID:</span>
                            <span className="text-cyan-400 font-mono tracking-normal truncate max-w-45 sm:max-w-none">
                              {quiz.created_by || "SYSTEM_ADMIN"}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            <Calendar className="w-3 h-3 text-cyan-400 shrink-0" />
                            <span>DEPLOYED AT:</span>
                            <span className="text-cyan-400 font-mono tracking-normal">
                              {deployedAtText}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
