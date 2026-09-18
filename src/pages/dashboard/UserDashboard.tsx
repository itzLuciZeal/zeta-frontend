import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getUserDashboardApi } from "../../services/dashboard.service";
import { quizService } from "../../services/quiz.service";
import type { UserDashboardResponse } from "../../types/dashboard.types";
import type { QuizAttemptResultResponse } from "../../types/quiz.types";
import QuizList from "./components/QuizList";
import Footer from "../../components/ui/Footer";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [data, setData] = useState<UserDashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);

  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [resultsData, setResultsData] = useState<QuizAttemptResultResponse | null>(null);
  const [loadingResults, setLoadingResults] = useState<boolean>(false);
  const [resultsError, setResultsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await getUserDashboardApi();
        setData(res);
      } catch {
        setError("FAILED TO LOAD DASHBOARD TELEMETRY");
      } finally {
        setLoading(false);
      }
    };

    void fetchDashboard();
  }, []);

  const confirmLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch {
      navigate("/login");
    }
  };

  const handleViewResults = async (attemptId: string) => {
    setSelectedAttemptId(attemptId);
    setLoadingResults(true);
    setResultsError(null);
    try {
      const res = await quizService.getAttemptResults(attemptId);
      setResultsData(res);
    } catch {
      setResultsError("FAILED TO FETCH PERFORMANCE RESULTS");
    } finally {
      setLoadingResults(false);
    }
  };

  const closeResultsModal = () => {
    setSelectedAttemptId(null);
    setResultsData(null);
    setResultsError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-p3-primary font-kanit italic text-2xl tracking-wider animate-pulse select-none">
        LOADING DATA...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 select-none">
        <div className="bg-red-100 text-red-600 font-jakarta font-extrabold -skew-x-8 px-6 py-4 rounded text-center">
          {error || "NO DATA AVAILABLE"}
        </div>
      </div>
    );
  }

  const { user_info, performance_summary } = data;
  const isAdmin = user_info.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "admin";

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-8 select-none overflow-x-hidden">
      <div className="w-full flex flex-col items-center">
        {/* Top Header Section */}
        <header className="group relative w-full max-w-4xl my-6 flex flex-col sm:flex-row items-center justify-between p-6 transition-all duration-200 ease-out hover:translate-x-1 gap-4">
          <div className="absolute inset-0 bg-p3-highlight -skew-x-3 -z-1 group-hover:-skew-x-8 transition-transform"></div>
          <div className="absolute bg-p3-primary skew-x-6 -top-1 -bottom-1 w-[calc(100%+19px)] left-1/2 -translate-x-1/2 -z-2 group-hover:skew-x-8 transition-transform"></div>
          <div className="absolute bg-p3-accent -skew-x-8 -top-2 -bottom-2 w-[calc(100%+34px)] left-1/2 -translate-x-1/2 -z-3 group-hover:-skew-x-12 transition-transform"></div>

          <div className="z-10">
            <h1 className="font-extrabold italic text-3xl sm:text-5xl text-p3-primary font-kanit -skew-x-8 tracking-wide">
              OPERATIVE DASHBOARD
            </h1>
            <p className="font-rajdhani font-bold italic text-sm sm:text-base text-p3-muted -skew-x-6">
              USER: {user_info.username.toUpperCase()} ({user_info.email})
            </p>
          </div>

          <div className="z-10 flex flex-row items-center gap-3 shrink-0 whitespace-nowrap">
            {isAdmin && (
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="px-4 py-1.5 bg-p3-accent text-p3-primary hover:bg-p3-primary hover:text-p3-highlight font-jakarta font-extrabold text-xs -skew-x-8 italic tracking-widest uppercase transition-colors cursor-pointer shadow-md border border-p3-primary whitespace-nowrap shrink-0"
              >
                ADMIN VIEW
              </button>
            )}
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-jakarta font-extrabold text-xs -skew-x-8 italic tracking-widest uppercase transition-colors cursor-pointer shadow-md whitespace-nowrap shrink-0"
            >
              LOG OUT
            </button>
          </div>
        </header>

        {/* Performance Summary Grid */}
        <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="group relative p-6 flex flex-col items-center justify-center min-h-40 transition-all duration-200 ease-out hover:scale-[1.02] hover:-translate-y-1 cursor-pointer">
            <div className="absolute inset-0 bg-p3-highlight -skew-x-3 -z-1 group-hover:-skew-x-6 transition-transform"></div>
            <div className="absolute bg-p3-primary skew-x-6 -top-1 -bottom-1 w-[calc(100%+12px)] left-1/2 -translate-x-1/2 -z-2 group-hover:skew-x-8 transition-transform"></div>
            <div className="absolute bg-p3-accent -skew-x-8 -top-2 -bottom-2 w-[calc(100%+24px)] left-1/2 -translate-x-1/2 -z-3 group-hover:-skew-x-12 transition-transform"></div>

            <span className="font-rajdhani font-bold italic text-xs text-p3-muted -skew-x-6">TOTAL COMPLETED</span>
            <span className="font-kanit font-extrabold italic text-4xl sm:text-5xl text-p3-primary -skew-x-8 my-2">
              {performance_summary.total_quizzes_completed}
            </span>
            <span className="font-jakarta text-xs text-p3-muted italic">QUIZZES</span>
          </div>

          <div className="group relative p-6 flex flex-col items-center justify-center min-h-40 transition-all duration-200 ease-out hover:scale-[1.02] hover:-translate-y-1 cursor-pointer">
            <div className="absolute inset-0 bg-p3-highlight -skew-x-3 -z-1 group-hover:-skew-x-6 transition-transform"></div>
            <div className="absolute bg-p3-primary skew-x-6 -top-1 -bottom-1 w-[calc(100%+12px)] left-1/2 -translate-x-1/2 -z-2 group-hover:skew-x-8 transition-transform"></div>
            <div className="absolute bg-p3-accent -skew-x-8 -top-2 -bottom-2 w-[calc(100%+24px)] left-1/2 -translate-x-1/2 -z-3 group-hover:-skew-x-12 transition-transform"></div>

            <span className="font-rajdhani font-bold italic text-xs text-p3-muted -skew-x-6">LIFETIME ACCURACY</span>
            <span className="font-kanit font-extrabold italic text-4xl sm:text-5xl text-p3-primary -skew-x-8 my-2">
              {performance_summary.lifetime_accuracy_rate}%
            </span>
            <span className="font-jakarta text-xs text-p3-muted italic">AVERAGE RATE</span>
          </div>

          <div className="group relative p-6 flex flex-col items-center justify-center min-h-40 transition-all duration-200 ease-out hover:scale-[1.02] hover:-translate-y-1 cursor-pointer">
            <div className="absolute inset-0 bg-p3-highlight -skew-x-3 -z-1 group-hover:-skew-x-6 transition-transform"></div>
            <div className="absolute bg-p3-primary skew-x-6 -top-1 -bottom-1 w-[calc(100%+12px)] left-1/2 -translate-x-1/2 -z-2 group-hover:skew-x-8 transition-transform"></div>
            <div className="absolute bg-p3-accent -skew-x-8 -top-2 -bottom-2 w-[calc(100%+24px)] left-1/2 -translate-x-1/2 -z-3 group-hover:-skew-x-12 transition-transform"></div>

            <span className="font-rajdhani font-bold italic text-xs text-p3-muted -skew-x-6">PRESSURE SCORE</span>
            <span className="font-kanit font-extrabold italic text-4xl sm:text-5xl text-p3-primary -skew-x-8 my-2">
              {performance_summary.lifetime_pressure_score}
            </span>
            <span className="font-jakarta text-xs text-p3-muted italic">INDEX RATING</span>
          </div>
        </main>

        {/* Quizzes Component */}
        <QuizList onViewResults={handleViewResults} />
      </div>

      {/* PERSONA 3 VIEW RESULTS MODAL */}
      {selectedAttemptId && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="relative bg-p3-surface p-6 sm:p-8 max-w-4xl w-full border-2 border-p3-primary shadow-[0_0_25px_rgba(0,85,255,0.4)] -skew-x-2 max-h-[90vh] overflow-y-auto flex flex-col gap-6">
            
            {/* Persona 3 Stylized Banner Bar */}
            <div className="bg-p3-primary p-3 -skew-x-6 flex items-center justify-between border-l-8 border-p3-accent">
              <h2 className="font-kanit font-extrabold italic text-2xl sm:text-3xl text-p3-highlight tracking-widest uppercase drop-shadow">
                VIEW RESULTS
              </h2>
              <span className="font-mono text-xs font-bold text-p3-accent tracking-widest bg-black/40 px-3 py-1 -skew-x-4">
                DATA_ID // {selectedAttemptId.slice(0, 8).toUpperCase()}
              </span>
            </div>

            {loadingResults ? (
              <div className="py-12 text-center font-kanit italic text-p3-primary animate-pulse text-xl tracking-wider">
                RETRIEVING PERFORMANCE DATA...
              </div>
            ) : resultsError ? (
              <div className="py-8 text-center bg-red-950/50 border border-red-600 text-red-500 font-jakarta font-extrabold uppercase -skew-x-4">
                {resultsError}
              </div>
            ) : resultsData ? (
              (() => {
                const stats = resultsData.research_stats;
                const formattedDate = resultsData.finished_at
                  ? new Date(resultsData.finished_at).toLocaleString()
                  : "N/A";

                return (
                  <>
                    {/* Header & Status Details */}
                    <div className="border-b-2 border-p3-primary/40 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <span className="text-xs font-mono tracking-widest text-p3-accent uppercase block mb-1">
                          SESSION COMPLETED: {formattedDate}
                        </span>
                        <h3 className="font-kanit font-extrabold italic text-2xl text-p3-primary uppercase -skew-x-4">
                          {resultsData.title}
                        </h3>
                        <p className="font-jakarta text-xs text-p3-muted italic mt-1 max-w-2xl">
                          {resultsData.message}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 bg-p3-primary/20 border border-p3-primary px-4 py-2 -skew-x-6">
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-mono uppercase text-p3-muted tracking-wider">GRADE</span>
                          <span className="font-kanit font-extrabold text-3xl text-p3-accent italic">
                            {resultsData.pressure_score_grade}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Core Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-p3-primary/15 border-2 border-p3-primary p-4 text-center -skew-x-3 shadow-md">
                        <span className="block font-mono text-[10px] text-p3-accent uppercase tracking-wider">Accuracy Rate</span>
                        <span className="font-kanit font-extrabold text-3xl text-p3-primary">
                          {Math.round(stats?.accuracy_rate ?? 0)}%
                        </span>
                        <span className="block text-[10px] text-p3-muted font-mono mt-1 uppercase">
                          {resultsData.accuracy_integrity_lvl}
                        </span>
                      </div>

                      <div className="bg-p3-primary/15 border-2 border-p3-primary p-4 text-center -skew-x-3 shadow-md">
                        <span className="block font-mono text-[10px] text-p3-accent uppercase tracking-wider">Answers Breakdown</span>
                        <div className="flex items-center justify-center gap-2 mt-1">
                          <span className="font-kanit font-bold text-xl text-green-400">{stats?.total_correct_answers ?? 0}</span>
                          <span className="text-p3-muted text-xs">/</span>
                          <span className="font-kanit font-bold text-xl text-red-400">{stats?.total_incorrect_answers ?? 0}</span>
                          <span className="text-p3-muted text-xs">/</span>
                          <span className="font-kanit font-bold text-xl text-amber-400">{stats?.total_skipped_answers ?? 0}</span>
                        </div>
                        <span className="block text-[9px] text-p3-muted font-mono mt-0.5 uppercase tracking-wider">
                          CORRECT / WRONG / SKIPPED
                        </span>
                      </div>

                      <div className="bg-p3-primary/15 border-2 border-p3-primary p-4 text-center -skew-x-3 shadow-md">
                        <span className="block font-mono text-[10px] text-p3-accent uppercase tracking-wider">Avg Response Time</span>
                        <span className="font-kanit font-extrabold text-3xl text-p3-primary">
                          {stats?.avg_response_time ?? 0}s
                        </span>
                        <span className="block text-[10px] text-p3-muted font-mono mt-1 uppercase">
                          Total: {stats?.sum_taken_secs ?? 0}s
                        </span>
                      </div>

                      <div className="bg-p3-primary/15 border-2 border-p3-primary p-4 text-center -skew-x-3 shadow-md">
                        <span className="block font-mono text-[10px] text-p3-accent uppercase tracking-wider">Pressure Index</span>
                        <span className="font-kanit font-extrabold text-3xl text-p3-accent">
                          {stats?.pressure_score ?? 0}
                        </span>
                        <span className="block text-[10px] text-p3-muted font-mono mt-1 uppercase">
                          {resultsData.pressure_score_info}
                        </span>
                      </div>
                    </div>

                    {/* Diagnostic Insights Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-p3-primary/10 border-2 border-p3-primary p-5 font-jakarta text-xs text-p3-primary -skew-x-2">
                      <div className="space-y-3">
                        <div>
                          <span className="text-p3-accent font-bold uppercase text-[10px] block font-mono tracking-wider">
                            Accuracy Classification
                          </span>
                          <p className="text-p3-primary font-semibold">{resultsData.accuracy_classification}</p>
                        </div>
                        <div>
                          <span className="text-p3-accent font-bold uppercase text-[10px] block font-mono tracking-wider">
                            Pacing Velocity
                          </span>
                          <p className="text-p3-primary font-semibold">{resultsData.avg_rs_pacing_velocity}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <span className="text-p3-accent font-bold uppercase text-[10px] block font-mono tracking-wider">
                            Telemetry Diagnosis
                          </span>
                          <p className="text-p3-primary font-semibold">{resultsData.avg_rs_diagnosis}</p>
                        </div>
                        <div>
                          <span className="text-p3-accent font-bold uppercase text-[10px] block font-mono tracking-wider">
                            Time Saved Ratio
                          </span>
                          <p className="text-p3-primary font-semibold">
                            {((stats?.time_ratio_saved ?? 0) * 100).toFixed(1)}% ({stats?.sum_left_secs ?? 0}s left)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={closeResultsModal}
                        className="px-8 py-3 bg-p3-primary text-p3-highlight hover:bg-p3-accent hover:text-p3-primary font-jakarta font-extrabold text-xs -skew-x-8 uppercase tracking-widest cursor-pointer transition-all border border-p3-primary shadow-lg"
                      >
                        CLOSE REPORT
                      </button>
                    </div>
                  </>
                );
              })()
            ) : null}
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="relative bg-p3-surface p-6 max-w-md w-full border-2 border-red-600 shadow-2xl -skew-x-2">
            <h3 className="font-kanit font-extrabold italic text-xl text-red-500 mb-2 uppercase tracking-wide">
              CONFIRM DEAUTHENTICATION
            </h3>
            <p className="font-jakarta text-xs text-p3-muted italic mb-6">
              Are you sure you want to log out? Your active session token will be invalidated on the server.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="font-jakarta font-extrabold text-xs -skew-x-6 px-4 py-2 bg-p3-primary text-p3-highlight hover:opacity-90 transition-opacity uppercase tracking-wider cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={confirmLogout}
                className="font-jakarta font-extrabold text-xs -skew-x-6 px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors uppercase tracking-wider cursor-pointer shadow-md"
              >
                YES, LOG OUT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Branded Footer */}
      <footer className="w-full max-w-4xl mt-12 mb-2 flex flex-col items-center justify-center text-center">
        <Footer />
      </footer>
    </div>
  );
}
