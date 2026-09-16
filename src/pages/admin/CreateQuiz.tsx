import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createQuizApi } from "../../services/quiz.service";
import Footer from "../../components/ui/Footer";
import type { QuizCreateResponse } from "../../types/quiz.types";

interface OptionFormState {
  option_text: string;
  is_correct: boolean;
}

interface QuestionFormState {
  question_text: string;
  options: OptionFormState[];
}

export default function CreateQuiz() {
  const navigate = useNavigate();

  // Quiz Meta State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [allowBacktracking, setAllowBacktracking] = useState(true);
  const [allowSynchronous, setAllowSynchronous] = useState(false);
  const [maxScore, setMaxScore] = useState<number>(100);
  const [maxAttempts, setMaxAttempts] = useState<number | "">(1);
  const [timeLimitSec, setTimeLimitSec] = useState<number | "">("");
  const [timePerQuestionSec, setTimePerQuestionSec] = useState<number | "">("");

  // Dynamic Questions State
  const [questions, setQuestions] = useState<QuestionFormState[]>([
    {
      question_text: "",
      options: [
        { option_text: "", is_correct: true },
        { option_text: "", is_correct: false },
      ],
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<QuizCreateResponse | null>(null);

  const btnBase =
    "px-4 py-2 font-jakarta font-extrabold text-xs -skew-x-8 italic tracking-wider uppercase transition-colors cursor-pointer shadow-md inline-flex items-center justify-center";

  // Safe Number Handlers
  const handleMaxScoreChange = (val: number) => {
    if (val < 0) {
      setError("WARNING: Negative numbers are not permitted for Max Score!");
      setMaxScore(1);
      return;
    }
    if (val > 200) {
      setError("WARNING: Max score cannot exceed 200!");
      setMaxScore(200);
      return;
    }
    setError(null);
    setMaxScore(val);
  };

  const handleMaxAttemptsChange = (val: string) => {
    if (val === "") {
      setMaxAttempts("");
      setError(null);
      return;
    }
    const num = Number(val);
    if (num < 0) {
      setError("WARNING: Negative numbers are not permitted for Max Attempts!");
      setMaxAttempts(1);
      return;
    }
    setError(null);
    setMaxAttempts(num);
  };

  const handleTimeLimitChange = (val: string) => {
    if (val === "") {
      setTimeLimitSec("");
      setError(null);
      return;
    }
    const num = Number(val);
    if (num < 0) {
      setError("WARNING: Negative numbers are not permitted for Global Time Limit!");
      setTimeLimitSec(0);
      return;
    }
    setError(null);
    setTimeLimitSec(num);
  };

  const handleTimePerQuestionChange = (val: string) => {
    if (val === "") {
      setTimePerQuestionSec("");
      setError(null);
      return;
    }
    const num = Number(val);
    if (num < 0) {
      setError("WARNING: Negative numbers are not permitted for Time / Question!");
      setTimePerQuestionSec(0);
      return;
    }
    setError(null);
    setTimePerQuestionSec(num);
  };

  // Question Handlers
  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question_text: "",
        options: [
          { option_text: "", is_correct: true },
          { option_text: "", is_correct: false },
        ],
      },
    ]);
  };

  const handleRemoveQuestion = (qIndex: number) => {
    if (questions.length === 1) {
      setError("Quiz must have at least one question.");
      return;
    }
    setQuestions((prev) => prev.filter((_, idx) => idx !== qIndex));
  };

  const handleQuestionTextChange = (qIndex: number, text: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex] = { ...updated[qIndex], question_text: text };
      return updated;
    });
  };

  const handleAddOption = (qIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      if (updated[qIndex].options.length >= 10) {
        return prev;
      }
      updated[qIndex] = {
        ...updated[qIndex],
        options: [...updated[qIndex].options, { option_text: "", is_correct: false }],
      };
      return updated;
    });
  };

  const handleRemoveOption = (qIndex: number, optIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      if (updated[qIndex].options.length <= 2) {
        return updated;
      }
      const targetOption = updated[qIndex].options[optIndex];
      const newOptions = updated[qIndex].options.filter((_, idx) => idx !== optIndex);

      if (targetOption.is_correct && !newOptions.some((o) => o.is_correct)) {
        newOptions[0].is_correct = true;
      }

      updated[qIndex] = {
        ...updated[qIndex],
        options: newOptions,
      };
      return updated;
    });
  };

  const handleOptionTextChange = (qIndex: number, optIndex: number, text: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const newOptions = updated[qIndex].options.map((opt, idx) =>
        idx === optIndex ? { ...opt, option_text: text } : opt
      );
      updated[qIndex] = { ...updated[qIndex], options: newOptions };
      return updated;
    });
  };

  const handleToggleCorrectOption = (qIndex: number, optIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const newOptions = updated[qIndex].options.map((opt, idx) => ({
        ...opt,
        is_correct: idx === optIndex,
      }));
      updated[qIndex] = { ...updated[qIndex], options: newOptions };
      return updated;
    });
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Quiz title is required.");
      return;
    }

    if (questions.length === 0) {
      setError("Quiz must have at least one question.");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question_text.trim() || questions[i].question_text.length < 3) {
        setError(`Question #${i + 1} text must be at least 3 characters.`);
        return;
      }

      for (let j = 0; j < questions[i].options.length; j++) {
        if (!questions[i].options[j].option_text.trim()) {
          setError(`Question #${i + 1}, Option #${j + 1} cannot be empty.`);
          return;
        }
      }

      const correctCount = questions[i].options.filter((opt) => opt.is_correct).length;
      if (correctCount === 0) {
        setError(`Question #${i + 1} must have at least one correct option.`);
        return;
      }
      if (correctCount > 1) {
        setError(`Question #${i + 1} can only have ONE correct option.`);
        return;
      }
    }

    try {
      setLoading(true);
      const payload = {
        title,
        description,
        status: status.toLowerCase(),
        shuffle_questions: shuffleQuestions,
        allow_backtracking: allowBacktracking,
        allow_synchronous: allowSynchronous,
        max_score: Number(maxScore),
        max_attempts: maxAttempts === "" ? null : Number(maxAttempts),
        time_limit_sec: !allowBacktracking
          ? null
          : timeLimitSec === ""
          ? null
          : Number(timeLimitSec),
        time_per_question_sec: allowBacktracking
          ? null
          : timePerQuestionSec === ""
          ? null
          : Number(timePerQuestionSec),
        questions: questions.map((q) => ({
          question_text: q.question_text,
          options: q.options.map((o) => ({
            option_text: o.option_text,
            is_correct: o.is_correct,
          })),
        })),
      };

      const res: QuizCreateResponse = await createQuizApi(payload);
      setSuccessData(res);
    } catch (err: any) {
      console.error("FULL FASTAPI 422 ERROR:", err.response?.data);

      const detail = err?.response?.data?.detail || err?.detail || err?.message;

      if (Array.isArray(detail)) {
        const formattedErrors = detail
          .map((d: any) => `${d.loc ? d.loc.join(" -> ") : "field"}: ${d.msg}`)
          .join(" | ");
        setError(formattedErrors);
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError("FAILED TO DEPLOY ASSESSMENT MODULE. Check console for details.");
      }
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS SCREEN FIX
  if (successData) {
    const quiz = successData.quiz;

    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-8 pb-28 select-none overflow-x-hidden">
        <div className="w-full max-w-2xl flex flex-col items-center my-auto">
          <div className="group relative w-full p-8 flex flex-col space-y-6 bg-p3-surface">
            <div className="absolute inset-0 bg-p3-highlight -skew-x-3 -z-1"></div>
            <div className="absolute bg-p3-primary skew-x-6 h-[104%] w-[105%] left-1/2 -translate-x-1/2 -z-2"></div>
            <div className="absolute bg-emerald-500/20 -skew-x-8 h-[108%] w-[110%] left-1/2 -translate-x-1/2 -z-3"></div>

            <div className="z-10 text-center space-y-2">
              <span className="bg-emerald-400 text-slate-950 font-jakarta font-extrabold text-xs px-3 py-1 uppercase -skew-x-6 inline-block">
                [ STATUS: DEPLOYMENT SUCCESSFUL ]
              </span>
              <h1 className="font-kanit font-extrabold italic text-3xl sm:text-4xl text-p3-primary -skew-x-6 uppercase tracking-wide">
                ASSESSMENT MODULE LIVE
              </h1>
              <p className="font-rajdhani font-bold italic text-xs sm:text-sm text-p3-muted uppercase tracking-wider">
                {successData.message || "SERVER RESPONSE RECEIVED & VERIFIED"}
              </p>
            </div>

            <div className="z-10 bg-p3-background border border-emerald-400/40 p-4 font-jakarta text-xs space-y-2 text-p3-primary">
              <div className="flex justify-between border-b border-p3-primary/10 pb-1">
                <span className="font-bold text-p3-muted">QUIZ ID:</span>
                <span className="font-mono text-emerald-400">{quiz?.id || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-p3-primary/10 pb-1">
                <span className="font-bold text-p3-muted">TITLE:</span>
                <span className="font-bold">{quiz?.title || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-p3-primary/10 pb-1">
                <span className="font-bold text-p3-muted">CREATOR:</span>
                <span className="font-bold text-emerald-400">{successData.creator_name || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-p3-primary/10 pb-1">
                <span className="font-bold text-p3-muted">STATUS:</span>
                <span className="font-bold text-cyan-300 uppercase">{quiz?.status || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-p3-primary/10 pb-1">
                <span className="font-bold text-p3-muted">MAX SCORE:</span>
                <span>{quiz?.max_score ?? "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-p3-muted">QUESTIONS COUNT:</span>
                <span>{quiz?.questions?.length ?? questions.length}</span>
              </div>
            </div>

            <div className="z-10 flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <button
                type="button"
                onClick={() => navigate("/admin")}
                className={`${btnBase} bg-emerald-400 text-slate-950 hover:bg-emerald-300 border border-emerald-300`}
              >
                RETURN TO ADMIN DASHBOARD →
              </button>
              <button
                type="button"
                onClick={() => {
                  setSuccessData(null);
                  setTitle("");
                  setDescription("");
                  setQuestions([
                    {
                      question_text: "",
                      options: [
                        { option_text: "", is_correct: true },
                        { option_text: "", is_correct: false },
                      ],
                    },
                  ]);
                }}
                className={`${btnBase} bg-p3-accent text-p3-primary hover:bg-p3-primary hover:text-p3-highlight border border-p3-primary`}
              >
                + CREATE ANOTHER MODULE
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-8 pb-28 select-none overflow-x-hidden">
      <div className="w-full max-w-4xl flex flex-col items-center">
        {/* Header */}
        <header className="group relative w-full my-6 flex flex-col sm:flex-row items-center justify-between p-6 transition-all duration-200 gap-4">
          <div className="absolute inset-0 bg-p3-highlight -skew-x-3 -z-1"></div>
          <div className="absolute bg-p3-primary skew-x-6 h-[104%] w-[105%] left-1/2 -translate-x-1/2 -z-2"></div>
          <div className="absolute bg-p3-accent -skew-x-8 h-[108%] w-[110%] left-1/2 -translate-x-1/2 -z-3"></div>

          <div className="z-10">
            <h1 className="font-extrabold italic text-3xl sm:text-4xl text-p3-primary font-kanit -skew-x-8 tracking-wide">
              CREATE ASSESSMENT MODULE
            </h1>
            <p className="font-rajdhani font-bold italic text-xs sm:text-sm text-p3-muted -skew-x-6 uppercase tracking-wider mt-1">
              OPERATOR AUTHORING INTERFACE
            </p>
          </div>

          <div className="z-10 flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className={`${btnBase} bg-p3-accent text-p3-primary hover:bg-p3-primary hover:text-p3-highlight border border-p3-primary`}
            >
              ← RETURN TO DASHBOARD
            </button>
          </div>
        </header>

        {error && (
          <div className="w-full bg-red-100 text-red-600 font-jakarta font-extrabold -skew-x-8 px-6 py-3 mb-6 text-center text-xs">
            [ ERROR: {error} ]
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col space-y-8">
          {/* Section 1: General Metadata */}
          <div className="group relative p-6 flex flex-col space-y-4">
            <div className="absolute inset-0 bg-p3-highlight -skew-x-2 -z-1"></div>
            <div className="absolute bg-p3-primary skew-x-3 h-[102%] w-[102%] left-1/2 -translate-x-1/2 -z-2"></div>

            <h2 className="z-10 font-kanit font-extrabold italic text-xl text-p3-primary -skew-x-6 uppercase border-b border-p3-primary/20 pb-2">
              1. General Parameters
            </h2>

            <div className="z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <label className="font-rajdhani font-bold text-xs text-p3-muted uppercase tracking-wider">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Advanced Cyber Security Protocols"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-p3-background border border-p3-primary/30 p-2 font-jakarta text-xs text-p3-primary focus:outline-none focus:border-p3-primary"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="font-rajdhani font-bold text-xs text-p3-muted uppercase tracking-wider">
                  Initial Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="bg-p3-background border border-p3-primary/30 p-2 font-jakarta text-xs text-p3-primary focus:outline-none focus:border-p3-primary uppercase font-bold"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                </select>
              </div>
            </div>

            <div className="z-10 flex flex-col space-y-1">
              <label className="font-rajdhani font-bold text-xs text-p3-muted uppercase tracking-wider">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Brief summary of the assessment objectives..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-p3-background border border-p3-primary/30 p-2 font-jakarta text-xs text-p3-primary focus:outline-none focus:border-p3-primary resize-none"
              />
            </div>

            <div className="z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="flex flex-col space-y-1">
                <label className="font-rajdhani font-bold text-xs text-p3-muted uppercase tracking-wider">
                  Max Score <span className="text-emerald-400">[RECOMMENDED: 100]</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={maxScore}
                  onChange={(e) => handleMaxScoreChange(Number(e.target.value))}
                  className="bg-p3-background border border-p3-primary/30 p-2 font-jakarta text-xs text-p3-primary focus:outline-none"
                />
                <span className="text-[10px] text-p3-muted font-jakarta">Range: 1 to 200</span>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="font-rajdhani font-bold text-xs text-p3-muted uppercase tracking-wider">
                  Max Attempts
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder="Infinite if blank"
                  value={maxAttempts}
                  onChange={(e) => handleMaxAttemptsChange(e.target.value)}
                  className="bg-p3-background border border-p3-primary/30 p-2 font-jakarta text-xs text-p3-primary focus:outline-none"
                />
                <span className="text-[10px] text-p3-muted font-jakarta">Blank = Infinite</span>
              </div>

              {/* Global Time Limit */}
              <div className="flex flex-col space-y-1">
                <label className="font-rajdhani font-bold text-xs text-p3-muted uppercase tracking-wider">
                  Global Time Limit (sec)
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder={!allowBacktracking ? "Disabled by Backtracking" : "Optional"}
                  disabled={!allowBacktracking}
                  value={!allowBacktracking ? "" : timeLimitSec}
                  onChange={(e) => handleTimeLimitChange(e.target.value)}
                  className={`bg-p3-background border border-p3-primary/30 p-2 font-jakarta text-xs text-p3-primary focus:outline-none ${
                    !allowBacktracking ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
                {!allowBacktracking && (
                  <span className="text-[10px] text-amber-400 font-jakarta font-bold">
                    [REMIND: Global time disabled because Allow Backtracking is FALSE]
                  </span>
                )}
              </div>

              {/* Time per Question */}
              <div className="flex flex-col space-y-1">
                <label className="font-rajdhani font-bold text-xs text-p3-muted uppercase tracking-wider">
                  Time / Question (sec)
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder={allowBacktracking ? "Disabled when Backtracking is on" : "Optional"}
                  disabled={allowBacktracking}
                  value={allowBacktracking ? "" : timePerQuestionSec}
                  onChange={(e) => handleTimePerQuestionChange(e.target.value)}
                  className={`bg-p3-background border border-p3-primary/30 p-2 font-jakarta text-xs text-p3-primary focus:outline-none ${
                    allowBacktracking ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
                {allowBacktracking && (
                  <span className="text-[10px] text-amber-400 font-jakarta font-bold">
                    [REMIND: Time per question disabled because Allow Backtracking is TRUE]
                  </span>
                )}
              </div>
            </div>

            {/* Toggles */}
            <div className="z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-p3-primary/20">
              <label className="flex items-center space-x-2 cursor-pointer font-jakarta text-xs text-p3-primary font-bold">
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="accent-p3-primary w-4 h-4"
                />
                <span>Shuffle Questions</span>
              </label>

              <div className="flex flex-col space-y-1">
                <label className="flex items-center space-x-2 cursor-pointer font-jakarta text-xs text-p3-primary font-bold">
                  <input
                    type="checkbox"
                    checked={allowBacktracking}
                    onChange={(e) => setAllowBacktracking(e.target.checked)}
                    className="accent-p3-primary w-4 h-4"
                  />
                  <span>Allow Backtracking</span>
                </label>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="flex items-center space-x-2 cursor-pointer font-jakarta text-xs text-p3-primary font-bold">
                  <input
                    type="checkbox"
                    checked={allowSynchronous}
                    onChange={(e) => setAllowSynchronous(e.target.checked)}
                    className="accent-p3-primary w-4 h-4"
                  />
                  <span>Synchronous Mode</span>
                </label>
                {allowSynchronous && (
                  <span className="text-[10px] text-cyan-300 font-jakarta">
                    [REMIND: Assessment will start the exact moment the admin activates the quiz.]
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Questions Builder */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-kanit font-extrabold italic text-xl text-p3-primary -skew-x-6 uppercase">
                2. Question Bank ({questions.length})
              </h2>
              <button
                type="button"
                onClick={handleAddQuestion}
                className={`${btnBase} bg-emerald-400 text-slate-950 hover:bg-emerald-300 border border-emerald-300`}
              >
                + ADD QUESTION
              </button>
            </div>

            {questions.map((question, qIndex) => (
              <div key={qIndex} className="group relative p-6 flex flex-col space-y-4 bg-p3-surface">
                <div className="absolute inset-0 bg-p3-highlight -skew-x-2 -z-1"></div>
                <div className="absolute bg-p3-primary skew-x-3 h-[102%] w-[102%] left-1/2 -translate-x-1/2 -z-2"></div>

                <div className="z-10 flex items-center justify-between border-b border-p3-primary/20 pb-2">
                  <span className="font-rajdhani font-bold italic text-xs text-p3-muted uppercase">
                    QUESTION #{qIndex + 1}
                  </span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIndex)}
                      className="text-xs font-jakarta font-bold text-red-400 hover:text-red-300 uppercase cursor-pointer"
                    >
                      [REMOVE QUESTION]
                    </button>
                  )}
                </div>

                <div className="z-10 flex flex-col space-y-1">
                  <label className="font-rajdhani font-bold text-xs text-p3-muted uppercase">
                    Question Text *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={`Enter prompt for question ${qIndex + 1}...`}
                    value={question.question_text}
                    onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                    className="bg-p3-background border border-p3-primary/30 p-2 font-jakarta text-xs text-p3-primary focus:outline-none focus:border-p3-primary"
                  />
                </div>

                {/* Options Builder */}
                <div className="z-10 space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-rajdhani font-bold text-[10px] text-p3-muted uppercase tracking-wider">
                      Answer Options ({question.options.length}/10)
                    </span>
                    {question.options.length < 10 ? (
                      <button
                        type="button"
                        onClick={() => handleAddOption(qIndex)}
                        className="text-[10px] font-jakarta font-bold text-cyan-400 hover:underline uppercase cursor-pointer"
                      >
                        + Add Option
                      </button>
                    ) : (
                      <span className="text-[10px] font-jakarta font-bold text-red-400 uppercase">
                        [MAX 10 REACHED]
                      </span>
                    )}
                  </div>

                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className="flex items-center gap-3 bg-p3-background p-2 border border-p3-primary/20"
                    >
                      <input
                        type="radio"
                        name={`correct-option-${qIndex}`}
                        title="Mark as correct answer"
                        checked={option.is_correct}
                        onChange={() => handleToggleCorrectOption(qIndex, optIndex)}
                        className="accent-emerald-400 w-4 h-4 cursor-pointer"
                      />
                      <input
                        type="text"
                        required
                        placeholder={`Option ${optIndex + 1} text...`}
                        value={option.option_text}
                        onChange={(e) =>
                          handleOptionTextChange(qIndex, optIndex, e.target.value)
                        }
                        className="flex-1 bg-transparent border-none font-jakarta text-xs text-p3-primary focus:outline-none"
                      />
                      {question.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(qIndex, optIndex)}
                          className="text-xs text-red-400 hover:text-red-300 font-bold px-2 cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 pb-12">
            <button
              type="submit"
              disabled={loading}
              className={`${btnBase} bg-emerald-400 text-slate-950 hover:bg-emerald-300 border border-emerald-300 text-sm py-3 px-8 shadow-[0_0_20px_rgba(52,211,153,0.4)]`}
            >
              {loading ? "DEPLOYING MODULE..." : "PUBLISH ASSESSMENT QUIZ →"}
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
