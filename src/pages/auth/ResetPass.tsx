import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { resetPassApi } from "../../services/auth.service";

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
  return error?.response?.data?.message || "RESET FAILED";
};

export default function ResetPassPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  const navigate = useNavigate();

  // Dynamic Validation Helpers for Real-time Visual Feedback
  const isPasswordValid =
    newPassword.length >= 8 && newPassword.length <= 72 && !passwordError;
  const isConfirmValid =
    confirmPassword.length > 0 &&
    confirmPassword === newPassword &&
    !confirmError;

  // onBlur Validation Handlers
  const handlePasswordBlur = () => {
    if (!newPassword) {
      setPasswordError("NEW PASSWORD IS REQUIRED");
    } else if (newPassword.length < 8) {
      setPasswordError("PASSWORD MUST BE AT LEAST 8 CHARACTERS");
    } else if (newPassword.length > 72) {
      setPasswordError("PASSWORD CANNOT EXCEED 72 CHARACTERS");
    } else {
      setPasswordError(null);
    }
  };

  const handleConfirmBlur = () => {
    if (!confirmPassword) {
      setConfirmError("PLEASE CONFIRM NEW PASSWORD");
    } else if (newPassword !== confirmPassword) {
      setConfirmError("PASSWORDS DO NOT MATCH");
    } else {
      setConfirmError(null);
    }
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!token) {
      setErrorMessage("INVALID OR MISSING RESET TOKEN");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setErrorMessage("PLEASE FILL IN ALL FIELDS");
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 72) {
      setErrorMessage("PASSWORD MUST BE BETWEEN 8 AND 72 CHARACTERS");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("PASSWORDS DO NOT MATCH");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await resetPassApi({
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      const successText = res?.message || "PASSWORD RESET SUCCESSFUL";
      setSuccessMessage(`${successText.toUpperCase()}. REDIRECTING TO LOGIN...`);

      setNewPassword("");
      setConfirmPassword("");

      setIsRedirecting(true);

      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err: unknown) {
      setErrorMessage(parseApiError(err).toUpperCase());
    } finally {
      setIsSubmitting(false);
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

      {/* Main Container Layer */}
      <div className="relative w-full max-w-70 xs:max-w-xs sm:max-w-sm md:max-w-sm my-auto z-10 transition-all duration-300 mx-auto">
        {/* Layer 1: Sharp Outer Slanted Frame */}
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
              <span className="font-black italic text-[9px] sm:text-[10px] tracking-widest uppercase">
                PASSWORD RECOVERY
              </span>
            </div>
            <h1 className="font-black italic text-2xl sm:text-3xl md:text-4xl tracking-wider text-white -skew-x-6 drop-shadow-[2px_2px_0px_#00f0ff]">
              NEW PASSWORD
            </h1>
            <p className="font-black italic text-[10px] sm:text-xs text-cyan-300 tracking-wider mt-2 sm:mt-3 drop-shadow-[1px_1px_0px_#002288]">
              CREATE A NEW PASSWORD FOR YOUR ACCOUNT
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
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-20 overflow-hidden">
                    <div className="absolute top-1/2 -left-20 w-[140%] h-0.5 bg-white -skew-y-3 animate-slash-bolt" />
                    <div className="absolute top-1/2 -left-20 w-[140%] h-1.5 bg-cyan-400 opacity-80 -skew-y-3 animate-slash-bolt filter blur-[1px]" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Smooth-Expanding Anti-Jank Success Alert Container */}
          <div
            className={`grid transition-all duration-300 ease-out ${
              successMessage
                ? "grid-rows-[1fr] opacity-100 my-2.5 sm:my-3"
                : "grid-rows-[0fr] opacity-0 my-0"
            }`}
          >
            <div className="overflow-hidden">
              {successMessage && (
                <div
                  key={successMessage}
                  className="relative overflow-hidden bg-[#021a10] border-l-4 border-emerald-500 text-emerald-100 p-2.5 sm:p-3 text-[10px] sm:text-[11px] font-black tracking-wide shadow-[4px_4px_0px_0px_#065f46] animate-slash-reveal"
                >
                  <div className="absolute inset-0 bg-emerald-600/10 pointer-events-none" />
                  <div className="relative flex items-center gap-2 z-10">
                    <span className="bg-emerald-600 text-white w-3.5 h-3.5 rounded-none -skew-x-6 flex items-center justify-center text-[9px] font-black border border-emerald-300 shadow-[1px_1px_0px_#000]">
                      ✓
                    </span>
                    <p className="uppercase tracking-wider drop-shadow-[1px_1px_0px_#000]">
                      {successMessage}
                    </p>
                  </div>
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-20 overflow-hidden">
                    <div className="absolute top-1/2 -left-20 w-[140%] h-0.5 bg-white -skew-y-3 animate-slash-bolt" />
                    <div className="absolute top-1/2 -left-20 w-[140%] h-1.5 bg-cyan-400 opacity-80 -skew-y-3 animate-slash-bolt filter blur-[1px]" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Options Section */}
          <div className="space-y-3 sm:space-y-3.5 md:space-y-4 my-3 sm:my-4 md:my-5">
            {/* Input 1: NEW PASSWORD */}
            <div className="relative group">
              <div
                className={`relative p-2 sm:p-2.5 -skew-x-3 border-2 transition-all duration-200 ease-out overflow-hidden ${
                  passwordError
                    ? "border-rose-500 bg-[#180509]"
                    : isPasswordValid
                    ? "border-emerald-700/80 focus-within:border-emerald-400 bg-[#021f14]/50 shadow-[0_0_12px_rgba(52,211,153,0.25)] focus-within:shadow-[0_0_16px_rgba(52,211,153,0.4)]"
                    : "border-slate-700 bg-[#081530] focus-within:border-cyan-400 focus-within:shadow-[4px_4px_0px_0px_#00f0ff] focus-within:bg-[#0a1c3f]"
                } text-slate-200 focus-within:translate-x-1 focus-within:-translate-y-0.5`}
              >
                <div className="absolute -inset-y-4 -inset-x-12 bg-linear-to-r from-transparent via-cyan-400/30 to-transparent -skew-x-12 -translate-x-full group-focus-within:translate-x-full transition-transform duration-700 ease-out pointer-events-none z-10" />

                <div className="relative z-10 flex items-center justify-between mb-1">
                  <label
                    className={`block text-[8px] sm:text-[9px] font-black italic tracking-widest uppercase transition-colors ${
                      isPasswordValid
                        ? "text-emerald-400 group-focus-within:text-emerald-300"
                        : "text-slate-400 group-focus-within:text-cyan-300"
                    }`}
                  >
                    NEW PASSWORD
                  </label>
                  <div className="flex items-center gap-1.5">
                    {isPasswordValid && (
                      <span className="flex items-center gap-1 px-1.5 py-0.2 bg-emerald-500 text-[#020612] font-black italic text-[7px] sm:text-[8px] -skew-x-12 border border-emerald-300 shadow-[1.5px_1.5px_0px_#000] animate-slash-reveal">
                        <span className="text-[9px] leading-none">✓</span> OK
                      </span>
                    )}
                    <span
                      className={`text-[7px] sm:text-[8px] font-black italic px-1.5 py-0.2 -skew-x-6 transition-colors border ${
                        isPasswordValid
                          ? "bg-emerald-950 text-emerald-300 border-emerald-600 group-focus-within:bg-emerald-400 group-focus-within:text-[#020612] group-focus-within:border-emerald-300"
                          : "bg-slate-900 text-slate-400 border-slate-700 group-focus-within:bg-cyan-400 group-focus-within:text-[#020612] group-focus-within:border-cyan-300"
                      }`}
                    >
                      01 // ENCRYPTION KEY
                    </span>
                  </div>
                </div>

                <div className="relative z-10 flex items-center">
                  <input
                    type="password"
                    placeholder="Enter new password..."
                    maxLength={72}
                    value={newPassword}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setNewPassword(e.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    onBlur={handlePasswordBlur}
                    autoComplete="off"
                    disabled={isSubmitting || isRedirecting}
                    className={`w-full font-bold px-2 py-1 outline-none transition-all placeholder:italic -skew-x-2 text-[11px] sm:text-xs border-b-2 ${
                      isPasswordValid
                        ? "text-emerald-300 font-extrabold pr-8 bg-[#021810] border-emerald-600/90 focus:border-emerald-400 focus:bg-[#032a1b] placeholder:text-emerald-700/60"
                        : "text-white bg-[#030917] border-slate-700 placeholder:text-slate-500 focus:border-cyan-400 focus:bg-[#051126]"
                    }`}
                  />
                  {isPasswordValid && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-4 h-4 bg-emerald-400 text-[#020612] font-black text-[10px] -skew-x-12 border border-emerald-200 shadow-[1px_1px_0px_#000] pointer-events-none">
                      ✓
                    </div>
                  )}
                </div>

                {passwordError && (
                  <p className="mt-1 text-[8px] font-black text-rose-400 tracking-wider uppercase italic animate-slash-reveal">
                    {passwordError}
                  </p>
                )}
              </div>
            </div>

            {/* Input 2: CONFIRM PASSWORD */}
            <div className="relative group">
              <div
                className={`relative p-2 sm:p-2.5 -skew-x-3 border-2 transition-all duration-200 ease-out overflow-hidden ${
                  confirmError
                    ? "border-rose-500 bg-[#180509]"
                    : isConfirmValid
                    ? "border-emerald-700/80 focus-within:border-emerald-400 bg-[#021f14]/50 shadow-[0_0_12px_rgba(52,211,153,0.25)] focus-within:shadow-[0_0_16px_rgba(52,211,153,0.4)]"
                    : "border-slate-700 bg-[#081530] focus-within:border-cyan-400 focus-within:shadow-[4px_4px_0px_0px_#00f0ff] focus-within:bg-[#0a1c3f]"
                } text-slate-200 focus-within:translate-x-1 focus-within:-translate-y-0.5`}
              >
                <div className="absolute -inset-y-4 -inset-x-12 bg-linear-to-r from-transparent via-cyan-400/30 to-transparent -skew-x-12 -translate-x-full group-focus-within:translate-x-full transition-transform duration-700 ease-out pointer-events-none z-10" />

                <div className="relative z-10 flex items-center justify-between mb-1">
                  <label
                    className={`block text-[8px] sm:text-[9px] font-black italic tracking-widest uppercase transition-colors ${
                      isConfirmValid
                        ? "text-emerald-400 group-focus-within:text-emerald-300"
                        : "text-slate-400 group-focus-within:text-cyan-300"
                    }`}
                  >
                    CONFIRM PASSWORD
                  </label>
                  <div className="flex items-center gap-1.5">
                    {isConfirmValid && (
                      <span className="flex items-center gap-1 px-1.5 py-0.2 bg-emerald-500 text-[#020612] font-black italic text-[7px] sm:text-[8px] -skew-x-12 border border-emerald-300 shadow-[1.5px_1.5px_0px_#000] animate-slash-reveal">
                        <span className="text-[9px] leading-none">✓</span> OK
                      </span>
                    )}
                    <span
                      className={`text-[7px] sm:text-[8px] font-black italic px-1.5 py-0.2 -skew-x-6 transition-colors border ${
                        isConfirmValid
                          ? "bg-emerald-950 text-emerald-300 border-emerald-600 group-focus-within:bg-emerald-400 group-focus-within:text-[#020612] group-focus-within:border-emerald-300"
                          : "bg-slate-900 text-slate-400 border-slate-700 group-focus-within:bg-cyan-400 group-focus-within:text-[#020612] group-focus-within:border-cyan-300"
                      }`}
                    >
                      02 // VERIFY KEY
                    </span>
                  </div>
                </div>

                <div className="relative z-10 flex items-center">
                  <input
                    type="password"
                    placeholder="Confirm new password..."
                    maxLength={72}
                    value={confirmPassword}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setConfirmPassword(e.target.value);
                      if (confirmError) setConfirmError(null);
                    }}
                    onBlur={handleConfirmBlur}
                    autoComplete="off"
                    disabled={isSubmitting || isRedirecting}
                    className={`w-full font-bold px-2 py-1 outline-none transition-all placeholder:italic -skew-x-2 text-[11px] sm:text-xs border-b-2 ${
                      isConfirmValid
                        ? "text-emerald-300 font-extrabold pr-8 bg-[#021810] border-emerald-600/90 focus:border-emerald-400 focus:bg-[#032a1b] placeholder:text-emerald-700/60"
                        : "text-white bg-[#030917] border-slate-700 placeholder:text-slate-500 focus:border-cyan-400 focus:bg-[#051126]"
                    }`}
                  />
                  {isConfirmValid && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-4 h-4 bg-emerald-400 text-[#020612] font-black text-[10px] -skew-x-12 border border-emerald-200 shadow-[1px_1px_0px_#000] pointer-events-none">
                      ✓
                    </div>
                  )}
                </div>

                {confirmError && (
                  <p className="mt-1 text-[8px] font-black text-rose-400 tracking-wider uppercase italic animate-slash-reveal">
                    {confirmError}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="relative group my-3.5 sm:my-4 md:my-5 transition-all duration-300">
            <button
              type="submit"
              disabled={isSubmitting || isRedirecting}
              className="relative w-full p-2.5 sm:p-3 -skew-x-3 border-2 border-cyan-400/80 bg-linear-to-r from-blue-700 via-blue-600 to-cyan-600 text-white shadow-[4px_4px_0px_0px_#001a66] sm:shadow-[5px_5px_0px_0px_#001a66] transition-all duration-300 ease-out overflow-hidden cursor-pointer outline-none hover:translate-x-1 hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-[4px_4px_0px_0px_#00f0ff] focus-visible:translate-x-1 focus-visible:-translate-y-0.5 focus-visible:border-cyan-300 focus-visible:shadow-[4px_4px_0px_0px_#00f0ff] active:scale-95 active:translate-x-0 active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute -inset-y-4 -inset-x-12 bg-linear-to-r from-transparent via-cyan-300/40 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full group-focus-within:translate-x-full transition-transform duration-700 ease-out pointer-events-none z-10" />

              <div className="relative z-10 flex items-center justify-center gap-2">
                <span className="font-black italic text-sm sm:text-base tracking-wider text-white group-hover:text-cyan-100 group-focus-visible:text-cyan-100 transition-colors">
                  {isSubmitting || isRedirecting ? "UPDATING..." : "RESET PASSWORD"}
                </span>
              </div>
            </button>
          </div>

          {/* Back to Login Action Link */}
          <div className="text-center pt-3 border-t-2 border-cyan-900/60 flex justify-center">
            <Link
              to="/login"
              className="group relative inline-flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 -skew-x-12 border-2 border-cyan-400/70 hover:border-white focus-visible:border-white bg-[#081530] hover:bg-white focus-visible:bg-white text-cyan-300 hover:text-[#020612] focus-visible:text-[#020612] outline-none transition-all duration-200 hover:-translate-y-0.5 focus-visible:-translate-y-0.5 active:scale-95 active:translate-y-0 hover:shadow-[0px_3px_0px_0px_#00f0ff]"
            >
              <div className="absolute -top-2.5 left-2.5 sm:-top-3 sm:left-3 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-8 border-b-cyan-400 group-hover:border-b-white group-focus-visible:border-b-white transition-colors duration-200" />

              <span className="font-black italic text-[10px] sm:text-xs tracking-wider uppercase transition-colors duration-200 text-center">
                BACK TO <span className="text-white underline underline-offset-2 group-hover:text-[#020612] group-focus-visible:text-[#020612]">LOGIN</span>
              </span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
