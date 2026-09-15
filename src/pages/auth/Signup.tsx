import { useState, useEffect, type ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { signupApi } from "../../services/auth.service";

const parseApiError = (err: any): string => {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (typeof detail === "object" && detail?.message) return detail.message;
  return err?.response?.data?.message || "REGISTRATION FAILED";
};

export default function SignupPage() {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = user.role === "admin" ? "/admin/dashboard" : "/user/dashboard";
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!username || !email || !password || !confirmPassword) {
      setErrorMessage("PLEASE FILL IN ALL FIELDS");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("PASSWORDS DO NOT MATCH");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await signupApi({ username, email, password });
      
      const successText = response?.message || "ACCOUNT CREATED SUCCESSFULLY";
      setSuccessMessage(`${successText.toUpperCase()}. PLEASE CHECK YOUR EMAIL TO VERIFY.`);
      
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setErrorMessage(parseApiError(err).toUpperCase());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen select-none p-2 bg-transparent">
      <form
        className="text-p3-surface h-auto relative flex flex-col max-w-lg p-8 items-center justify-center m-2 w-full sm:w-96"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="absolute bg-p3-highlight -skew-x-3 h-120 w-full -z-1"></div>
        <div className="absolute bg-p3-primary skew-x-10 h-130 w-full -z-2"></div>
        <div className="absolute bg-p3-accent -skew-x-12 h-125 w-84 -z-3"></div>

        <h1 className="font-extrabold italic text-5xl p-1 -skew-x-8 text-p3-primary font-kanit">
          SIGN UP
        </h1>
        <p className="font-rajdhani font-bold italic text-base mb-3 p-1 text-p3-muted">
          JOIN ZETA QUIZ NETWORK
        </p>

        {errorMessage && (
          <div className="font-jakarta font-extrabold -skew-x-8 text-red-600 bg-red-100/90 px-3 py-1.5 rounded text-xs mb-2 tracking-wider text-center w-full">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="font-jakarta font-extrabold -skew-x-8 text-emerald-700 bg-emerald-100/90 px-3 py-1.5 rounded text-xs mb-2 tracking-wider text-center w-full">
            {successMessage}
          </div>
        )}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
          autoComplete="off"
          spellCheck="false"
          disabled={isSubmitting}
          className="border-b-2 border-b-p3-muted text-p3-muted focus:outline-none p-1 m-2 -skew-x-8 font-semibold font-jakarta w-full disabled:opacity-50"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          autoComplete="off"
          spellCheck="false"
          disabled={isSubmitting}
          className="border-b-2 border-b-p3-muted text-p3-muted focus:outline-none p-1 m-2 -skew-x-8 font-semibold font-jakarta w-full disabled:opacity-50"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          autoComplete="off"
          disabled={isSubmitting}
          className="border-b-2 border-b-p3-muted text-p3-muted focus:outline-none p-1 m-2 -skew-x-8 font-semibold font-jakarta w-full disabled:opacity-50"
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
          autoComplete="off"
          disabled={isSubmitting}
          className="border-b-2 border-b-p3-muted text-p3-muted focus:outline-none p-1 m-2 -skew-x-8 font-semibold font-jakarta w-full disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="font-jakarta p-2 pr-6 pl-6 mt-4 mb-2 bg-p3-primary text-p3-highlight text-lg font-bold skew-x-12 hover:bg-p3-muted active:bg-p3-muted transition-all duration-200 ease-out italic disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? "REGISTERING..." : "REGISTER"}
        </button>

        <Link
          to="/login"
          className="font-rajdhani font-bold italic text-sm text-p3-primary hover:underline mt-2 -skew-x-6"
        >
          ALREADY HAVE AN ACCOUNT? LOGIN
        </Link>
      </form>
    </div>
  );
}
