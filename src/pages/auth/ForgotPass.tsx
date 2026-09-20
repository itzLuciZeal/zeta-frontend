import { useState, useEffect, type ChangeEvent, type SubmitEvent } from "react";
import { Link } from "react-router-dom";
import { forgotPassApi } from "../../services/auth.service";

interface ApiErrorShape {
  response?: {
    status?: number;
    data?: {
      detail?: string | { message?: string; remaining?: number };
      message?: string;
    };
  };
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const parseApiError = (
  err: unknown
): { message: string; remaining?: number } => {
  const error = err as ApiErrorShape;
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string") {
    const match = detail.match(/\b(\d+)\s+seconds?/i);
    const extractedRemaining = match?.[1] ? parseInt(match[1], 10) : undefined;
    return { message: detail, remaining: extractedRemaining };
  }

  if (typeof detail === "object" && detail !== null) {
    return {
      message: detail.message || "FAILED TO SEND RESET LINK",
      remaining: detail.remaining,
    };
  }

  const fallbackMsg =
    error?.response?.data?.message || "FAILED TO SEND RESET LINK";
  const fallbackMatch = fallbackMsg.match(/\b(\d+)\s+seconds?/i);
  const extractedRemaining = fallbackMatch?.[1]
    ? parseInt(fallbackMatch[1], 10)
    : undefined;

  return {
    message: fallbackMsg,
    remaining: extractedRemaining,
  };
};

export default function ForgotPassPage() {
  const [email, setEmail] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<number>(0);

  const isEmailTouched = email.trim().length > 0;
  const isEmailValid = isEmailTouched && EMAIL_REGEX.test(email.trim());
  const isEmailInvalid = isEmailTouched && !EMAIL_REGEX.test(email.trim());

  // Replaces both [REMAINING] templates and explicit numbers preceding "SECONDS" with live cooldown
  const dynamicErrorMessage = errorMessage
    ? errorMessage
        .replace(/\[REMAINING\]/gi, `${cooldown}`)
        .replace(/\b\d+(\s+SECONDS?)/gi, `${cooldown}$1`)
    : null;

  useEffect(() => {
    if (cooldown <= 0) {
      if (errorMessage && /cooldown|wait/i.test(errorMessage)) {
        setErrorMessage(null);
      }
      return;
    }

    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown, errorMessage]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage("PLEASE ENTER YOUR EMAIL");
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setErrorMessage("INVALID EMAIL FORMAT");
      return;
    }

    if (cooldown > 0) {
      setErrorMessage(
        `A COOLDOWN IS ACTIVE. PLEASE WAIT ${cooldown} SECONDS BEFORE REQUESTING A NEW RESET LINK.`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await forgotPassApi({ email: email.trim() });
      const displayTitle = "SUCCESS";
      const displayMsg = (
        res?.message || "RESET LINK SENT SUCCESSFULLY"
      ).toUpperCase();

      setSuccessMessage(`${displayTitle}: ${displayMsg}`);
      setCooldown(300);
      setEmail("");
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      setErrorMessage(parsed.message.toUpperCase());

      if (parsed.remaining && parsed.remaining > 0) {
        setCooldown(parsed.remaining);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-start sm:justify-center min-h-dvh w-full select-none px-6 sm:px-8 py-8 sm:py-12 overflow-x-hidden overflow-y-auto">
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

      {/* Main Container Layer with Safe Horizontal Margins */}
      <div className="relative w-full max-w-70 xs:max-w-[300px] sm:max-w-sm my-auto z-10 transition-all duration-300 mx-auto">
        {/* Layer 1: Sharp Outer Slanted Frame */}
        <div className="absolute -inset-x-1.5 -inset-y-1.5 sm:-inset-x-2 sm:-inset-y-2 bg-linear-to-r from-blue-600 via-cyan-400 to-blue-800 -skew-x-6 opacity-30 border border-cyan-400/40 shadow-[0_0_20px_rgba(0,240,255,0.15)] pointer-events-none" />

        {/* Layer 2: Cobalt Blue Secondary Slanted Ribbon */}
        <div className="absolute -inset-x-1 -inset-y-1 sm:-inset-x-1.5 sm:-inset-y-1.5 bg-[#001340] skew-x-3 border-2 border-cyan-400/50 shadow-[4px_4px_0px_0px_#000c29] sm:shadow-[6px_6px_0px_0px_#000c29] pointer-events-none" />

        {/* Layer 3: Main Persona Card */}
        <form
          className="relative bg-p3-surface text-white p-3.5 sm:p-5 md:p-6 -skew-x-2 border-2 border-cyan-400 shadow-[6px_6px_0px_0px_#002288] sm:shadow-[10px_10px_0px_#002288] transition-all duration-300 overflow-hidden"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Header Banner Section */}
          <div className="flex flex-col items-center text-center mb-3 sm:mb-4 md:mb-5">
            <div className="inline-block bg-[#00f0ff] text-[#020612] px-3 py-0.5 sm:px-3.5 sm:py-0.5 -skew-x-12 mb-1.5 sm:mb-2 border-r-4 border-blue-800 shadow-[2px_2px_0px_0px_#001a66]">
              <span className="font-black italic text-[9px] sm:text-[10px] tracking-widest uppercase">
                SECURITY PROTOCOL
              </span>
            </div>
            <h1 className="font-black italic text-2xl sm:text-3xl md:text-4xl tracking-wider text-white -skew-x-6 drop-shadow-[2px_2px_0px_#00f0ff]">
              RECOVER PASS
            </h1>
            <p className="font-black italic text-[10px] sm:text-xs text-cyan-300 tracking-wider mt-2 sm:mt-3 drop-shadow-[1px_1px_0px_#002288]">
              ENTER EMAIL FOR RESET LINK
            </p>
          </div>

          {/* Smooth-Expanding Anti-Jank Error Alert Container */}
          <div
            className={`grid transition-all duration-300 ease-out ${
              dynamicErrorMessage
                ? "grid-rows-[1fr] opacity-100 my-2.5 sm:my-3"
                : "grid-rows-[0fr] opacity-0 my-0"
            }`}
          >
            <div className="overflow-hidden">
              {dynamicErrorMessage && (
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
                      {dynamicErrorMessage}
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

          {/* Form Input Section */}
          <div className="space-y-3 sm:space-y-3.5 md:space-y-4 my-3 sm:my-4 md:my-5">
            <div className="relative group">
              <div
                className={`relative p-2 sm:p-2.5 -skew-x-3 border-2 transition-all duration-200 ease-out overflow-hidden ${
                  isEmailInvalid
                    ? "bg-[#1f0208] border-rose-500 text-rose-100 shadow-[4px_4px_0px_0px_#f43f5e]"
                    : isEmailValid
                    ? "bg-[#021a10] border-emerald-500 text-emerald-100 focus-within:shadow-[4px_4px_0px_0px_#10b981]"
                    : "bg-[#081530] border-slate-700 text-slate-200 focus-within:translate-x-1 focus-within:-translate-y-0.5 focus-within:border-cyan-400 focus-within:shadow-[4px_4px_0px_0px_#00f0ff] focus-within:bg-[#0a1c3f]"
                }`}
              >
                <div className="absolute -inset-y-4 -inset-x-12 bg-linear-to-r from-transparent via-cyan-400/30 to-transparent -skew-x-12 -translate-x-full group-focus-within:translate-x-full transition-transform duration-700 ease-out pointer-events-none z-10" />

                <div className="relative z-10 flex items-center justify-between mb-1">
                  <label
                    className={`block text-[8px] sm:text-[9px] font-black italic tracking-widest uppercase transition-colors ${
                      isEmailInvalid
                        ? "text-rose-400"
                        : isEmailValid
                        ? "text-emerald-400"
                        : "text-slate-400 group-focus-within:text-cyan-300"
                    }`}
                  >
                    EMAIL ADDRESS
                  </label>

                  {/* Inline Email Status Badge */}
                  {isEmailInvalid ? (
                    <span className="text-[7px] sm:text-[8px] font-black italic px-1.5 py-0.5 -skew-x-6 bg-rose-600 text-white border border-rose-300 shadow-[1px_1px_0px_#000] animate-pulse">
                      INVALID EMAIL FORMAT
                    </span>
                  ) : isEmailValid ? (
                    <span className="text-[7px] sm:text-[8px] font-black italic px-1.5 py-0.5 -skew-x-6 bg-emerald-500 text-[#020612] border border-emerald-300 shadow-[1px_1px_0px_#000]">
                      ✓ OKAY
                    </span>
                  ) : (
                    <span className="text-[7px] sm:text-[8px] font-black italic px-1.5 py-0.5 -skew-x-6 transition-colors bg-slate-900 text-slate-400 border border-slate-700 group-focus-within:bg-cyan-400 group-focus-within:text-[#020612] group-focus-within:border-cyan-300">
                      01 // TARGET
                    </span>
                  )}
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
                  disabled={isSubmitting || cooldown > 0}
                  className={`relative z-10 w-full font-bold px-2 py-1 outline-none transition-all placeholder:italic -skew-x-2 text-[11px] sm:text-xs border-b-2 placeholder:text-slate-500 ${
                    isEmailInvalid
                      ? "bg-[#140105] border-rose-500 text-rose-200 focus:border-rose-400"
                      : isEmailValid
                      ? "bg-[#01120b] border-emerald-500 text-emerald-200 focus:border-emerald-400"
                      : "bg-[#030917] border-slate-700 text-white focus:border-cyan-400 focus:bg-[#051126]"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="relative group my-3.5 sm:my-4 md:my-5 transition-all duration-300">
            <button
              type="submit"
              disabled={isSubmitting || cooldown > 0 || isEmailInvalid}
              className="relative w-full p-2.5 sm:p-3 -skew-x-3 border-2 border-cyan-400/80 bg-linear-to-r from-blue-700 via-blue-600 to-cyan-600 text-white shadow-[4px_4px_0px_0px_#001a66] sm:shadow-[5px_5px_0px_0px_#001a66] transition-all duration-300 ease-out overflow-hidden cursor-pointer outline-none hover:translate-x-1 hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-[4px_4px_0px_0px_#00f0ff] focus-visible:translate-x-1 focus-visible:-translate-y-0.5 focus-visible:border-cyan-300 focus-visible:shadow-[4px_4px_0px_0px_#00f0ff] active:scale-95 active:translate-x-0 active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute -inset-y-4 -inset-x-12 bg-linear-to-r from-transparent via-cyan-300/40 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full group-focus-within:translate-x-full transition-transform duration-700 ease-out pointer-events-none z-10" />

              <div className="relative z-10 flex items-center justify-center gap-2">
                <span className="font-black italic text-sm sm:text-base tracking-wider text-white group-hover:text-cyan-100 group-focus-visible:text-cyan-100 transition-colors">
                  {isSubmitting
                    ? "SENDING..."
                    : cooldown > 0
                    ? `RETRY IN ${formatTime(cooldown)}`
                    : "SEND LINK"}
                </span>
              </div>
            </button>
          </div>

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
        </form>
      </div>
    </div>
  );
}
