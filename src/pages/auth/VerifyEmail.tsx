import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../../lib/api";

const parseApiError = (err: any): string => {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (typeof detail === "object" && detail?.message) return detail.message;
  return err?.response?.data?.message || "VERIFICATION FAILED";
};

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Guard against React StrictMode double-mounting in development
  const hasExecuted = useRef<boolean>(false);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setIsSuccess(false);
      setStatusMessage("NO VERIFICATION TOKEN PROVIDED.");
      return;
    }

    // Stop execution if the API call was already initiated
    if (hasExecuted.current) return;
    hasExecuted.current = true;

    const verifyToken = async () => {
      try {
        const response = await api.get("/api/v1/auth/verify-email", {
          params: { token },
        });
        setIsSuccess(true);
        setStatusMessage(response.data.message || "ACCOUNT VERIFIED SUCCESSFULLY!");
      } catch (err: any) {
        setIsSuccess(false);
        setStatusMessage(parseApiError(err));
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen select-none p-2 bg-transparent">
      <div className="text-p3-surface h-auto relative flex flex-col max-w-lg p-8 items-center justify-center m-2 w-full sm:w-96">
        <div className="absolute bg-p3-highlight -skew-x-3 h-80 w-full -z-1"></div>
        <div className="absolute bg-p3-primary skew-x-10 h-85 w-full -z-2"></div>
        <div className="absolute bg-p3-accent -skew-x-12 h-95 w-84 -z-3"></div>

        <h1 className="font-extrabold italic text-4xl p-1 -skew-x-8 text-p3-primary font-kanit text-center">
          VERIFICATION
        </h1>

        <div className="mt-4 mb-6 text-center w-full">
          {isLoading ? (
            <p className="font-rajdhani font-bold italic text-lg text-p3-muted animate-pulse">
              VERIFYING ACCOUNT...
            </p>
          ) : isSuccess ? (
            <div className="font-jakarta font-extrabold -skew-x-8 text-emerald-700 bg-emerald-100/90 px-3 py-2 rounded text-sm tracking-wider">
              {statusMessage?.toUpperCase()}
            </div>
          ) : (
            <div className="font-jakarta font-extrabold -skew-x-8 text-red-600 bg-red-100/90 px-3 py-2 rounded text-sm tracking-wider">
              {statusMessage?.toUpperCase()}
            </div>
          )}
        </div>

        {!isLoading && (
          <Link
            to={isSuccess ? "/login" : "/resend-verification"}
            className="font-jakarta p-2 pr-6 pl-6 bg-p3-primary text-p3-highlight text-lg font-bold skew-x-12 hover:bg-p3-muted active:bg-p3-muted transition-all duration-200 ease-out italic cursor-pointer inline-block"
          >
            {isSuccess ? "PROCEED TO LOGIN" : "REQUEST NEW LINK"}
          </Link>
        )}
      </div>
    </div>
  );
}
