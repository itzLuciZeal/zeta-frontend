import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QuizProvider, useQuiz } from "../../context/QuizContext";
import ActiveQuiz from "../dashboard/components/ActiveQuiz";

function QuizRunner() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { startQuiz, status, loading, error, activeAttempt, loadResults, results } = useQuiz();
  
  const initializationAttemptedRef = useRef<string | null>(null);
  const resultsLoadedRef = useRef<string | null>(null);

  useEffect(() => {
    if (quizId && initializationAttemptedRef.current !== quizId) {
      initializationAttemptedRef.current = quizId;
      void startQuiz(quizId);
    }
  }, [quizId, startQuiz]);

  useEffect(() => {
    if (
      (status === "COMPLETED" || status === "EXPIRED") &&
      activeAttempt?.id &&
      !results &&
      resultsLoadedRef.current !== activeAttempt.id
    ) {
      resultsLoadedRef.current = activeAttempt.id;
      void loadResults(activeAttempt.id);
    }
  }, [status, activeAttempt, results, loadResults]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-p3-primary font-kanit italic text-xl animate-pulse">
        INITIALIZING ASSESSMENT SESSION...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <div className="bg-red-600/20 border border-red-500 text-red-400 font-jakarta text-sm p-4 text-center max-w-md w-full">
          [ SESSION ERROR: {error} ]
        </div>
        <button
          onClick={() => navigate("/user/dashboard")}
          className="px-4 py-2 bg-p3-primary text-p3-highlight font-jakarta text-xs font-bold uppercase cursor-pointer hover:bg-p3-primary/80 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (results) {
    const stats = results.research_stats;
    const formattedDate = results.finished_at 
      ? new Date(results.finished_at).toLocaleString() 
      : "N/A";

    return (
      <div className="min-h-screen flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-4xl bg-p3-surface border-2 border-p3-primary p-6 sm:p-8 shadow-2xl -skew-x-1 flex flex-col gap-6">
          
          {/* Header & Status */}
          <div className="border-b border-p3-primary/30 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-p3-accent uppercase block mb-1">
                COMPLETED AT: {formattedDate}
              </span>
              <h1 className="font-kanit font-extrabold italic text-xl sm:text-2xl text-p3-primary uppercase">
                {results.title}
              </h1>
              <p className="font-jakarta text-xs text-p3-muted italic mt-1 max-w-2xl">
                {results.message}
              </p>
            </div>
            
            <div className="flex items-center gap-2 self-start sm:self-center">
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-mono uppercase text-p3-muted">PRESSURE GRADE</span>
                <span className="font-kanit font-extrabold text-2xl text-p3-accent">
                  {results.pressure_score_grade}
                </span>
              </div>
            </div>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-p3-primary/10 border border-p3-primary/30 p-3 text-center">
              <span className="block font-mono text-[10px] text-p3-muted uppercase">Accuracy Rate</span>
              <span className="font-kanit font-extrabold text-2xl text-p3-primary">
                {Math.round(stats?.accuracy_rate ?? 0)}%
              </span>
              <span className="block text-[10px] text-p3-accent font-mono mt-1">
                {results.accuracy_integrity_lvl}
              </span>
            </div>

            <div className="bg-p3-primary/10 border border-p3-primary/30 p-3 text-center">
              <span className="block font-mono text-[10px] text-p3-muted uppercase">Answers Breakdown</span>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="font-kanit font-bold text-lg text-green-400">{stats?.total_correct_answers ?? 0}</span>
                <span className="text-p3-muted text-xs">/</span>
                <span className="font-kanit font-bold text-lg text-red-400">{stats?.total_incorrect_answers ?? 0}</span>
                <span className="text-p3-muted text-xs">/</span>
                <span className="font-kanit font-bold text-lg text-amber-400">{stats?.total_skipped_answers ?? 0}</span>
              </div>
              <span className="block text-[9px] text-p3-muted font-mono mt-0.5">C / IC / SKP</span>
            </div>

            <div className="bg-p3-primary/10 border border-p3-primary/30 p-3 text-center">
              <span className="block font-mono text-[10px] text-p3-muted uppercase">Avg Response Time</span>
              <span className="font-kanit font-extrabold text-2xl text-p3-primary">
                {stats?.avg_response_time ?? 0}s
              </span>
              <span className="block text-[10px] text-p3-muted font-mono mt-1">
                Total: {stats?.sum_taken_secs ?? 0}s
              </span>
            </div>

            <div className="bg-p3-primary/10 border border-p3-primary/30 p-3 text-center">
              <span className="block font-mono text-[10px] text-p3-muted uppercase">Pressure Index</span>
              <span className="font-kanit font-extrabold text-2xl text-p3-accent">
                {stats?.pressure_score ?? 0}
              </span>
              <span className="block text-[10px] text-p3-muted font-mono mt-1">
                {results.pressure_score_info}
              </span>
            </div>
          </div>

          {/* Diagnostic Insights Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-p3-surface border border-p3-primary/30 p-4 font-jakarta text-xs text-p3-primary">
            <div className="space-y-2">
              <div>
                <span className="text-p3-accent font-bold uppercase text-[10px] block font-mono">Accuracy Classification</span>
                <p className="text-p3-primary">{results.accuracy_classification}</p>
              </div>
              <div>
                <span className="text-p3-accent font-bold uppercase text-[10px] block font-mono">Pacing Velocity</span>
                <p className="text-p3-primary">{results.avg_rs_pacing_velocity}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-p3-accent font-bold uppercase text-[10px] block font-mono">Telemetry Diagnosis</span>
                <p className="text-p3-primary">{results.avg_rs_diagnosis}</p>
              </div>
              <div>
                <span className="text-p3-accent font-bold uppercase text-[10px] block font-mono">Time Saved Ratio</span>
                <p className="text-p3-primary">
                  {((stats?.time_ratio_saved ?? 0) * 100).toFixed(1)}% ({stats?.sum_left_secs ?? 0}s left)
                </p>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => navigate("/user/dashboard")}
              className="px-6 py-3 bg-p3-primary text-p3-highlight font-jakarta font-extrabold text-xs -skew-x-6 uppercase tracking-wider cursor-pointer hover:bg-p3-primary/80 transition-colors"
            >
              RETURN TO DASHBOARD
            </button>
          </div>

        </div>
      </div>
    );
  }

  if (status === "COMPLETED" || status === "EXPIRED") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
        <div className="bg-p3-surface p-8 border-2 border-p3-primary text-center max-w-lg w-full -skew-x-2">
          <h2 className="font-kanit font-extrabold italic text-2xl text-p3-primary uppercase mb-2">
            ASSESSMENT {status}
          </h2>
          <p className="font-jakarta text-xs text-p3-muted italic mb-6">
            Your quiz session has concluded. Click below to load your performance results.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {activeAttempt && (
              <button
                onClick={() => void loadResults(activeAttempt.id)}
                className="px-6 py-3 bg-p3-accent text-p3-primary font-jakarta font-extrabold text-xs -skew-x-6 uppercase tracking-wider cursor-pointer hover:bg-p3-accent/80 transition-colors"
              >
                SEE RESULTS
              </button>
            )}
            <button
              onClick={() => navigate("/user/dashboard")}
              className="px-6 py-3 bg-p3-primary text-p3-highlight font-jakarta font-extrabold text-xs -skew-x-6 uppercase tracking-wider cursor-pointer hover:bg-p3-surface hover:text-p3-primary border border-p3-primary transition-colors"
            >
              RETURN TO DASHBOARD
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <ActiveQuiz />;
}

export default function QuizPage() {
  return (
    <QuizProvider>
      <QuizRunner />
    </QuizProvider>
  );
}
