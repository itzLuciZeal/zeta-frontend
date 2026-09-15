import { useState, useEffect, type ChangeEvent, type SubmitEvent } from "react";
import { Link } from "react-router-dom";
import { forgotPassApi } from "../../services/auth.service";

const parseApiError = (err: any): { message: string; remaining?: number } => {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return { message: detail };
  if (typeof detail === "object" && detail?.message) {
    return { message: detail.message, remaining: detail.remaining };
  }
  return { message: err?.response?.data?.message || "FAILED TO SEND RESET LINK" };
};

export default function ForgotPassPage() {
  const [email, setEmail] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<number>(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email) {
      setErrorMessage("PLEASE ENTER YOUR EMAIL");
      return;
    }

    if (cooldown > 0) {
      setErrorMessage(`COOLDOWN ACTIVE. WAIT ${formatTime(cooldown)}`);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await forgotPassApi({ email });
      setSuccessMessage(res.message.toUpperCase());
      setCooldown(300);
      setEmail("");
    } catch (err: any) {
      const parsed = parseApiError(err);
      setErrorMessage(parsed.message.toUpperCase());
      if (parsed.remaining) setCooldown(parsed.remaining);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-transparent select-none overflow-x-hidden">
      <form
        className="text-p3-surface h-auto relative flex flex-col p-6 sm:p-8 items-center justify-center my-auto w-full max-w-[85vw] sm:w-96"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="absolute bg-p3-highlight -skew-x-3 h-112 w-full -z-1"></div>
        <div className="absolute bg-p3-primary skew-x-10 h-120 w-full -z-2"></div>
        <div className="absolute bg-p3-accent -skew-x-12 h-116 w-84 -z-3"></div>

        <h1 className="font-extrabold italic text-3xl sm:text-4xl p-1 -skew-x-8 text-p3-primary font-kanit text-center tracking-wide">
          RECOVER PASS
        </h1>
        <p className="font-rajdhani font-bold italic text-xs sm:text-sm mb-4 p-1 text-p3-muted text-center">
          ENTER YOUR EMAIL TO RECEIVE A RESET LINK
        </p>

        {errorMessage && (
          <div className="font-jakarta font-extrabold -skew-x-8 text-red-600 bg-red-100 px-3 py-1.5 rounded text-xs mb-3 tracking-wider text-center w-full wrap-break-word">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="font-jakarta font-extrabold -skew-x-8 text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded text-xs mb-3 tracking-wider text-center w-full wrap-break-word">
            {successMessage}
          </div>
        )}

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          autoComplete="off"
          spellCheck="false"
          disabled={isSubmitting || cooldown > 0}
          className="border-b-2 border-b-p3-muted text-p3-muted focus:border-b-p3-primary focus:outline-none p-1 my-2 -skew-x-8 font-semibold font-jakarta w-full text-sm sm:text-base disabled:opacity-50 transition-colors"
        />

        <button
          type="submit"
          disabled={isSubmitting || cooldown > 0}
          className="font-jakarta px-6 py-2.5 mt-5 mb-3 bg-p3-primary text-p3-highlight text-base sm:text-lg font-bold skew-x-12 hover:bg-p3-muted active:scale-95 transition-all duration-200 ease-out italic disabled:opacity-50 cursor-pointer text-center"
        >
          {isSubmitting
            ? "SENDING..."
            : cooldown > 0
            ? `RETRY IN ${formatTime(cooldown)}`
            : "SEND LINK"}
        </button>

        <Link
          to="/login"
          className="font-rajdhani font-bold italic text-xs sm:text-sm text-p3-primary hover:underline mt-2 -skew-x-6"
        >
          BACK TO LOGIN
        </Link>
      </form>
    </div>
  );
}
