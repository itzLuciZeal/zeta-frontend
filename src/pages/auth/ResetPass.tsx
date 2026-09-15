import { useState, type ChangeEvent } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { resetPassApi } from "../../services/auth.service";

const parseApiError = (err: any): string => {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (typeof detail === "object" && detail?.message) return detail.message;
  return err?.response?.data?.message || "RESET FAILED";
};

export default function ResetPassPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.SubmitEvent) => {
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

      setSuccessMessage(res.message.toUpperCase());
      setTimeout(() => navigate("/login"), 3000);
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

        <h1 className="font-extrabold italic text-4xl p-1 -skew-x-8 text-p3-primary font-kanit text-center">
          NEW PASSWORD
        </h1>
        <p className="font-rajdhani font-bold italic text-xs mb-3 p-1 text-p3-muted text-center">
          CREATE A NEW PASSWORD FOR YOUR ACCOUNT
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
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
          autoComplete="off"
          disabled={isSubmitting}
          className="border-b-2 border-b-p3-muted text-p3-muted focus:outline-none p-1 m-2 -skew-x-8 font-semibold font-jakarta w-full disabled:opacity-50"
        />

        <input
          type="password"
          placeholder="Confirm New Password"
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
          {isSubmitting ? "UPDATING..." : "RESET PASSWORD"}
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
