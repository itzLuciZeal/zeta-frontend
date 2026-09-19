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

type ActiveField = "email" | "password" | "submit" | null;

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUnverified, setIsUnverified] = useState<boolean>(false);
  const [activeField, setActiveField] = useState<ActiveField>(null);

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
    <div className="relative flex flex-col items-center justify-center min-h-screen select-none px-4 py-12 overflow-hidden">
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
      `}</style>

      {/* Reusable Persona Loading Indicator */}
      {isLoading && <PersonaLoading message="AUTHENTICATING USER..." />}

      {/* Main Container Layer */}
      <div className="relative w-full max-w-sm sm:max-w-md my-auto z-10">
        {/* Layer 1: Sharp Outer Slanted Frame */}
        <div className="absolute -inset-4 bg-linear-to-r from-blue-600 via-cyan-400 to-blue-800 -skew-x-6 opacity-30 border border-cyan-400/40 shadow-[0_0_20px_rgba(0,240,255,0.15)] transition-all duration-300" />

        {/* Layer 2: Cobalt Blue Secondary Slanted Ribbon */}
        <div className="absolute -inset-2 bg-[#001340] skew-x-3 border-2 border-cyan-400/50 shadow-[6px_6px_0px_0px_#000c29]" />

        {/* Layer 3: Main Persona Card */}
        <form
          className="relative bg-p3-surface text-white p-6 sm:p-8 -skew-x-2 border-2 border-cyan-400 shadow-[12px_12px_0px_0px_#002288] transition-all duration-300"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Header Banner Section */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="inline-block bg-[#00f0ff] text-[#020612] px-3.5 py-1 -skew-x-12 mb-2 border-r-4 border-blue-800 shadow-[3px_3px_0px_0px_#001a66]">
              <span className="font-black italic text-[11px] sm:text-xs tracking-widest uppercase">
                SYSTEM AUTHENTICATION
              </span>
            </div>
            <h1 className="font-black italic text-4xl sm:text-5xl tracking-wider text-white -skew-x-6 drop-shadow-[3px_3px_0px_#00f0ff]">
              LOGIN
            </h1>
            <p className="font-black italic text-xs sm:text-sm text-cyan-300 tracking-wider mt-1 drop-shadow-[1px_1px_0px_#002288]">
              WELCOME BACK TO ZETA
            </p>
          </div>

          {/* Dynamic Error & Verification Alert Banner */}
          {errorMessage && (
            <div className="relative overflow-hidden bg-[#1f0208] border-l-4 border-rose-500 text-rose-100 p-3.5 my-4 text-xs font-black tracking-wide shadow-[6px_6px_0px_0px_#9f1239] animate-slash-reveal">
              <div className="absolute inset-0 bg-rose-600/10 pointer-events-none" />

              <div className="relative flex items-center gap-2.5 z-10">
                <span className="bg-rose-600 text-white w-4 h-4 rounded-none -skew-x-6 flex items-center justify-center text-[10px] font-black border border-rose-300 shadow-[1px_1px_0px_0px_#000]">
                  ✕
                </span>
                <p className="uppercase tracking-wider drop-shadow-[1px_1px_0px_#000]">
                  {errorMessage}
                </p>
              </div>

              {isUnverified && (
                <div className="relative mt-2.5 pt-2 border-t border-rose-900/80 text-right z-10">
                  <Link
                    to="/resend-verification"
                    className="inline-block bg-rose-600 hover:bg-rose-500 active:scale-95 text-white px-3 py-1 text-[10px] font-black italic tracking-wider uppercase transition-all shadow-[2px_2px_0px_0px_#000]"
                  >
                    RESEND VERIFICATION LINK →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Form Options Section */}
          <div className="space-y-5 my-6">
            {/* Input Option 1: EMAIL */}
            <div
              className={`relative transition-all duration-300 transform ${
                activeField === "email" ? "translate-x-3" : "translate-x-0"
              }`}
              onMouseEnter={() => setActiveField("email")}
              onMouseLeave={() => setActiveField(null)}
            >

              {/* Input Card Container with P3R Polygon Shard Highlight */}
              <div
                className={`relative p-3 -skew-x-3 border-2 transition-all duration-200 overflow-hidden ${
                  activeField === "email"
                    ? "bg-white border-cyan-400 shadow-[6px_6px_0px_0px_#00f0ff] text-slate-950"
                    : "bg-[#081530] border-slate-700 text-slate-200"
                }`}
              >
                {/* Active Sharp Diagonal Angle Backdrop Accent */}
                {activeField === "email" && (
                  <div
                    className="absolute inset-0 bg-linear-to-r from-cyan-300 via-white to-cyan-100 pointer-events-none z-0"
                    style={{
                      clipPath: "polygon(0 0, 100% 0, 92% 100%, 0% 100%)",
                    }}
                  />
                )}

                <div className="relative z-10 flex items-center justify-between mb-1">
                  <label
                    className={`block text-[10px] font-black italic tracking-widest uppercase transition-colors ${
                      activeField === "email"
                        ? "text-blue-950"
                        : "text-cyan-400"
                    }`}
                  >
                    USER IDENTIFIER / EMAIL
                  </label>
                  <span
                    className={`text-[9px] font-black italic px-1.5 py-0.5 -skew-x-6 transition-colors ${
                      activeField === "email"
                        ? "bg-blue-950 text-white"
                        : "bg-cyan-950 text-cyan-400 border border-cyan-800"
                    }`}
                  >
                    01 // ID
                  </span>
                </div>
                <input
                  type="email"
                  placeholder="enter email..."
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  onFocus={() => setActiveField("email")}
                  onBlur={() => setActiveField(null)}
                  autoComplete="off"
                  spellCheck="false"
                  disabled={isLoading}
                  className={`relative z-10 w-full font-bold px-2.5 py-1.5 outline-none transition-all placeholder:italic -skew-x-2 text-sm ${
                    activeField === "email"
                      ? "bg-slate-100 border-b-4 border-slate-950 text-slate-950 placeholder:text-slate-400"
                      : "bg-[#030917] border-b-2 border-cyan-500/50 text-white placeholder:text-slate-500"
                  }`}
                />
              </div>
            </div>

            {/* Input Option 2: PASSWORD */}
            <div
              className={`relative transition-all duration-300 transform ${
                activeField === "password" ? "translate-x-3" : "translate-x-0"
              }`}
              onMouseEnter={() => setActiveField("password")}
              onMouseLeave={() => setActiveField(null)}
            >

              {/* Input Card Container with P3R Polygon Shard Highlight */}
              <div
                className={`relative p-3 -skew-x-3 border-2 transition-all duration-200 overflow-hidden ${
                  activeField === "password"
                    ? "bg-white border-cyan-400 shadow-[6px_6px_0px_0px_#00f0ff] text-slate-950"
                    : "bg-[#081530] border-slate-700 text-slate-200"
                }`}
              >
                {/* Active Sharp Diagonal Angle Backdrop Accent */}
                {activeField === "password" && (
                  <div
                    className="absolute inset-0 bg-linear-to-r from-cyan-300 via-white to-cyan-100 pointer-events-none z-0"
                    style={{
                      clipPath: "polygon(0 0, 100% 0, 92% 100%, 0% 100%)",
                    }}
                  />
                )}

                <div className="relative z-10 flex items-center justify-between mb-1">
                  <label
                    className={`block text-[10px] font-black italic tracking-widest uppercase transition-colors ${
                      activeField === "password"
                        ? "text-blue-950"
                        : "text-cyan-400"
                    }`}
                  >
                    SECURITY ACCESS KEY
                  </label>
                  <span
                    className={`text-[9px] font-black italic px-1.5 py-0.5 -skew-x-6 transition-colors ${
                      activeField === "password"
                        ? "bg-blue-950 text-white"
                        : "bg-cyan-950 text-cyan-400 border border-cyan-800"
                    }`}
                  >
                    02 // KEY
                  </span>
                </div>
                <input
                  type="password"
                  placeholder="enter password..."
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                  onFocus={() => setActiveField("password")}
                  onBlur={() => setActiveField(null)}
                  autoComplete="off"
                  disabled={isLoading}
                  className={`relative z-10 w-full font-bold px-2.5 py-1.5 outline-none transition-all placeholder:italic -skew-x-2 text-sm ${
                    activeField === "password"
                      ? "bg-slate-100 border-b-4 border-slate-950 text-slate-950 placeholder:text-slate-400"
                      : "bg-[#030917] border-b-2 border-cyan-500/50 text-white placeholder:text-slate-500"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex justify-end my-2">
            <Link
              to="/forgot-password"
              className="font-black italic text-xs text-cyan-400 hover:text-white active:scale-95 transition-all tracking-wide underline underline-offset-4 -skew-x-3 drop-shadow-[1px_1px_0px_#000]"
            >
              FORGOT PASSWORD?
            </Link>
          </div>

          {/* Submit Action Button Row */}
          <div
            className={`relative my-5 transition-all duration-300 transform ${
              activeField === "submit" ? "translate-x-3" : "translate-x-0"
            }`}
            onMouseEnter={() => setActiveField("submit")}
            onMouseLeave={() => setActiveField(null)}
          >

            <button
              type="submit"
              disabled={isLoading}
              onFocus={() => setActiveField("submit")}
              onBlur={() => setActiveField(null)}
              className="relative overflow-hidden w-full py-3.5 px-6 bg-linear-to-r from-blue-600 via-cyan-500 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-[#020612] font-black text-base sm:text-lg italic tracking-wider -skew-x-6 border-2 border-cyan-300 shadow-[6px_6px_0px_0px_#001a66] active:scale-[0.97] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-150 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 group"
            >
              {/* Button Hover Angle Highlight Sweep */}
              <div
                className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 85% 100%, 0% 100%)",
                }}
              />

              {isLoading ? (
                <span className="animate-pulse relative z-10">
                  AUTHENTICATING...
                </span>
              ) : (
                <>
                  <span className="relative z-10 group-hover:tracking-widest transition-all">
                    SUBMIT
                  </span>
                  <span className="relative z-10 text-xl group-hover:translate-x-1.5 transition-transform">
                    ➔
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Footer Signup Link */}
          <div className="text-center pt-3 border-t-2 border-cyan-900/60">
            <Link
              to="/signup"
              className="inline-block font-black italic text-xs sm:text-sm text-slate-300 hover:text-cyan-400 active:scale-95 transition-all tracking-wide -skew-x-3"
            >
              NEED AN ACCOUNT?{" "}
              <span className="text-cyan-400 underline underline-offset-2">
                SIGN UP
              </span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
