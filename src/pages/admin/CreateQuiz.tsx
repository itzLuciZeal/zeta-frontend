import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createQuizApi } from "../../services/quiz.service";
import Footer from "../../components/ui/Footer";
import MathText from "../../components/ui/MathText";
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
    "px-6 py-2.5 font-jakarta font-extrabold text-xs -skew-x-6 italic tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-lg inline-flex items-center justify-center active:translate-y-0.5 hover:-translate-y-0.5";

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
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { detail?: unknown } }; detail?: string; message?: string };
      console.error("FULL FASTAPI 422 ERROR:", errorObj.response?.data);

      const detail = errorObj?.response?.data?.detail || errorObj?.detail || errorObj?.message;

      if (Array.isArray(detail)) {
        const formattedErrors = detail
          .map((d: { loc?: string[]; msg: string }) => `${d.loc ? d.loc.join(" -> ") : "field"}: ${d.msg}`)
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

  // SUCCESS SCREEN
  if (successData) {
    const quiz = successData.quiz;

    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-8 pb-28 select-none text-p3-highlight">
        <div className="w-full max-w-2xl flex flex-col items-center my-auto">
          <div className="relative w-full p-8 flex flex-col space-y-6 bg-slate-900 border-2 border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.2)]">
            <div className="text-center space-y-2">
              <span className="bg-emerald-400 text-slate-950 font-jakarta font-black text-xs px-3 py-1 uppercase -skew-x-6 inline-block">
                [ STATUS: DEPLOYMENT SUCCESSFUL ]
              </span>
              <h1 className="font-kanit font-extrabold italic text-3xl sm:text-4xl text-emerald-400 -skew-x-6 uppercase tracking-wide">
                ASSESSMENT MODULE LIVE
              </h1>
              <p className="font-rajdhani font-bold italic text-xs sm:text-sm text-slate-400 uppercase tracking-wider">
                {successData.message || "SERVER RESPONSE RECEIVED & VERIFIED"}
              </p>
            </div>

            <div className="bg-slate-950 border border-emerald-500/30 p-4 font-jakarta text-xs space-y-2 text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="font-bold text-slate-500">QUIZ ID:</span>
                <span className="font-mono text-emerald-400 font-bold">{quiz?.id || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="font-bold text-slate-500">TITLE:</span>
                <span className="font-bold text-p3-highlight">{quiz?.title || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="font-bold text-slate-500">CREATOR:</span>
                <span className="font-bold text-emerald-400">{successData.creator_name || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="font-bold text-slate-500">STATUS:</span>
                <span className="font-bold text-cyan-300 uppercase">{quiz?.status || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="font-bold text-slate-500">MAX SCORE:</span>
                <span className="font-bold text-p3-highlight">{quiz?.max_score ?? "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-500">QUESTIONS COUNT:</span>
                <span className="font-bold text-emerald-400">{quiz?.questions?.length ?? questions.length}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <button
                type="button"
                onClick={() => navigate("/admin")}
                className={`${btnBase} bg-emerald-400 text-slate-950 hover:bg-emerald-300 border border-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.3)]`}
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
                className={`${btnBase} bg-slate-800 text-cyan-400 hover:bg-slate-700 hover:text-white border border-cyan-500/40`}
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
    <div className="min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-8 pb-28 select-none text-p3-highlight">
      <div className="w-full max-w-4xl flex flex-col items-center">
        
        {/* Sleek Persona 3 Header */}
        <header className="relative w-full my-6 flex flex-col sm:flex-row items-center justify-between p-6 bg-slate-900 border-l-4border-y border-r border-slate-800 shadow-2xl gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 bg-cyan-400 -skew-x-12 inline-block animate-pulse"></span>
              <span className="font-mono font-bold text-[10px] text-cyan-400 uppercase tracking-widest">
                [ SYSTEM AUTHORING MODE: ONLINE ]
              </span>
            </div>
            <h1 className="font-extrabold italic text-3xl sm:text-4xl text-white font-kanit -skew-x-6 tracking-wide">
              CREATE ASSESSMENT MODULE
            </h1>
            <p className="font-rajdhani font-bold italic text-xs sm:text-sm text-slate-400 uppercase tracking-wider mt-1">
              OPERATOR AUTHORING INTERFACE • TEX / LATEX FULLY SUPPORTED
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin")}
            className={`${btnBase} bg-cyan-400 text-slate-950 hover:bg-cyan-300 border border-cyan-300 font-black`}
          >
            ← RETURN TO DASHBOARD
          </button>
        </header>

        {error && (
          <div className="w-full bg-red-950/90 border-l-4 border-red-500 text-red-200 font-jakarta font-extrabold -skew-x-2 px-6 py-3 mb-6 text-center text-xs shadow-lg animate-pulse">
            [ ERROR: {error} ]
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col space-y-8">
          
          {/* Section 1: General Parameters */}
          <div className="relative p-6 sm:p-8 flex flex-col space-y-5 bg-slate-900/90 border border-slate-800 border-l-4 border-l-cyan-500 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-kanit font-extrabold italic text-xl text-white -skew-x-6 uppercase tracking-wider flex items-center gap-2">
                <span className="text-cyan-400 font-mono">01.</span> GENERAL PARAMETERS
              </h2>
              <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase">[ CONFIG ]</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col space-y-1.5">
                <label className="font-rajdhani font-bold text-xs text-slate-400 uppercase tracking-wider flex justify-between">
                  <span>Quiz Title *</span>
                  <span className="text-cyan-400 font-mono text-[10px]">REQUIRED</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Advanced Arithmetic & Sequences"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-slate-950 border border-slate-800 p-2.5 font-jakarta text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 transition-all"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="font-rajdhani font-bold text-xs text-slate-400 uppercase tracking-wider">
                  Initial Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="bg-slate-950 border border-slate-800 p-2.5 font-jakarta text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 uppercase font-bold transition-all"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="font-rajdhani font-bold text-xs text-slate-400 uppercase tracking-wider">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Brief summary of the assessment objectives..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-slate-950 border border-slate-800 p-2.5 font-jakarta text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 resize-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="flex flex-col space-y-1.5">
                <label className="font-rajdhani font-bold text-xs text-slate-400 uppercase tracking-wider">
                  Max Score
                </label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={maxScore}
                  onChange={(e) => handleMaxScoreChange(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-800 p-2 font-jakarta text-xs text-cyan-300 focus:outline-none focus:border-cyan-400"
                />
                <span className="text-[10px] text-slate-500 font-mono">Range: 1 to 200</span>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="font-rajdhani font-bold text-xs text-slate-400 uppercase tracking-wider">
                  Max Attempts
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder="Infinite"
                  value={maxAttempts}
                  onChange={(e) => handleMaxAttemptsChange(e.target.value)}
                  className="bg-slate-950 border border-slate-800 p-2 font-jakarta text-xs text-cyan-300 focus:outline-none focus:border-cyan-400"
                />
                <span className="text-[10px] text-slate-500 font-mono">Blank = Infinite</span>
              </div>

              {/* Global Time Limit */}
              <div className="flex flex-col space-y-1.5">
                <label className="font-rajdhani font-bold text-xs text-slate-400 uppercase tracking-wider">
                  Global Time (sec)
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder={!allowBacktracking ? "Disabled" : "Optional"}
                  disabled={!allowBacktracking}
                  value={!allowBacktracking ? "" : timeLimitSec}
                  onChange={(e) => handleTimeLimitChange(e.target.value)}
                  className={`bg-slate-950 border border-slate-800 p-2 font-jakarta text-xs text-cyan-300 focus:outline-none ${
                    !allowBacktracking ? "opacity-40 cursor-not-allowed bg-slate-900" : "focus:border-cyan-400"
                  }`}
                />
                {!allowBacktracking && (
                  <span className="text-[9px] text-amber-400 font-jakarta font-bold leading-tight">
                    [Requires Backtracking = TRUE]
                  </span>
                )}
              </div>

              {/* Time per Question */}
              <div className="flex flex-col space-y-1.5">
                <label className="font-rajdhani font-bold text-xs text-slate-400 uppercase tracking-wider">
                  Time / Question (sec)
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder={allowBacktracking ? "Disabled" : "Optional"}
                  disabled={allowBacktracking}
                  value={allowBacktracking ? "" : timePerQuestionSec}
                  onChange={(e) => handleTimePerQuestionChange(e.target.value)}
                  className={`bg-slate-950 border border-slate-800 p-2 font-jakarta text-xs text-cyan-300 focus:outline-none ${
                    allowBacktracking ? "opacity-40 cursor-not-allowed bg-slate-900" : "focus:border-cyan-400"
                  }`}
                />
                {allowBacktracking && (
                  <span className="text-[9px] text-amber-400 font-jakarta font-bold leading-tight">
                    [Requires Backtracking = FALSE]
                  </span>
                )}
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
              <label className="flex items-center space-x-3 cursor-pointer font-jakarta text-xs text-slate-300 font-bold group">
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="accent-cyan-400 w-4 h-4 cursor-pointer"
                />
                <span className="group-hover:text-cyan-300 transition-colors">Shuffle Questions</span>
              </label>

              <div className="flex flex-col space-y-1">
                <label className="flex items-center space-x-3 cursor-pointer font-jakarta text-xs text-slate-300 font-bold group">
                  <input
                    type="checkbox"
                    checked={allowBacktracking}
                    onChange={(e) => setAllowBacktracking(e.target.checked)}
                    className="accent-cyan-400 w-4 h-4 cursor-pointer"
                  />
                  <span className="group-hover:text-cyan-300 transition-colors">Allow Backtracking</span>
                </label>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="flex items-center space-x-3 cursor-pointer font-jakarta text-xs text-slate-300 font-bold group">
                  <input
                    type="checkbox"
                    checked={allowSynchronous}
                    onChange={(e) => setAllowSynchronous(e.target.checked)}
                    className="accent-cyan-400 w-4 h-4 cursor-pointer"
                  />
                  <span className="group-hover:text-cyan-300 transition-colors">Synchronous Mode</span>
                </label>
                {allowSynchronous && (
                  <span className="text-[9px] text-cyan-400 font-mono">
                    [Starts upon Admin manual trigger]
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Questions Builder */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-kanit font-extrabold italic text-xl text-white -skew-x-6 uppercase flex items-center gap-2">
                <span className="text-emerald-400 font-mono">02.</span> QUESTION BANK ({questions.length})
              </h2>
              <button
                type="button"
                onClick={handleAddQuestion}
                className={`${btnBase} bg-emerald-400 text-slate-950 hover:bg-emerald-300 border border-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)]`}
              >
                + ADD QUESTION
              </button>
            </div>

            {questions.map((question, qIndex) => (
              <div
                key={qIndex}
                className="relative p-6 sm:p-7 flex flex-col space-y-5 bg-slate-900/90 border border-slate-800 border-l-4 border-l-emerald-500 shadow-xl transition-all duration-200"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="font-rajdhani font-black text-sm text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="bg-cyan-950 text-cyan-400 border border-cyan-500/40 px-2 py-0.5 font-mono text-xs -skew-x-6">
                      Q.{String(qIndex + 1).padStart(2, "0")}
                    </span>
                    <span>QUESTION MODULE</span>
                  </span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIndex)}
                      className="text-xs font-jakarta font-bold text-red-400 hover:text-red-300 uppercase cursor-pointer transition-colors"
                    >
                      [ REMOVE QUESTION ]
                    </button>
                  )}
                </div>

                {/* Question Text Prompt */}
                <div className="flex flex-col space-y-1.5">
                  <label className="font-rajdhani font-bold text-xs text-slate-400 uppercase tracking-wider flex justify-between">
                    <span>Question Prompt * (LaTeX supported)</span>
                    <span className="text-cyan-400 text-[10px] font-mono">$e=mc^2$ or $$\sum x$$</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder={`e.g., Find the sum: $$\\sum_{k=1}^{38} (6k - 105) =$$`}
                    value={question.question_text}
                    onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                    className="bg-slate-950 border border-slate-800 p-2.5 font-jakarta text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 resize-y transition-all"
                  />

                  {/* Math Live Preview for Question Text */}
                  {question.question_text.trim() && (
                    <div className="mt-2 p-3 bg-slate-950 border border-cyan-500/40 font-jakarta text-sm">
                      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1 mb-2">
                        <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                          [ QUESTION MATH PREVIEW ]
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">RENDER ENGINE OK</span>
                      </div>
                      <div className="text-white overflow-x-auto py-1">
                        <MathText text={question.question_text} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Options Builder */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="font-rajdhani font-bold text-xs text-slate-400 uppercase tracking-wider">
                      Answer Options ({question.options.length}/10)
                    </span>
                    {question.options.length < 10 ? (
                      <button
                        type="button"
                        onClick={() => handleAddOption(qIndex)}
                        className="text-xs font-jakarta font-bold text-cyan-400 hover:text-cyan-300 uppercase cursor-pointer transition-colors"
                      >
                        + Add Option
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-red-400 uppercase">
                        [ MAX 10 LIMIT REACHED ]
                      </span>
                    )}
                  </div>

                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex flex-col space-y-1.5">
                      <div
                        className={`flex items-center gap-3 bg-slate-950 p-2.5 border transition-all ${
                          option.is_correct
                            ? "border-emerald-500/80 bg-emerald-950/20 shadow-[0_0_10px_rgba(52,211,153,0.15)]"
                            : "border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`correct-option-${qIndex}`}
                          checked={option.is_correct}
                          onChange={() => handleToggleCorrectOption(qIndex, optIndex)}
                          className="accent-emerald-400 w-4 h-4 cursor-pointer"
                          title="Set as correct answer"
                        />

                        <input
                          type="text"
                          required
                          placeholder={`Option #${optIndex + 1} text (e.g. $456$)`}
                          value={option.option_text}
                          onChange={(e) => handleOptionTextChange(qIndex, optIndex, e.target.value)}
                          className="flex-1 bg-transparent border-none p-1 font-jakarta text-xs text-white focus:outline-none"
                        />

                        {question.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(qIndex, optIndex)}
                            className="text-xs font-jakarta font-bold text-red-400 hover:text-red-300 uppercase cursor-pointer transition-colors px-1"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Math Live Preview for Option Text */}
                      {option.option_text.trim() && (
                        <div className="ml-6 px-3 py-1.5 bg-slate-950 border border-slate-800 text-xs text-cyan-300 flex items-center gap-2">
                          <span className="text-[9px] font-mono text-slate-500 uppercase">[ OPTION PREVIEW ]:</span>
                          <MathText text={option.option_text} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Action Bar */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`${btnBase} bg-cyan-400 text-slate-950 hover:bg-cyan-300 border border-cyan-300 text-sm px-8 py-3 shadow-[0_0_20px_rgba(0,240,255,0.3)] disabled:opacity-50`}
            >
              {loading ? "[ DEPLOYING MODULE... ]" : "DEPLOY ASSESSMENT MODULE →"}
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
