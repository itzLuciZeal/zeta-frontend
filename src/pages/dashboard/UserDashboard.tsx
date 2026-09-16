import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getUserDashboardApi } from "../../services/dashboard.service";
import type { UserDashboardResponse } from "../../types/dashboard.types";
import QuizList from "./components/QuizList";
import Footer from "../../components/ui/Footer";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [data, setData] = useState<UserDashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await getUserDashboardApi();
        setData(res);
      } catch (err: any) {
        setError("FAILED TO LOAD DASHBOARD TELEMETRY");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const confirmLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      navigate("/login");
    }
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

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-8 select-none overflow-x-hidden">
      
      <div className="w-full flex flex-col items-center">
        {/* Top Header Section */}
        <header className="group relative w-full max-w-4xl my-6 flex flex-col sm:flex-row items-center justify-between p-6 transition-all duration-200 ease-out hover:translate-x-1">
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

          {/* Role Badge + Log Out Action */}
          <div className="z-10 mt-4 sm:mt-0 flex flex-col sm:flex-row items-center gap-3">
            <div className="font-jakarta font-extrabold text-xs -skew-x-8 px-4 py-1.5 bg-p3-primary text-p3-highlight italic tracking-widest uppercase">
              ROLE: {user_info.role}
            </div>
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-jakarta font-extrabold text-xs -skew-x-8 italic tracking-widest uppercase transition-colors cursor-pointer shadow-md"
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

        {/* Injected Active Quizzes Component */}
        <QuizList />
      </div>

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
