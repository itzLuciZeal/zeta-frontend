import { useState } from "react";
import { useQuiz } from "../../../context/QuizContext";
import type { AnswerOptionRead } from "../../../types/quiz.types";

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
    } catch (err) {
      console.error("Answer submission failed:", err);
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
    } catch (err) {
      console.error("Backtracking option submission error:", err);
    }
  };

  const handleFinishQuiz = async () => {
    if (activeAttempt) {
      await loadResults(activeAttempt.id);
    }
  };

  return (
    <div className="w-full max-w-4xl my-6 p-6 bg-p3-surface border-2 border-p3-primary shadow-2xl -skew-x-2">
      <div className="flex flex-col sm:flex-row items-center justify-between pb-4 mb-6 border-b border-p3-muted/20 gap-4">
        <div>
          <span className="font-jakarta font-extrabold text-xs -skew-x-6 px-3 py-1 bg-p3-primary text-p3-highlight uppercase">
            MODE: {mode}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-rajdhani font-bold italic text-xs text-p3-muted">TIME REMAINING:</span>
          <span className="font-kanit font-extrabold italic text-2xl text-red-500 -skew-x-6">
            {formatTime(timeRemainingSec)}
          </span>
        </div>
      </div>

      {mode === "SEQUENTIAL" && currentQuestion && (
        <div className="flex flex-col gap-6">
          <div className="font-kanit font-extrabold italic text-xl text-p3-primary">
            {currentQuestion.question_text}
          </div>

          <div className="flex flex-col gap-3">
            {currentQuestion.options.map((opt: AnswerOptionRead) => (
              <button
                key={opt.id}
                onClick={() => setSelectedOptionId(opt.id)}
                className={`p-4 text-left font-jakarta text-sm transition-all -skew-x-4 border-2 ${
                  selectedOptionId === opt.id
                    ? "bg-p3-primary text-p3-highlight border-p3-accent font-bold"
                    : "bg-p3-surface hover:bg-p3-highlight/20 border-p3-muted/30 text-p3-primary"
                }`}
              >
                {opt.option_text}
              </button>
            ))}
          </div>

          <div className="flex justify-end mt-4">
            <button
              disabled={!selectedOptionId || isSubmitting}
              onClick={handleSequentialSubmit}
              className="font-jakarta font-extrabold text-sm -skew-x-6 px-6 py-3 bg-p3-accent hover:bg-p3-accent/80 text-p3-primary uppercase tracking-widest cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "TRANSMITTING..." : "CONFIRM & NEXT"}
            </button>
          </div>
        </div>
      )}

      {mode === "BACKTRACKING" && questions.length > 0 && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-2 pb-4 border-b border-p3-muted/20">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-10 h-10 font-kanit font-bold italic text-sm -skew-x-6 border ${
                  currentIndex === idx
                    ? "bg-p3-accent text-p3-primary border-p3-primary"
                    : answersMap[q.id]
                    ? "bg-p3-primary text-p3-highlight border-p3-primary"
                    : "bg-p3-surface text-p3-muted border-p3-muted/40"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {questions[currentIndex] && (
            <div className="flex flex-col gap-4">
              <div className="font-kanit font-extrabold italic text-xl text-p3-primary">
                Q{currentIndex + 1}. {questions[currentIndex].question_text}
              </div>

              <div className="flex flex-col gap-3">
                {questions[currentIndex].options.map((opt: AnswerOptionRead) => {
                  const qId = questions[currentIndex].id;
                  const isSelected = answersMap[qId] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        handleSelectBacktrackingOption(qId, opt.id);
                        handleBacktrackingSubmitSingle(qId, opt.id);
                      }}
                      className={`p-4 text-left font-jakarta text-sm transition-all -skew-x-4 border-2 ${
                        isSelected
                          ? "bg-p3-primary text-p3-highlight border-p3-accent font-bold"
                          : "bg-p3-surface hover:bg-p3-highlight/20 border-p3-muted/30 text-p3-primary"
                      }`}
                    >
                      {opt.option_text}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mt-6 pt-4 border-t border-p3-muted/20">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="font-jakarta font-extrabold text-xs -skew-x-6 px-4 py-2 bg-p3-primary text-p3-highlight disabled:opacity-40"
            >
              PREVIOUS
            </button>

            <button
              onClick={handleFinishQuiz}
              className="font-jakarta font-extrabold text-xs -skew-x-6 px-6 py-2 bg-red-600 hover:bg-red-700 text-white uppercase tracking-wider"
            >
              FINISH & SUBMIT QUIZ
            </button>

            <button
              disabled={currentIndex === questions.length - 1}
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              className="font-jakarta font-extrabold text-xs -skew-x-6 px-4 py-2 bg-p3-primary text-p3-highlight disabled:opacity-40"
            >
              NEXT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
