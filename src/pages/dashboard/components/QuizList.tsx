import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  HelpCircle,
  CheckCircle2,
  Eye,
  Play,
  ChevronDown,
  ChevronUp,
  Filter,
  Sparkles,
  ShieldAlert,
  Calendar,
  User,
  Layers,
  Award,
  Radio
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

  const fetchQuizzes = async () => {
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
  };

  useEffect(() => {
    void fetchQuizzes();
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
      const attempt = await quizService.startQuiz(quizId);
      navigate(`/quiz/${quizId}`, { state: { attemptId: attempt.id } });
    } catch {
      navigate(`/quiz/${quizId}`);
    } finally {
      setStartingQuizId(null);
    }
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
        return "bg-p3-surface text-p3-accent border-p3-accent shadow-[0_0_12px_rgba(0,229,255,0.6)] animate-pulse";
      case "PUBLISHED":
        return "bg-p3-surface text-cyan-300 border-cyan-500/60 shadow-[0_0_8px_rgba(0,229,255,0.3)]";
      case "COMPLETED":
      case "COMPLETE":
        return "bg-p3-surface text-emerald-400 border-emerald-400/80 shadow-[0_0_10px_rgba(16,185,129,0.3)]";
      default:
        return "bg-p3-surface text-slate-400 border-slate-600";
    }
  };

  const filteredQuizzes = useMemo(() => {
    if (activeFilter === "ALL") return quizzes;
    return quizzes.filter((quiz: Quiz) => {
      const quizStatus = (quiz.status || "").toUpperCase();
      if (activeFilter === "COMPLETED") {
        return quizStatus === "COMPLETED" || quizStatus === "COMPLETE";
      }
      return quizStatus === activeFilter;
    });
  }, [quizzes, activeFilter]);

  const filterOptions: FilterStatus[] = ["ALL", "ACTIVE", "PUBLISHED", "COMPLETED"];

  const renderQuizActionButton = (quiz: Quiz) => {
    const quizId = quiz.id;
    const attemptId = quiz.latest_attempt_id;
    const attemptStatus = (quiz.latest_attempt_status || "").toLowerCase();
    const quizStatus = (quiz.status || "PUBLISHED").toUpperCase();

    if (attemptStatus === "completed" || (quizStatus === "COMPLETED" && attemptId)) {
      return (
        <button
          type="button"
          onClick={() => handleResultsClick(attemptId!)}
          className="flex-1 sm:flex-initial group relative px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-jakarta font-black text-[11px] sm:text-xs -skew-x-8 italic tracking-wider sm:tracking-widest uppercase transition-all duration-200 cursor-pointer shadow-[0_0_16px_rgba(0,229,255,0.5)] hover:shadow-[0_0_24px_rgba(0,229,255,0.8)] active:scale-95 border border-cyan-200 flex items-center justify-center space-x-1.5 sm:space-x-2"
        >
          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 skew-x-8 group-hover:scale-110 transition-transform shrink-0 text-slate-950" />
          <span className="skew-x-8 whitespace-nowrap">VIEW RESULTS</span>
        </button>
      );
    }

    switch (quizStatus) {
      case "ACTIVE":
        return (
          <button
            type="button"
            disabled={startingQuizId === quizId}
            onClick={() => void handleInitiateQuiz(quizId)}
            className="flex-1 sm:flex-initial group relative px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-jakarta font-black text-[11px] sm:text-xs -skew-x-8 italic tracking-wider sm:tracking-widest uppercase transition-all duration-200 cursor-pointer shadow-[0_0_16px_rgba(0,229,255,0.5)] hover:shadow-[0_0_24px_rgba(0,229,255,0.8)] active:scale-95 border border-cyan-200 flex items-center justify-center space-x-1.5 sm:space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {startingQuizId === quizId ? (
              <>
                <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 skew-x-8 animate-spin shrink-0 text-slate-950" />
                <span className="skew-x-8 whitespace-nowrap">INITIATING...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 skew-x-8 fill-current group-hover:scale-110 transition-transform shrink-0 text-slate-950" />
                <span className="skew-x-8 whitespace-nowrap">INITIATE NOW</span>
              </>
            )}
          </button>
        );

      case "PUBLISHED":
        return (
          <button
            type="button"
            disabled
            className="flex-1 sm:flex-initial px-3 sm:px-5 py-2 sm:py-2.5 bg-slate-900/80 text-slate-500 border border-slate-800 font-jakarta font-bold text-[10px] sm:text-xs -skew-x-8 italic tracking-wider uppercase cursor-not-allowed flex items-center justify-center space-x-1.5 opacity-70"
          >
            <Clock className="w-3.5 h-3.5 skew-x-8 shrink-0" />
            <span className="skew-x-8 whitespace-nowrap">AWAITING ACTIVATION</span>
          </button>
        );

      case "COMPLETED":
      case "COMPLETE":
        return (
          <button
            type="button"
            disabled
            className="flex-1 sm:flex-initial px-3 sm:px-5 py-2 sm:py-2.5 bg-slate-900/80 text-slate-500 border border-slate-800 font-jakarta font-bold text-[10px] sm:text-xs -skew-x-8 italic tracking-wider uppercase cursor-not-allowed flex items-center justify-center space-x-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 skew-x-8 text-emerald-500/50 shrink-0" />
            <span className="skew-x-8 whitespace-nowrap">COMPLETED</span>
          </button>
        );

      default:
        return (
          <button
            type="button"
            disabled
            className="flex-1 sm:flex-initial px-3 sm:px-5 py-2 sm:py-2.5 bg-slate-900/80 text-slate-600 border border-slate-800 font-jakarta font-bold text-[10px] sm:text-xs -skew-x-8 italic tracking-wider uppercase cursor-not-allowed"
          >
            UNAVAILABLE
          </button>
        );
    }
  };

  if (loading) {
    return (
      <div className="w-full mt-6 p-8 sm:p-12 flex flex-col items-center justify-center space-y-3 border-2 border-p3-primary/40 bg-p3-surface relative overflow-hidden -skew-x-3 shadow-[0_0_20px_rgba(0,85,255,0.2)]">
        <Radio className="w-8 h-8 sm:w-10 sm:h-10 text-p3-accent animate-spin z-10" />
        <div className="font-kanit font-black italic text-base sm:text-xl tracking-wider text-p3-accent z-10 animate-pulse uppercase text-center">
          SYNCING OPERATIVE ASSESSMENTS...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full mt-6 p-4 sm:p-6 bg-red-950/90 border-2 border-red-500 text-red-200 font-jakarta font-black -skew-x-3 sm:-skew-x-6 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_25px_rgba(239,68,68,0.4)]">
        <div className="flex items-center space-x-2.5">
          <ShieldAlert className="w-5 h-5 text-red-400 skew-x-3 sm:skew-x-6 shrink-0" />
          <span className="italic tracking-wider text-xs sm:text-sm skew-x-3 sm:skew-x-6 text-center sm:text-left">{error}</span>
        </div>
        <button
          type="button"
          onClick={() => void fetchQuizzes()}
          className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase italic tracking-widest transition-all cursor-pointer skew-x-3 sm:skew-x-6 active:scale-95"
        >
          RETRY SYNC
        </button>
      </div>
    );
  }

  return (
    <section className="w-full mt-4 sm:mt-6 flex flex-col space-y-4 sm:space-y-6 select-none overflow-x-hidden">
      
      {/* Header & Clean Filter Bar */}
      <div className="w-full flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-p3-primary/50 gap-3">
        
        {/* Title Block */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="p-1.5 sm:p-2 bg-p3-primary text-p3-highlight -skew-x-8 shadow-[0_0_15px_rgba(0,229,255,0.4)] shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 skew-x-8 text-p3-accent" />
          </div>
          <div>
            <h2 className="font-kanit font-black italic text-xl sm:text-2xl text-p3-highlight -skew-x-6 tracking-wide">
              AVAILABLE ASSESSMENTS
            </h2>
            <div className="flex items-center space-x-1.5 font-rajdhani font-extrabold italic text-[11px] sm:text-xs text-p3-accent tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-p3-accent animate-ping shrink-0"></span>
              <span>
                STATUS: {filteredQuizzes.length} OF {quizzes.length} DEPLOYED MODULES
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Wrap Filter Bar (Zero Overflow / Zero Scrollbars) */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Filter Label Badge */}
          <div className="px-3 py-1.5 bg-p3-primary/40 border border-p3-primary/70 -skew-x-8 flex items-center justify-center text-p3-accent shrink-0 shadow-[0_0_10px_rgba(0,85,255,0.2)]">
            <Filter className="w-3.5 h-3.5 skew-x-8" />
          </div>

          {/* Individual Skewed Filter Buttons */}
          {filterOptions.map((status) => {
            const isActive = activeFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setActiveFilter(status)}
                className={`px-3.5 sm:px-4 py-1.5 font-jakarta font-black text-[11px] sm:text-xs -skew-x-8 italic tracking-wider uppercase transition-all duration-200 cursor-pointer border ${
                  isActive
                    ? "bg-cyan-400 text-slate-950 border-cyan-200 shadow-[0_0_14px_rgba(0,229,255,0.7)]"
                    : "bg-slate-900/90 text-slate-400 border-slate-700/80 hover:text-cyan-300 hover:border-cyan-500/50 hover:bg-slate-800"
                }`}
              >
                <span className="inline-block skew-x-8">{status}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quiz List Cards */}
      <div className="w-full grid grid-cols-1 gap-4 sm:gap-6">
        {filteredQuizzes.length === 0 ? (
          <div className="w-full relative p-8 sm:p-12 text-center border-2 border-dashed border-p3-primary/40 bg-p3-surface/80 -skew-x-2 sm:-skew-x-3">
            <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-p3-accent/60 mx-auto mb-2 sm:mb-3 animate-bounce" />
            <p className="font-rajdhani font-extrabold italic text-sm sm:text-base text-slate-300 tracking-wider uppercase">
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
            const timeLimitText = timeLimitVal ? `${timeLimitVal}S` : "UNLIMITED";

            const timePerQuestionVal = quiz.time_per_question_sec;
            const timePerQuestionText = timePerQuestionVal
              ? `${timePerQuestionVal} SEC`
              : "NONE (GLOBAL LIMIT)";

            const allowBacktracking = quiz.allow_backtracking ?? false;
            const allowSynchronous = quiz.allow_synchronous ?? false;
            const deployedAtText = formatTimestamp(quiz.created_at);

            return (
              <div
                key={quizId}
                className="group relative w-full transition-all duration-300 ease-out hover:-translate-y-0.5 sm:hover:-translate-y-1"
              >
                {/* Outer Frame Accent */}
                <div className="absolute inset-0 bg-p3-primary/10 -skew-x-2 sm:-skew-x-3 border-2 border-p3-primary/60 group-hover:border-p3-accent transition-colors shadow-[0_0_15px_rgba(0,85,255,0.2)] group-hover:shadow-[0_0_25px_rgba(0,229,255,0.4)]"></div>

                {/* Main Card Container */}
                <div className="relative z-10 bg-p3-surface p-3.5 sm:p-6 flex flex-col space-y-3 sm:space-y-4 -skew-x-1 sm:-skew-x-2 border border-p3-primary/40">
                  <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex flex-col w-full max-w-3xl">
                      
                      {/* Meta Pills */}
                      <div className="flex items-center space-x-2 mb-2 flex-wrap gap-y-1.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] sm:text-[11px] font-jakarta font-black -skew-x-8 tracking-wider uppercase border ${getStatusBadgeStyle(
                            quizStatus
                          )}`}
                        >
                          <span className="inline-block skew-x-8">{quizStatus}</span>
                        </span>

                        <div className="flex items-center space-x-1.5 font-rajdhani font-bold italic text-[11px] sm:text-xs text-p3-accent -skew-x-6 uppercase tracking-wider bg-p3-canvas border border-p3-primary/50 px-2 py-0.5">
                          <HelpCircle className="w-3 h-3 text-p3-accent inline shrink-0" />
                          <span>QUESTIONS: {totalQuestions}</span>
                          <span className="text-p3-primary">/</span>
                          <Clock className="w-3 h-3 text-p3-accent inline shrink-0" />
                          <span>TIME LIMIT: {timeLimitText}</span>
                        </div>
                      </div>

                      {/* Clean Quiz Title */}
                      <h3 className="font-kanit font-black italic text-xl sm:text-2xl text-p3-highlight -skew-x-6 tracking-wide leading-tight">
                        {quiz.title || "UNTITLED ASSESSMENT MODULE"}
                      </h3>

                      {/* Unboxed Description */}
                      <p className="font-jakarta text-xs sm:text-sm text-slate-400 font-normal italic mt-2 leading-relaxed">
                        {quiz.description || "Operational assessment module ready for execution."}
                      </p>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
                      
                      {/* Dark Cyberpunk "MORE INFO" / "HIDE DETAILS" Toggle Button */}
                      <button
                        type="button"
                        onClick={() => toggleMoreInfo(quizId)}
                        className={`flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 sm:py-2.5 font-jakarta font-black text-[11px] sm:text-xs -skew-x-8 italic tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center justify-center space-x-1.5 border active:scale-95 ${
                          isExpanded
                            ? "bg-slate-900 border-2 border-cyan-400 text-cyan-300 shadow-[0_0_16px_rgba(0,229,255,0.35)]"
                            : "bg-slate-950/80 hover:bg-slate-900 text-slate-300 border-slate-700/80 hover:border-cyan-500/60 hover:text-cyan-300 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                        }`}
                      >
                        <span className="skew-x-8 whitespace-nowrap">
                          {isExpanded ? "HIDE DETAILS" : "MORE INFO"}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 skew-x-8 text-cyan-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 skew-x-8 text-slate-400 group-hover:text-cyan-400 transition-colors shrink-0" />
                        )}
                      </button>

                      {renderQuizActionButton(quiz)}
                    </div>
                  </div>

                  {/* Accordion Expanded View */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-p3-primary/50 bg-p3-canvas/90 text-p3-highlight p-3.5 sm:p-5 -skew-x-1 sm:-skew-x-2 border-l-4 border-l-p3-accent shadow-xl space-y-3 sm:space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
                        <div className="p-2.5 sm:p-3 bg-p3-surface border border-p3-primary/40 flex items-start space-x-2.5">
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-p3-accent shrink-0 mt-0.5" />
                          <div>
                            <span className="block font-rajdhani font-extrabold italic text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">
                              TIME PER QUESTION
                            </span>
                            <span className="font-kanit font-black italic text-xs sm:text-sm text-p3-highlight uppercase">
                              {timePerQuestionText}
                            </span>
                          </div>
                        </div>

                        <div className="p-2.5 sm:p-3 bg-p3-surface border border-p3-primary/40 flex items-start space-x-2.5">
                          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-p3-accent shrink-0 mt-0.5" />
                          <div>
                            <span className="block font-rajdhani font-extrabold italic text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">
                              MAX SCORE & ATTEMPTS
                            </span>
                            <span className="font-kanit font-black italic text-xs sm:text-sm text-p3-highlight uppercase">
                              {quiz.max_score || 100} PTS / {quiz.max_attempts || 1} ATTEMPT(S)
                            </span>
                          </div>
                        </div>

                        <div className="p-2.5 sm:p-3 bg-p3-surface border border-p3-primary/40 flex items-start space-x-2.5">
                          <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-p3-accent shrink-0 mt-0.5" />
                          <div>
                            <span className="block font-rajdhani font-extrabold italic text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">
                              NAVIGATION RULES
                            </span>
                            <div className="font-kanit font-extrabold italic text-[11px] sm:text-xs text-p3-highlight uppercase leading-tight mt-0.5">
                              <div>
                                BACKTRACKING:{" "}
                                <span className={allowBacktracking ? "text-emerald-400" : "text-rose-400"}>
                                  {allowBacktracking ? "ENABLED" : "DISABLED"}
                                </span>
                              </div>
                              <div>
                                MODE:{" "}
                                <span className="text-p3-accent">
                                  {allowSynchronous ? "SYNCHRONOUS" : "STANDARD"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-p3-primary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 text-[11px] sm:text-xs font-rajdhani font-bold italic text-slate-400 uppercase">
                        <div className="flex items-center space-x-1.5">
                          <User className="w-3 h-3 text-p3-accent shrink-0" />
                          <span>CREATOR ID:</span>
                          <span className="text-p3-accent font-mono tracking-normal truncate max-w-[180px] sm:max-w-none">
                            {quiz.created_by || "SYSTEM_ADMIN"}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3 h-3 text-p3-accent shrink-0" />
                          <span>DEPLOYED AT:</span>
                          <span className="text-p3-accent font-mono tracking-normal">
                            {deployedAtText}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
