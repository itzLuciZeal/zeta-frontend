import { useState, useEffect, type ChangeEvent, type SubmitEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { PersonaLoading } from "../../components/ui/PersonaLoading";

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
  if (typeof detail === "object" && detail?.message) return detail.message;
  return error?.response?.data?.message || "AN UNEXPECTED ERROR OCCURRED";
};

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUnverified, setIsUnverified] = useState<boolean>(false);

  const { user, isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath =
        user.role === "admin" ? "/admin/dashboard" : "/user/dashboard";
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsUnverified(false);

    if (!email || !password) {
      setErrorMessage("PLEASE FILL IN ALL FIELDS");
      return;
    }

    try {
      await login({ email, password });
    } catch (err: unknown) {
      const error = err as ApiErrorShape;
      const status = error?.response?.status;
      const parsedError = parseApiError(err);

      if (status === 403) {
        setIsUnverified(true);
      }

      setErrorMessage(parsedError.toUpperCase());
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-start sm:justify-center h-dvh w-full select-none px-3 sm:px-4 py-8 sm:py-12 overflow-x-hidden overflow-y-auto">
      {/* Dynamic Keyframe Animations */}
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
      `}</style>

      {/* Reusable Persona Loading Indicator */}
      {isLoading && <PersonaLoading message="AUTHENTICATING USER..." />}

      {/* Main Container Layer - Scaled down on PC/Desktop via max-w-sm */}
      <div className="relative w-full max-w-70 xs:max-w-xs sm:max-w-sm md:max-w-sm my-auto z-10 transition-all duration-300 mx-auto">
        {/* Layer 1: Sharp Outer Slanted Frame (Mobile-safe horizontal offsets) */}
        <div className="absolute -inset-x-1.5 -inset-y-2 sm:-inset-3 md:-inset-3 bg-linear-to-r from-blue-600 via-cyan-400 to-blue-800 -skew-x-6 opacity-30 border border-cyan-400/40 shadow-[0_0_20px_rgba(0,240,255,0.15)] transition-all duration-300 pointer-events-none" />

        {/* Layer 2: Cobalt Blue Secondary Slanted Ribbon */}
        <div className="absolute -inset-x-1 -inset-y-1 sm:-inset-1.5 md:-inset-2 bg-[#001340] skew-x-3 border-2 border-cyan-400/50 shadow-[4px_4px_0px_0px_#000c29] sm:shadow-[6px_6px_0px_0px_#000c29] transition-all duration-300 pointer-events-none" />

        {/* Layer 3: Main Persona Card */}
        <form
          className="relative bg-p3-surface text-white p-4 sm:p-6 md:p-6 -skew-x-2 border-2 border-cyan-400 shadow-[8px_8px_0px_0px_#002288] sm:shadow-[10px_10px_0px_#002288] transition-all duration-300"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Header Banner Section */}
          <div className="flex flex-col items-center text-center mb-3 sm:mb-4 md:mb-5">
            <div className="inline-block bg-[#00f0ff] text-[#020612] px-3 py-0.5 sm:px-3.5 sm:py-0.5 -skew-x-12 mb-1.5 sm:mb-2 border-r-4 border-blue-800 shadow-[2px_2px_0px_0px_#001a66]">
              <span className="font-black italic text-[9px] sm:text-[10px] md:text-[10px] tracking-widest uppercase">
                SYSTEM AUTHENTICATION
              </span>
            </div>
            <h1 className="font-black italic text-2xl sm:text-3xl md:text-4xl tracking-wider text-white -skew-x-6 drop-shadow-[2px_2px_0px_#00f0ff]">
              LOGIN
            </h1>
            <p className="font-black italic text-[10px] sm:text-xs md:text-xs text-cyan-300 tracking-wider mt-2 sm:mt-3 drop-shadow-[1px_1px_0px_#002288]">
              WELCOME BACK TO ZETA
            </p>
          </div>

          {/* Smooth-Expanding Anti-Jank Error Alert Container */}
          <div
            className={`grid transition-all duration-300 ease-out ${
              errorMessage
                ? "grid-rows-[1fr] opacity-100 my-2.5 sm:my-3"
                : "grid-rows-[0fr] opacity-0 my-0"
            }`}
          >
            <div className="overflow-hidden">
              {errorMessage && (
                <div
                  key={errorMessage}
                  className="relative overflow-hidden bg-[#1f0208] border-l-4 border-rose-500 text-rose-100 p-2.5 sm:p-3 text-[10px] sm:text-[11px] font-black tracking-wide shadow-[4px_4px_0px_0px_#9f1239] animate-slash-reveal"
                >
                  <div className="absolute inset-0 bg-rose-600/10 pointer-events-none" />

                  <div className="relative flex items-center gap-2 z-10">
                    <span className="bg-rose-600 text-white w-3.5 h-3.5 rounded-none -skew-x-6 flex items-center justify-center text-[9px] font-black border border-rose-300 shadow-[1px_1px_0px_#000]">
                      ✕
                    </span>
                    <p className="uppercase tracking-wider drop-shadow-[1px_1px_0px_#000]">
                      {errorMessage}
                    </p>
                  </div>

                  {/* Slash Bolt Elements (White bolt + Cyan Glow) */}
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-20 overflow-hidden">
                    <div className="absolute top-1/2 -left-20 w-[140%] h-0.5 bg-white -skew-y-3 animate-slash-bolt" />
                    <div className="absolute top-1/2 -left-20 w-[140%] h-1.5 bg-cyan-400 opacity-80 -skew-y-3 animate-slash-bolt filter blur-[1px]" />
                  </div>

                  {isUnverified && (
                    <div className="relative mt-2 pt-2 border-t border-rose-900/80 text-right z-10">
                      <Link
                        to="/resend-verification"
                        className="inline-block bg-rose-600 hover:bg-rose-500 focus-visible:bg-rose-500 active:scale-95 text-white px-2 py-0.5 sm:px-2.5 sm:py-1 text-[8px] sm:text-[9px] font-black italic tracking-wider uppercase transition-all outline-none shadow-[2px_2px_0px_0px_#000] focus-visible:shadow-[4px_4px_0px_0px_#00f0ff]"
                      >
                        RESEND VERIFICATION LINK →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Form Options Section */}
          <div className="space-y-3 sm:space-y-3.5 md:space-y-4 my-3 sm:my-4 md:my-5">
            {/* Input Option 1: EMAIL */}
            <div className="relative group">
              <div className="relative p-2 sm:p-2.5 md:p-2.5 -skew-x-3 border-2 transition-all duration-200 ease-out overflow-hidden bg-[#081530] border-slate-700 text-slate-200 focus-within:translate-x-1 focus-within:-translate-y-0.5 focus-within:border-cyan-400 focus-within:shadow-[4px_4px_0px_0px_#00f0ff] focus-within:bg-[#0a1c3f]">
                <div className="absolute -inset-y-4 -inset-x-12 bg-linear-to-r from-transparent via-cyan-400/30 to-transparent -skew-x-12 -translate-x-full group-focus-within:translate-x-full transition-transform duration-700 ease-out pointer-events-none z-10" />

                <div className="relative z-10 flex items-center justify-between mb-1">
                  <label className="block text-[8px] sm:text-[9px] md:text-[9px] font-black italic tracking-widest uppercase transition-colors text-slate-400 group-focus-within:text-cyan-300">
                    EMAIL
                  </label>
                  <span className="text-[7px] sm:text-[8px] md:text-[8px] font-black italic px-1.5 py-0.2 -skew-x-6 transition-colors bg-slate-900 text-slate-400 border border-slate-700 group-focus-within:bg-cyan-400 group-focus-within:text-[#020612] group-focus-within:border-cyan-300">
                    01 // PING
                  </span>
                </div>
                <input
                  type="email"
                  placeholder="Enter email..."
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  autoComplete="off"
                  spellCheck="false"
                  disabled={isLoading}
                  className="relative z-10 w-full font-bold px-2 py-1 sm:px-2 sm:py-1 outline-none transition-all placeholder:italic -skew-x-2 text-[11px] sm:text-xs md:text-xs bg-[#030917] border-b-2 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:bg-[#051126]"
                />
              </div>
            </div>

            {/* Input Option 2: PASSWORD */}
            <div className="relative group">
              <div className="relative p-2 sm:p-2.5 md:p-2.5 -skew-x-3 border-2 transition-all duration-200 ease-out overflow-hidden bg-[#081530] border-slate-700 text-slate-200 focus-within:translate-x-1 focus-within:-translate-y-0.5 focus-within:border-cyan-400 focus-within:shadow-[4px_4px_0px_0px_#00f0ff] focus-within:bg-[#0a1c3f]">
                <div className="absolute -inset-y-4 -inset-x-12 bg-linear-to-r from-transparent via-cyan-400/30 to-transparent -skew-x-12 -translate-x-full group-focus-within:translate-x-full transition-transform duration-700 ease-out pointer-events-none z-10" />

                <div className="relative z-10 flex items-center justify-between mb-1">
                  <label className="block text-[8px] sm:text-[9px] md:text-[9px] font-black italic tracking-widest uppercase transition-colors text-slate-400 group-focus-within:text-cyan-300">
                    PASSWORD
                  </label>
                  <span className="text-[7px] sm:text-[8px] md:text-[8px] font-black italic px-1.5 py-0.2 -skew-x-6 transition-colors bg-slate-900 text-slate-400 border border-slate-700 group-focus-within:bg-cyan-400 group-focus-within:text-[#020612] group-focus-within:border-cyan-300">
                    02 // ENCRYPTION KEY
                  </span>
                </div>
                <input
                  type="password"
                  placeholder="Enter password..."
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                  autoComplete="off"
                  disabled={isLoading}
                  className="relative z-10 w-full font-bold px-2 py-1 sm:px-2 sm:py-1 outline-none transition-all placeholder:italic -skew-x-2 text-[11px] sm:text-xs md:text-xs bg-[#030917] border-b-2 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:bg-[#051126]"
                />
              </div>
            </div>
          </div>

          {/* Persona 3 Stylized "FORGOT PASSWORD" Link with Skill Block Cutout */}
          <div className="flex justify-end my-2 sm:my-2.5">
            <Link
              to="/forgot-password"
              className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1 -skew-x-12 border-2 border-cyan-400/60 hover:border-white focus-visible:border-white bg-[#020c24] hover:bg-white focus-visible:bg-white transition-all duration-200 outline-none hover:-translate-x-1 focus-visible:-translate-x-1 active:scale-95 shadow-[2px_2px_0px_0px_#002288] sm:shadow-[3px_3px_0px_0px_#002288] hover:shadow-[-2px_2px_0px_0px_#00f0ff] sm:hover:shadow-[-3px_3px_0px_0px_#00f0ff]"
            >
              {/* Top-Right Sharp Persona 3 Polygon Banner Accent */}
              <div className="absolute -top-2 -right-1.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-cyan-400 group-hover:bg-[#020612] group-focus-visible:bg-[#020612] [clip-path:polygon(100%_0,0_100%,100%_100%)] transition-colors duration-200 z-20 pointer-events-none" />

              <span className="text-[8px] sm:text-[9px] font-black italic px-1 py-0.2 bg-cyan-400 text-[#020612] group-hover:bg-[#020612] group-hover:text-cyan-400 group-focus-visible:bg-[#020612] group-focus-visible:text-cyan-400 -skew-x-12 transition-colors duration-200">
                RESET
              </span>
              <span className="font-black italic text-[10px] sm:text-[11px] tracking-wider text-cyan-300 group-hover:text-[#020612] group-focus-visible:text-[#020612] transition-colors duration-200 drop-shadow-[1px_1px_0px_#000] group-hover:drop-shadow-none group-focus-visible:drop-shadow-none">
                FORGOT PASSWORD?
              </span>
            </Link>
          </div>

          {/* Persona 3 Hover & Tab-Focus Submit Button */}
          <div className="relative group my-3.5 sm:my-4 md:my-5 transition-all duration-300">
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full p-2.5 sm:p-3 -skew-x-3 border-2 border-cyan-400/80 bg-linear-to-r from-blue-700 via-blue-600 to-cyan-600 text-white shadow-[4px_4px_0px_0px_#001a66] sm:shadow-[5px_5px_0px_0px_#001a66] transition-all duration-300 ease-out overflow-hidden cursor-pointer outline-none hover:translate-x-1 hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-[4px_4px_0px_0px_#00f0ff] focus-visible:translate-x-1 focus-visible:-translate-y-0.5 focus-visible:border-cyan-300 focus-visible:shadow-[4px_4px_0px_0px_#00f0ff] active:scale-95 active:translate-x-0 active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute -inset-y-4 -inset-x-12 bg-linear-to-r from-transparent via-cyan-300/40 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full group-focus-within:translate-x-full transition-transform duration-700 ease-out pointer-events-none z-10" />

              <div className="relative z-10 flex items-center justify-center gap-2">
                <span className="font-black italic text-sm sm:text-base tracking-wider text-white group-hover:text-cyan-100 group-focus-visible:text-cyan-100 transition-colors">
                  {isLoading ? "SUBMITTING..." : "SUBMIT"}
                </span>
                <span className="text-base sm:text-lg font-black text-cyan-300 group-hover:text-white group-focus-visible:text-white group-hover:translate-x-1 group-focus-visible:translate-x-1 transition-transform duration-200">
                </span>
              </div>
            </button>
          </div>

          {/* Persona 3 Stylized "NEED AN ACCOUNT" Footer Button with Sharp Triangle Cutout */}
          <div className="text-center pt-2.5 border-t-2 border-cyan-900/60 flex justify-center">
            <Link
              to="/signup"
              className="group relative inline-flex flex-wrap items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 -skew-x-12 border-2 border-cyan-400/70 hover:border-white focus-visible:border-white bg-[#081530] hover:bg-white focus-visible:bg-white text-cyan-300 hover:text-[#020612] focus-visible:text-[#020612] outline-none transition-all duration-200 hover:-translate-y-0.5 focus-visible:-translate-y-0.5 active:scale-95 active:translate-y-0 hover:shadow-[0px_3px_0px_0px_#00f0ff] sm:hover:shadow-[0px_4px_0px_0px_#00f0ff] focus-visible:shadow-[0px_3px_0px_0px_#00f0ff]"
            >
              {/* Persona 3 Top Skill Wedge Triangle */}
              <div className="absolute -top-2.5 left-2.5 sm:-top-3 sm:left-3 w-0 h-0 border-l-[6px] sm:border-l-8 border-l-transparent border-r-[6px] sm:border-r-8 border-r-transparent border-b-8 sm:border-b-10 border-b-cyan-400 group-hover:border-b-white group-focus-visible:border-b-white transition-colors duration-200" />

              <span className="font-black italic text-[10px] sm:text-xs tracking-wider uppercase transition-colors duration-200 text-center">
                NEED AN ACCOUNT?{" "}
                <span className="text-white underline underline-offset-2 group-hover:text-[#020612] group-focus-visible:text-[#020612]">
                  SIGN UP
                </span>
              </span>
              <span className="text-[8px] sm:text-[9px] font-black italic px-1.5 py-0.2 -skew-x-12 bg-cyan-400 text-[#020612] group-hover:bg-[#020612] group-hover:text-cyan-400 group-focus-visible:bg-[#020612] group-focus-visible:text-cyan-400 transition-colors duration-200">
                JOIN
              </span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
