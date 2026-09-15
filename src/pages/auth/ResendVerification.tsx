import { useState, useEffect, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { resendVerifyApi } from "../../services/auth.service";

const parseApiError = (err: any): { message: string; remaining?: number } => {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return { message: detail };
  if (typeof detail === "object" && detail?.message) {
    return { message: detail.message, remaining: detail.remaining };
  }
  return { message: err?.response?.data?.message || "REQUEST FAILED" };
};

export default function ResendVerificationPage() {
  const [email, setEmail] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Real-time countdown timer
  useEffect(() => {
    if (cooldownSeconds === null || cooldownSeconds <= 0) return;

    const timer = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email) {
      setErrorMessage("PLEASE ENTER YOUR EMAIL ADDRESS");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await resendVerifyApi({ email });
      setSuccessMessage(`${res.title?.toUpperCase() || "SUCCESS"}: ${res.message.toUpperCase()}`);
      setEmail("");
    } catch (err: any) {
      const parsed = parseApiError(err);
      if (parsed.remaining) {
        setCooldownSeconds(parsed.remaining);
      } else {
        setErrorMessage(parsed.message.toUpperCase());
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCoolingDown = cooldownSeconds !== null && cooldownSeconds > 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen select-none p-2 bg-transparent">
      <form
        className="text-p3-surface h-auto relative flex flex-col max-w-lg p-8 items-center justify-center m-2 w-full sm:w-96"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="absolute bg-p3-highlight -skew-x-3 h-112 w-full -z-1"></div>
        <div className="absolute bg-p3-primary skew-x-10 h-120 w-full -z-2"></div>
        <div className="absolute bg-p3-accent -skew-x-12 h-116 w-84 -z-3"></div>

        <h1 className="font-extrabold italic text-4xl p-1 -skew-x-8 text-p3-primary font-kanit text-center">
          RESEND LINK
        </h1>
        <p className="font-rajdhani font-bold italic text-xs mb-3 p-1 text-p3-muted text-center">
          RECEIVE A NEW VERIFICATION LINK FOR YOUR ACCOUNT
        </p>

        {isCoolingDown ? (
          <div className="font-jakarta font-extrabold -skew-x-8 text-red-600 bg-red-100/90 px-3 py-1.5 rounded text-xs mb-2 tracking-wider text-center w-full">
            COOLDOWN ACTIVE. PLEASE WAIT {cooldownSeconds} SECONDS BEFORE RETRYING.
          </div>
        ) : (
          errorMessage && (
            <div className="font-jakarta font-extrabold -skew-x-8 text-red-600 bg-red-100/90 px-3 py-1.5 rounded text-xs mb-2 tracking-wider text-center w-full">
              {errorMessage}
            </div>
          )
        )}

        {successMessage && (
          <div className="font-jakarta font-extrabold -skew-x-8 text-emerald-700 bg-emerald-100/90 px-3 py-1.5 rounded text-xs mb-2 tracking-wider text-center w-full">
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
          disabled={isSubmitting || isCoolingDown}
          className="border-b-2 border-b-p3-muted text-p3-muted focus:outline-none p-1 m-2 -skew-x-8 font-semibold font-jakarta w-full disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={isSubmitting || isCoolingDown}
          className="font-jakarta p-2 pr-6 pl-6 mt-4 mb-2 bg-p3-primary text-p3-highlight text-lg font-bold skew-x-12 hover:bg-p3-muted active:bg-p3-muted transition-all duration-200 ease-out italic disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting
            ? "SENDING..."
            : isCoolingDown
            ? `WAIT ${cooldownSeconds}S`
            : "RESEND EMAIL"}
        </button>

        <Link
          to="/login"
          className="font-rajdhani font-bold italic text-sm text-p3-primary hover:underline mt-2 -skew-x-6"
        >
          BACK TO LOGIN
        </Link>
      </form>
    </div>
  );
}
