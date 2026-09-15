import { useState, useEffect, type ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const parseApiError = (err: any): string => {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (typeof detail === "object" && detail?.message) return detail.message;
  return err?.response?.data?.message || "AN UNEXPECTED ERROR OCCURRED";
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
      const redirectPath = user.role === "admin" ? "/admin/dashboard" : "/user/dashboard";
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsUnverified(false);

    if (!email || !password) {
      setErrorMessage("PLEASE FILL IN ALL FIELDS");
      return;
    }

    try {
      await login({ email, password });
    } catch (err: any) {
      const status = err?.response?.status;
      const parsedError = parseApiError(err);

      if (status === 403) {
        setIsUnverified(true);
      }

      setErrorMessage(parsedError.toUpperCase());
    }
  };

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

        <h1 className="font-extrabold italic text-6xl p-1 -skew-x-8 text-p3-primary font-kanit">
          LOGIN
        </h1>
        <p className="font-rajdhani font-bold italic text-base mb-2 p-1 text-p3-muted">
          WELCOME BACK TO ZETA
        </p>

        {errorMessage && (
          <div className="font-jakarta font-extrabold -skew-x-8 text-red-600 bg-red-100/90 px-3 py-1.5 rounded text-xs mb-2 tracking-wider text-center w-full">
            {errorMessage}
            {isUnverified && (
              <div className="mt-1">
                <Link
                  to="/resend-verification"
                  className="underline text-blue-700 hover:text-blue-900"
                >
                  RESEND VERIFICATION LINK
                </Link>
              </div>
            )}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          autoComplete="off"
          spellCheck="false"
          disabled={isLoading}
          className="border-b-2 border-b-p3-muted text-p3-muted focus:outline-none p-1 m-2 -skew-x-8 font-semibold font-jakarta w-full disabled:opacity-50"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          autoComplete="off"
          disabled={isLoading}
          className="border-b-2 border-b-p3-muted text-p3-muted focus:outline-none p-1 m-2 -skew-x-8 font-semibold font-jakarta w-full disabled:opacity-50"
        />

        <div className="w-full flex justify-end px-2 mb-2">
          <Link
            to="/forgot-password"
            className="font-rajdhani text-xs font-bold italic text-p3-muted hover:text-p3-primary -skew-x-6"
          >
            FORGOT PASSWORD?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="font-jakarta p-2 pr-6 pl-6 mt-2 mb-3 bg-p3-primary text-p3-highlight text-lg font-bold skew-x-12 hover:bg-p3-muted active:bg-p3-muted transition-all duration-200 ease-out italic disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? "AUTHENTICATING..." : "SUBMIT"}
        </button>

        <Link
          to="/signup"
          className="font-rajdhani font-bold italic text-sm text-p3-primary hover:underline mt-1 mb-1 -skew-x-6"
        >
          NEED AN ACCOUNT? SIGN UP
        </Link>
      </form>
    </div>
  );
}

