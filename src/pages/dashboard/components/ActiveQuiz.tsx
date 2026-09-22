import { useState, useEffect } from "react";
import { useQuiz } from "../../../context/QuizContext";
import type { AnswerOptionRead } from "../../../types/quiz.types";
import MathText from "../../../components/ui/MathText";
import {
  Zap,
  Clock,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Terminal,
  AlertTriangle,
  Send,
} from "lucide-react";

export default function ActiveQuiz() {
  const {
    mode,
    questions,
    currentQuestion,
    timeRemainingSec,
    submitAnswer,
    loadResults,
    activeAttempt,
  } = useQuiz();

  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answersMap, setAnswersMap] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Auto-skip logic when timer reaches 0 in SEQUENTIAL mode
  useEffect(() => {
    if (
      mode === "SEQUENTIAL" &&
      timeRemainingSec === 0 &&
      currentQuestion &&
      !isSubmitting
    ) {
      const handleTimeoutAutoSkip = async () => {
        setIsSubmitting(true);
        try {
          await submitAnswer(selectedOptionId || "");
          setSelectedOptionId("");
        } catch (err: unknown) {
          console.error("Auto-skip timeout error:", err);
        } finally {
          setIsSubmitting(false);
        }
      };
      void handleTimeoutAutoSkip();
    }
  }, [timeRemainingSec, mode, currentQuestion?.id, isSubmitting, selectedOptionId, submitAnswer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSequentialSubmit = async () => {
    if (!selectedOptionId || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await submitAnswer(selectedOptionId);
      setSelectedOptionId("");
    } catch (err: unknown) {
      console.error("Sequential submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectBacktrackingOption = (qId: string, optionId: string) => {
    setAnswersMap((prev) => ({ ...prev, [qId]: optionId }));
  };

  const handleBacktrackingSubmitSingle = async (qId: string, optionId: string) => {
    try {
      await submitAnswer(optionId, qId);
    } catch (err: unknown) {
      console.error("Backtracking option submission error:", err);
    }
  };

  const handleFinishQuiz = async () => {
    if (activeAttempt) {
      await loadResults(activeAttempt.id);
    }
  };

  const getOptionLabel = (index: number) => String.fromCharCode(65 + index); // A, B, C, D...

  const isTimeCritical = timeRemainingSec <= 10 && timeRemainingSec > 0;

  const sequentialQuestionIndex = currentQuestion
    ? questions.findIndex((q) => q.id === currentQuestion.id)
    : -1;

  return (
    <div className="min-h-[88vh] w-full flex items-center justify-center p-2 sm:p-4 md:p-6 select-none font-jakarta">
      {/* Outer Shell Container centered on screen */}
      <div className="w-full max-w-4xl mx-auto relative border-2 border-p3-primary bg-p3-surface/95 shadow-[0_0_35px_rgba(0,85,255,0.35)] backdrop-blur-md rounded-sm">
        
        {/* Top Header Label Badge */}
        <div className="absolute -top-3.5 left-4 sm:left-8 bg-p3-primary text-p3-highlight px-3.5 py-1 -skew-x-12 border border-p3-accent shadow-md flex items-center gap-2 z-20">
          <Terminal className="w-3.5 h-3.5 text-p3-accent animate-pulse" />
          <span className="font-kanit font-extrabold italic text-[11px] sm:text-xs tracking-widest uppercase">
            MODE // {mode}
          </span>
        </div>

        {/* Content Box */}
        <div className="p-4 sm:p-6 md:p-8 pt-7 sm:pt-9">
          
          {/* Top Control Bar HUD */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-5 border-b-2 border-p3-muted/50 gap-3">
            <div className="flex items-center gap-2 text-p3-accent">
              <Zap className="w-4 h-4 text-p3-accent" />
              <span className="font-mono text-[11px] sm:text-xs tracking-widest uppercase font-bold">
                [ SYSTEM ACTIVE ]
              </span>
            </div>

            {/* Timer Display with Animated Lightning Bolt */}
            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 bg-p3-surface px-3.5 py-1.5 border-2 border-p3-primary -skew-x-6 shadow-inner">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-p3-highlight/70" />
                <span className="font-rajdhani font-bold italic text-xs text-p3-highlight/70 uppercase tracking-wider">
                  TIME REMAINING:
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isTimeCritical && (
                  <Zap className="w-5 h-5 text-amber-400 animate-bounce drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
                )}
                <span
                  className={`font-kanit font-black italic text-xl sm:text-2xl md:text-3xl tracking-wider ${
                    isTimeCritical ? "text-red-500 animate-pulse" : "text-p3-primary"
                  }`}
                >
                  {formatTime(timeRemainingSec)}
                </span>
              </div>
            </div>
          </div>

          {/* Time Critical Warning Banner */}
          {isTimeCritical && (
            <div className="mb-4 p-2.5 bg-red-950/60 border border-red-500/80 -skew-x-3 flex items-center gap-3 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span className="font-kanit font-extrabold italic text-xs sm:text-sm text-red-200 tracking-wide uppercase">
                CRITICAL WARNING: Auto-advance triggering at 00:00!
              </span>
            </div>
          )}

          {/* ================= SEQUENTIAL MODE ================= */}
          {mode === "SEQUENTIAL" && currentQuestion && (
            <div className="flex flex-col gap-5 sm:gap-6">
              
              {/* Question Box */}
              <div className="relative bg-p3-surface border-l-4 border-p3-accent border-y border-r p-4 sm:p-5 -skew-x-1">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-p3-muted/30">
                  <div className="flex items-center gap-2">
                    <span className="bg-p3-primary text-p3-highlight font-kanit font-extrabold italic text-xs px-2.5 py-0.5 -skew-x-12 border border-p3-accent/50 flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-p3-accent" />
                      QUESTION {sequentialQuestionIndex >= 0 ? (sequentialQuestionIndex + 1).toString().padStart(2, "0") : "01"}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] sm:text-[10px] text-p3-accent/80 uppercase tracking-widest">
                    MATH_LATEX_RENDER
                  </span>
                </div>

                <div className="font-kanit font-bold italic text-lg sm:text-xl md:text-2xl text-p3-highlight leading-relaxed overflow-x-auto py-1">
                  <MathText text={currentQuestion.question_text} />
                </div>
              </div>

              {/* Answer Choices */}
              <div className="flex flex-col gap-2.5 sm:gap-3">
                {currentQuestion.options.map((opt: AnswerOptionRead, optIdx: number) => {
                  const isSelected = selectedOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedOptionId(opt.id)}
                      className={`group relative p-3.5 sm:p-4 text-left font-jakarta text-sm transition-all duration-150 -skew-x-2 border-2 cursor-pointer flex items-center gap-3.5 ${
                        isSelected
                          ? "bg-p3-primary text-p3-highlight border-p3-accent shadow-[0_0_15px_rgba(0,229,255,0.4)] translate-x-1 sm:translate-x-2"
                          : "bg-p3-surface/70 hover:bg-p3-muted/30 border-p3-muted/60 text-p3-highlight hover:border-p3-accent/60"
                      }`}
                    >
                      <span
                        className={`font-kanit font-extrabold italic text-sm sm:text-base px-2.5 sm:px-3 py-0.5 sm:py-1 -skew-x-12 border transition-colors shrink-0 ${
                          isSelected
                            ? "bg-p3-accent text-p3-surface border-p3-highlight"
                            : "bg-p3-muted text-p3-accent border-p3-accent/40 group-hover:border-p3-accent"
                        }`}
                      >
                        {getOptionLabel(optIdx)}
                      </span>

                      <div className="flex-1 overflow-x-auto font-medium text-sm sm:text-base text-p3-highlight">
                        <MathText text={opt.option_text} />
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-p3-accent shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end mt-2 pt-4 border-t border-p3-muted/30">
                <button
                  disabled={!selectedOptionId || isSubmitting}
                  onClick={handleSequentialSubmit}
                  className="w-full sm:w-auto font-jakarta font-extrabold text-xs sm:text-sm -skew-x-12 px-6 sm:px-8 py-3 sm:py-3.5 bg-p3-accent hover:bg-p3-accent/80 text-p3-surface uppercase tracking-widest cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border border-p3-highlight shadow-[0_0_15px_rgba(0,229,255,0.4)] active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  <span>{isSubmitting ? "TRANSMITTING..." : "CONFIRM & NEXT"}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= BACKTRACKING MODE ================= */}
          {mode === "BACKTRACKING" && questions.length > 0 && (
            <div className="flex flex-col gap-5 sm:gap-6">
              
              {/* Question Navigation Palette */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 pb-3.5 border-b border-p3-muted/40 max-h-36 overflow-y-auto">
                {questions.map((q, idx) => {
                  const isCurrent = currentIndex === idx;
                  const isAnswered = Boolean(answersMap[q.id]);
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-9 h-9 sm:w-10 sm:h-10 font-kanit font-extrabold italic text-xs sm:text-sm -skew-x-12 border-2 transition-all cursor-pointer flex items-center justify-center ${
                        isCurrent
                          ? "bg-p3-accent text-p3-surface border-p3-highlight shadow-[0_0_12px_#00E5FF] scale-105 z-10"
                          : isAnswered
                          ? "bg-p3-primary text-p3-highlight border-p3-accent/80"
                          : "bg-p3-surface text-p3-highlight/50 border-p3-muted/50 hover:border-p3-accent/50"
                      }`}
                    >
                      {(idx + 1).toString().padStart(2, "0")}
                    </button>
                  );
                })}
              </div>

              {/* Current Question View */}
              {questions[currentIndex] && (
                <div className="flex flex-col gap-4 sm:gap-5">
                  
                  {/* Question Card */}
                  <div className="relative bg-p3-surface border-l-4 border-p3-accent border-y border-r p-4 sm:p-5 -skew-x-1">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-p3-muted/30">
                      <div className="flex items-center gap-2">
                        <span className="bg-p3-primary text-p3-highlight font-kanit font-extrabold italic text-xs px-2.5 py-0.5 -skew-x-12 border border-p3-accent/50 flex items-center gap-1.5">
                          <Zap className="w-3 h-3 text-p3-accent" />
                          QUESTION {(currentIndex + 1).toString().padStart(2, "0")} / {questions.length.toString().padStart(2, "0")}
                        </span>
                      </div>
                      <span className="font-mono text-[9px] sm:text-[10px] text-p3-accent/80 uppercase tracking-widest">
                        MATH_LATEX_RENDER
                      </span>
                    </div>

                    <div className="font-kanit font-bold italic text-lg sm:text-xl md:text-2xl text-p3-highlight leading-relaxed overflow-x-auto py-1">
                      <MathText text={questions[currentIndex].question_text} />
                    </div>
                  </div>

                  {/* Answer Choices */}
                  <div className="flex flex-col gap-2.5 sm:gap-3">
                    {questions[currentIndex].options.map((opt: AnswerOptionRead, optIdx: number) => {
                      const qId = questions[currentIndex].id;
                      const isSelected = answersMap[qId] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            handleSelectBacktrackingOption(qId, opt.id);
                            void handleBacktrackingSubmitSingle(qId, opt.id);
                          }}
                          className={`group relative p-3.5 sm:p-4 text-left font-jakarta text-sm transition-all duration-150 -skew-x-2 border-2 cursor-pointer flex items-center gap-3.5 ${
                            isSelected
                              ? "bg-p3-primary text-p3-highlight border-p3-accent shadow-[0_0_15px_rgba(0,229,255,0.4)] translate-x-1 sm:translate-x-2"
                              : "bg-p3-surface/70 hover:bg-p3-muted/30 border-p3-muted/60 text-p3-highlight hover:border-p3-accent/60"
                          }`}
                        >
                          <span
                            className={`font-kanit font-extrabold italic text-sm sm:text-base px-2.5 sm:px-3 py-0.5 sm:py-1 -skew-x-12 border transition-colors shrink-0 ${
                              isSelected
                                ? "bg-p3-accent text-p3-surface border-p3-highlight"
                                : "bg-p3-muted text-p3-accent border-p3-accent/40 group-hover:border-p3-accent"
                            }`}
                          >
                            {getOptionLabel(optIdx)}
                          </span>

                          <div className="flex-1 overflow-x-auto font-medium text-sm sm:text-base text-p3-highlight">
                            <MathText text={opt.option_text} />
                          </div>

                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-p3-accent shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Navigation Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 mt-4 pt-4 border-t border-p3-muted/40">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="font-jakarta font-extrabold text-xs -skew-x-12 px-4 py-2.5 bg-p3-primary hover:bg-p3-primary/80 text-p3-highlight disabled:opacity-40 cursor-pointer border border-p3-accent/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>PREVIOUS</span>
                </button>

                <button
                  onClick={handleFinishQuiz}
                  className="font-jakarta font-extrabold text-xs -skew-x-12 px-5 py-3 bg-red-600 hover:bg-red-500 text-white uppercase tracking-widest cursor-pointer border border-red-300 shadow-[0_0_15px_rgba(239,68,68,0.4)] active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>FINISH QUIZ</span>
                </button>

                <button
                  disabled={currentIndex === questions.length - 1}
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="font-jakarta font-extrabold text-xs -skew-x-12 px-4 py-2.5 bg-p3-primary hover:bg-p3-primary/80 text-p3-highlight disabled:opacity-40 cursor-pointer border border-p3-accent/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>NEXT</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
