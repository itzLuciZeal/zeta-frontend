import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

interface ApiErrorShape {
  response?: {
    status?: number;
    data?: {
      detail?: string | { message?: string };
      message?: string;
    };
  };
}

const parseApiError = (err: unknown): string => {
  const error = err as ApiErrorShape;
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (typeof detail === "object" && detail !== null && detail.message) {
    return detail.message;
  }
  return error?.response?.data?.message || "VERIFICATION FAILED";
};

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number>(3);

  // Guard against React StrictMode double-mounting in development
  const hasExecuted = useRef<boolean>(false);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setIsSuccess(false);
      setStatusMessage("NO VERIFICATION TOKEN PROVIDED.");
      return;
    }

    if (hasExecuted.current) return;
    hasExecuted.current = true;

    const verifyToken = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/api/v1/auth/verify-email", {
          params: { token },
        });
        setIsSuccess(true);
        setStatusMessage(
          response?.data?.message?.toUpperCase() ||
            "ACCOUNT VERIFIED SUCCESSFULLY!"
        );
      } catch (err: unknown) {
        setIsSuccess(false);
        setStatusMessage(parseApiError(err).toUpperCase());
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  // Handle smooth Persona auto-redirect timer when token is valid
  useEffect(() => {
    if (!isSuccess) return;

    if (redirectCountdown <= 0) {
      navigate("/login");
      return;
    }

    const timer = setInterval(() => {
      setRedirectCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isSuccess, redirectCountdown, navigate]);

  return (
    <div className="relative flex flex-col items-center justify-start sm:justify-center min-h-dvh w-full select-none px-6 sm:px-8 py-8 sm:py-12 overflow-x-hidden overflow-y-auto">
      {/* Persona 3 Dynamic Keyframes */}
      <style>{`
        @keyframes slashReveal {
          0% {
            clip-path: polygon(0 0, 0 0, -20% 100%, -20% 100%);
            transform: skewX(-12deg) translateX(-20px);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            clip-path: polygon(0 0, 120% 0, 100% 100%, -20% 100%);
            transform: skewX(-3deg) translateX(0);
            opacity: 1;
          }
        }

        .animate-slash-reveal {
          animation: slashReveal 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slashBolt {
          0% {
            transform: scaleX(0) skewX(-15deg);
            opacity: 1;
            filter: drop-shadow(0 0 8px #00f0ff);
          }
          20% {
            transform: scaleX(1) skewX(-15deg);
            opacity: 1;
          }
          40% {
            opacity: 0.9;
          }
          100% {
            transform: scaleX(1.1) skewX(-15deg) translateX(200px);
            opacity: 0;
          }
        }

        .animate-slash-bolt {
          animation: slashBolt 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes radarScan {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(100%); opacity: 0; }
        }

        .animate-radar-scan {
          animation: radarScan 1.8s infinite ease-in-out;
        }
      `}</style>

      {/* Main Container Layer with Safe Horizontal Margins */}
      <div className="relative w-full max-w-70 xs:max-w-[300px] sm:max-w-sm my-auto z-10 transition-all duration-300 mx-auto">
        {/* Layer 1: Sharp Outer Slanted Frame */}
        <div className="absolute -inset-x-1.5 -inset-y-1.5 sm:-inset-x-2 sm:-inset-y-2 bg-linear-to-r from-blue-600 via-cyan-400 to-blue-800 -skew-x-6 opacity-30 border border-cyan-400/40 shadow-[0_0_20px_rgba(0,240,255,0.15)] pointer-events-none" />

        {/* Layer 2: Cobalt Blue Secondary Slanted Ribbon */}
        <div className="absolute -inset-x-1 -inset-y-1 sm:-inset-x-1.5 sm:-inset-y-1.5 bg-[#001340] skew-x-3 border-2 border-cyan-400/50 shadow-[4px_4px_0px_0px_#000c29] sm:shadow-[6px_6px_0px_0px_#000c29] pointer-events-none" />

        {/* Layer 3: Main Persona Card */}
        <div className="relative bg-p3-surface text-white p-3.5 sm:p-5 md:p-6 -skew-x-2 border-2 border-cyan-400 shadow-[6px_6px_0px_0px_#002288] sm:shadow-[10px_10px_0px_#002288] transition-all duration-300 overflow-hidden">
          {/* Header Banner Section */}
          <div className="flex flex-col items-center text-center mb-3 sm:mb-4 md:mb-5">
            <div className="inline-block bg-[#00f0ff] text-[#020612] px-3 py-0.5 sm:px-3.5 sm:py-0.5 -skew-x-12 mb-1.5 sm:mb-2 border-r-4 border-blue-800 shadow-[2px_2px_0px_0px_#001a66]">
              <span className="font-black italic text-[9px] sm:text-[10px] tracking-widest uppercase">
                SECURITY PROTOCOL
              </span>
            </div>
            <h1 className="font-black italic text-2xl sm:text-3xl md:text-4xl tracking-wider text-white -skew-x-6 drop-shadow-[2px_2px_0px_#00f0ff]">
              VERIFICATION
            </h1>
            <p className="font-black italic text-[10px] sm:text-xs text-cyan-300 tracking-wider mt-1.5 sm:mt-2 drop-shadow-[1px_1px_0px_#002288]">
              {isLoading
                ? "AUTHENTICATING SECURITY TOKEN..."
                : isSuccess
                ? "ACCESS GRANTED TO SYSTEM"
                : "VERIFICATION FAILED"}
            </p>
          </div>

          {/* Dynamic Content Area */}
          <div className="my-4 sm:my-5">
            {isLoading ? (
              /* Persona Loading Visualizer */
              <div className="relative overflow-hidden bg-[#051126] border-2 border-cyan-400/60 p-4 -skew-x-3 text-center shadow-[4px_4px_0px_0px_#001a66]">
                <div className="absolute inset-0 bg-cyan-400/10 pointer-events-none animate-radar-scan" />
                <div className="flex flex-col items-center justify-center gap-2 relative z-10">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-cyan-400 animate-ping" />
                    <span className="font-black italic text-xs tracking-widest text-cyan-300 uppercase">
                      DECRYPTING TOKEN...
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 overflow-hidden border border-cyan-400/40 mt-1">
                    <div className="h-full bg-linear-to-r from-cyan-400 to-blue-500 w-full animate-pulse" />
                  </div>
                </div>
              </div>
            ) : isSuccess ? (
              /* Success Banner & Redirect Progress */
              <div className="space-y-3">
                <div className="relative overflow-hidden bg-[#021a10] border-l-4 border-emerald-500 text-emerald-100 p-3 text-[10px] sm:text-[11px] font-black tracking-wide shadow-[4px_4px_0px_0px_#065f46] animate-slash-reveal">
                  <div className="absolute inset-0 bg-emerald-600/10 pointer-events-none" />
                  <div className="relative flex items-center gap-2 z-10">
                    <span className="bg-emerald-600 text-white w-4 h-4 rounded-none -skew-x-6 flex items-center justify-center text-[10px] font-black border border-emerald-300 shadow-[1px_1px_0px_#000]">
                      ✓
                    </span>
                    <p className="uppercase tracking-wider drop-shadow-[1px_1px_0px_#000]">
                      {statusMessage}
                    </p>
                  </div>
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-20 overflow-hidden">
                    <div className="absolute top-1/2 -left-20 w-[140%] h-0.5 bg-white -skew-y-3 animate-slash-bolt" />
                    <div className="absolute top-1/2 -left-20 w-[140%] h-1.5 bg-cyan-400 opacity-80 -skew-y-3 animate-slash-bolt filter blur-[1px]" />
                  </div>
                </div>

                {/* Redirect Countdown Indicator */}
                <div className="bg-[#081530] border border-cyan-400/40 p-2.5 -skew-x-3 text-center">
                  <div className="flex items-center justify-between text-[9px] font-black italic text-cyan-300 uppercase mb-1">
                    <span>REDIRECTING TO LOGIN</span>
                    <span>{redirectCountdown}S</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 border border-cyan-500/30 overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full transition-all duration-1000 ease-linear"
                      style={{ width: `${(redirectCountdown / 3) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Error Alert Container */
              <div className="relative overflow-hidden bg-[#1f0208] border-l-4 border-rose-500 text-rose-100 p-3 text-[10px] sm:text-[11px] font-black tracking-wide shadow-[4px_4px_0px_0px_#9f1239] animate-slash-reveal">
                <div className="absolute inset-0 bg-rose-600/10 pointer-events-none" />
                <div className="relative flex items-center gap-2 z-10">
                  <span className="bg-rose-600 text-white w-4 h-4 rounded-none -skew-x-6 flex items-center justify-center text-[10px] font-black border border-rose-300 shadow-[1px_1px_0px_#000]">
                    ✕
                  </span>
                  <p className="uppercase tracking-wider drop-shadow-[1px_1px_0px_#000]">
                    {statusMessage}
                  </p>
                </div>
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-20 overflow-hidden">
                  <div className="absolute top-1/2 -left-20 w-[140%] h-0.5 bg-white -skew-y-3 animate-slash-bolt" />
                  <div className="absolute top-1/2 -left-20 w-[140%] h-1.5 bg-cyan-400 opacity-80 -skew-y-3 animate-slash-bolt filter blur-[1px]" />
                </div>
              </div>
            )}
          </div>

          {/* Action Button Section */}
          {!isLoading && (
            <div className="relative group my-3.5 sm:my-4 transition-all duration-300">
              <Link
                to={isSuccess ? "/login" : "/resend-verification"}
                className="relative block w-full p-2.5 sm:p-3 -skew-x-3 border-2 border-cyan-400/80 bg-linear-to-r from-blue-700 via-blue-600 to-cyan-600 text-white shadow-[4px_4px_0px_0px_#001a66] sm:shadow-[5px_5px_0px_0px_#001a66] transition-all duration-300 ease-out overflow-hidden cursor-pointer outline-none hover:translate-x-1 hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-[4px_4px_0px_0px_#00f0ff] focus-visible:translate-x-1 focus-visible:-translate-y-0.5 focus-visible:border-cyan-300 focus-visible:shadow-[4px_4px_0px_0px_#00f0ff] active:scale-95 text-center"
              >
                <div className="absolute -inset-y-4 -inset-x-12 bg-linear-to-r from-transparent via-cyan-300/40 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full group-focus-within:translate-x-full transition-transform duration-700 ease-out pointer-events-none z-10" />
                <span className="relative z-10 font-black italic text-sm sm:text-base tracking-wider text-white uppercase group-hover:text-cyan-100 transition-colors">
                  {isSuccess ? "PROCEED TO LOGIN NOW" : "REQUEST NEW LINK"}
                </span>
              </Link>
            </div>
          )}

          {/* Footer Back Button */}
          <div className="text-center pt-3 border-t-2 border-cyan-900/60 flex justify-center">
            <Link
              to="/login"
              className="group relative inline-flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 -skew-x-12 border-2 border-cyan-400/70 hover:border-white focus-visible:border-white bg-[#081530] hover:bg-white focus-visible:bg-white text-cyan-300 hover:text-[#020612] focus-visible:text-[#020612] outline-none transition-all duration-200 hover:-translate-y-0.5 focus-visible:-translate-y-0.5 active:scale-95 active:translate-y-0 hover:shadow-[0px_3px_0px_0px_#00f0ff]"
            >
              <div className="absolute -top-2.5 left-2.5 sm:-top-3 sm:left-3 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-8 border-b-cyan-400 group-hover:border-b-white group-focus-visible:border-b-white transition-colors duration-200" />
              <span className="font-black italic text-[10px] sm:text-xs tracking-wider uppercase transition-colors duration-200 text-center">
                BACK TO{" "}
                <span className="text-white underline underline-offset-2 group-hover:text-[#020612] group-focus-visible:text-[#020612]">
                  LOGIN
                </span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
