// src/pages/dashboard/components/QuizList.tsx
import { useEffect, useState, useMemo } from "react";
import { getActiveQuizzesApi } from "../../../services/quiz.service";
import { useQuiz } from "../../../context/QuizContext";
import type { Quiz } from "../../../types/quiz.types";

type FilterStatus = "ALL" | "ACTIVE" | "PUBLISHED" | "COMPLETED";

export default function QuizList() {
  const { startQuiz } = useQuiz();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [startingQuizId, setStartingQuizId] = useState<string | null>(null);

  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("ALL");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const data = await getActiveQuizzesApi();

        // EXCEPTION: Explicitly sanitize & exclude PENDING quizzes for regular users
        const visibleQuizzes = data.filter(
          (quiz: any) => (quiz.status || "").toUpperCase() !== "PENDING"
        );

        setQuizzes(visibleQuizzes);
      } catch (err: any) {
        setError("FAILED TO SYNC AVAILABLE ASSESSMENTS");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

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
      await startQuiz(quizId);
    } catch (err) {
      console.error("Failed to initiate quiz:", err);
    } finally {
      setStartingQuizId(null);
    }
  };

  // Status badge styling helper (matching Admin Dashboard)
  const getStatusBadgeStyle = (statusStr: string) => {
    switch (statusStr.toUpperCase()) {
      case "ACTIVE":
        return "bg-emerald-400 text-slate-950 border-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.4)]";
      case "PUBLISHED":
        return "bg-cyan-400 text-slate-950 border-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.4)]";
      case "COMPLETED":
        return "bg-purple-600 text-white border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]";
      default:
        return "bg-p3-primary text-p3-highlight border-p3-accent";
    }
  };

  // Dynamic action button helper based on status
  const renderQuizActionButton = (quizId: string, statusStr: string) => {
    const status = statusStr.toUpperCase();

    switch (status) {
      case "ACTIVE":
        return (
          <button
            disabled={startingQuizId === quizId}
            onClick={() => handleInitiateQuiz(quizId)}
            className="px-5 py-2.5 bg-p3-primary text-p3-highlight font-jakarta font-extrabold text-xs -skew-x-8 italic tracking-wider uppercase hover:bg-p3-surface hover:text-p3-primary transition-colors shadow-md text-center cursor-pointer disabled:opacity-50"
          >
            {startingQuizId === quizId ? "INITIATING..." : "INITIATE NOW"}
          </button>
        );

      case "PUBLISHED":
        return (
          <button
            disabled
            className="px-5 py-2.5 bg-slate-700/60 text-slate-400 border border-slate-600/50 font-jakarta font-extrabold text-xs -skew-x-8 italic tracking-wider uppercase cursor-not-allowed opacity-75"
          >
            AWAITING ACTIVATION
          </button>
        );

      case "COMPLETED":
      case "COMPLETE":
        return (
          <button
            disabled
            className="px-5 py-2.5 bg-red-950/40 text-red-400 border border-red-800/50 font-jakarta font-extrabold text-xs -skew-x-8 italic tracking-wider uppercase cursor-not-allowed opacity-75"
          >
            SESSION CONCLUDED
          </button>
        );

      default:
        return (
          <button
            disabled
            className="px-5 py-2.5 bg-slate-800 text-slate-500 border border-slate-700 font-jakarta font-extrabold text-xs -skew-x-8 italic tracking-wider uppercase cursor-not-allowed"
          >
            UNAVAILABLE
          </button>
        );
    }
  };

  // Derive visible list based on selected filter option
  const filteredQuizzes = useMemo(() => {
    if (activeFilter === "ALL") return quizzes;
    return quizzes.filter(
      (quiz: any) => (quiz.status || "").toUpperCase() === activeFilter
    );
  }, [quizzes, activeFilter]);

  const filterOptions: FilterStatus[] = ["ALL", "ACTIVE", "PUBLISHED", "COMPLETED"];

  if (loading) {
    return (
      <div className="w-full max-w-4xl mt-10 p-8 text-center text-p3-primary font-kanit italic text-lg tracking-wider animate-pulse">
        SYNCING ASSESSMENTS...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mt-10 p-4 bg-red-100 text-red-600 font-jakarta font-extrabold -skew-x-8 text-center rounded">
        {error}
      </div>
    );
  }

  return (
    <section className="w-full max-w-4xl mt-10 flex flex-col space-y-6">
      {/* Section Header & Filter Control Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-2">
        <div>
          <h2 className="font-kanit font-extrabold italic text-xl sm:text-2xl text-p3-primary -skew-x-6 tracking-wide">
            AVAILABLE ASSESSMENTS
          </h2>
          <span className="font-rajdhani font-bold italic text-xs text-p3-muted uppercase tracking-wider">
            SHOWING: {filteredQuizzes.length} OF {quizzes.length} DEPLOYED
          </span>
        </div>

        {/* Dynamic Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((status) => {
            const isActive = activeFilter === status;
            return (
              <button
                key={status}
                onClick={() => setActiveFilter(status)}
                className={`px-3 py-1 font-jakarta font-extrabold text-xs -skew-x-8 italic tracking-wider transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-p3-primary text-p3-highlight shadow-md scale-105"
                    : "bg-p3-surface/60 text-p3-primary border border-p3-primary/40 hover:border-p3-primary hover:bg-p3-surface"
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredQuizzes.length === 0 ? (
          <div className="relative p-8 text-center border-2 border-dashed border-p3-muted/40">
            <p className="font-rajdhani font-bold italic text-sm text-p3-muted">
              [ NO ASSESSMENTS FOUND MATCHING STATUS: {activeFilter} ]
            </p>
          </div>
        ) : (
          filteredQuizzes.map((quiz: any) => {
            const quizId = quiz.id || quiz._id;
            const isExpanded = expandedQuizId === quizId;
            const quizStatus = (quiz.status || "PUBLISHED").toUpperCase();

            const totalQuestions = quiz.total_questions || quiz.questions?.length || 5;
            const timeLimitVal = quiz.time_limit_sec ?? quiz.time_limit;
            const timeLimitText = timeLimitVal ? `${timeLimitVal}S` : "NONE";

            const timePerQuestionVal = quiz.time_per_question_sec ?? quiz.time_per_question;
            const timePerQuestionText = timePerQuestionVal
              ? `${timePerQuestionVal} SECONDS`
              : "NONE (GLOBAL LIMIT)";

            const allowBacktracking = quiz.allow_backtracking ?? quiz.allow_backtrack ?? false;
            const allowSynchronous = quiz.allow_synchronous ?? (quiz.sync_mode === "SYNCHRONOUS");

            const deployedAtText = formatTimestamp(quiz.created_at);

            return (
              <div
                key={quizId}
                className="group relative p-6 flex flex-col transition-all duration-200 ease-out hover:translate-x-1"
              >
                {/* Styled Background Layers */}
                <div className="absolute inset-0 bg-p3-highlight -skew-x-3 -z-1 group-hover:skew-x-4 transition-transform"></div>
                <div className="absolute bg-p3-primary skew-x-6 -top-1 -bottom-1 w-[calc(100%+12px)] left-1/2 -translate-x-1/2 -z-2 group-hover:skew-x-8 transition-transform"></div>
                <div className="absolute bg-p3-accent -skew-x-8 -top-2 -bottom-2 w-[calc(100%+24px)] left-1/2 -translate-x-1/2 -z-3 group-hover:-skew-x-12 transition-transform"></div>

                {/* Main Card Content */}
                <div className="z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex flex-col max-w-xl">
                    <div className="flex items-center space-x-2 mb-1.5 flex-wrap gap-y-1">
                      {/* Dynamic Status Badge */}
                      <span className={`px-2 py-0.5 text-[10px] font-jakarta font-black -skew-x-8 tracking-widest uppercase border ${getStatusBadgeStyle(quizStatus)}`}>
                        {quizStatus}
                      </span>
                      
                      <span className="font-rajdhani font-bold italic text-xs text-p3-muted -skew-x-6 uppercase tracking-wider">
                        QUESTIONS: {totalQuestions} / TIME LIMIT: {timeLimitText}
                      </span>
                    </div>

                    <h3 className="font-kanit font-extrabold italic text-xl sm:text-2xl text-p3-primary -skew-x-6 tracking-wide">
                      {quiz.title || "UNTITLED ASSESSMENT"}
                    </h3>
                    <p className="font-jakarta text-xs sm:text-sm text-p3-muted italic mt-1 leading-relaxed">
                      {quiz.description || "Operational assessment module ready for execution."}
                    </p>
                  </div>

                  {/* Actions Container */}
                  <div className="flex items-center space-x-3 self-end md:self-center">
                    <button
                      onClick={() => toggleMoreInfo(quizId)}
                      className="px-4 py-2 bg-transparent border-2 border-p3-primary text-p3-primary font-jakarta font-extrabold text-xs -skew-x-8 italic tracking-wider uppercase hover:bg-p3-primary hover:text-p3-highlight transition-colors cursor-pointer shadow-sm"
                    >
                      {isExpanded ? "HIDE DETAILS ▲" : "MORE INFO ▼"}
                    </button>

                    {/* DYNAMIC ACTION BUTTON */}
                    {renderQuizActionButton(quizId, quizStatus)}
                  </div>
                </div>

                {/* Expanded Telemetry Details */}
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
                        DEPLOYMENT CREATOR ID
                      </span>
                      <span className="font-kanit font-extrabold italic text-xs text-p3-primary -skew-x-6 break-all">
                        {quiz.created_by || quiz.creator_id || "SYSTEM_ADMIN"}
                      </span>
                    </div>

                    <div>
                      <span className="block font-rajdhani font-bold italic text-xs text-p3-muted -skew-x-6 uppercase tracking-wider mb-0.5">
                        DEPLOYED AT (UTC)
                      </span>
                      <span className="font-kanit font-extrabold italic text-xs text-p3-primary -skew-x-6">
                        {deployedAtText}
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
  );
}
