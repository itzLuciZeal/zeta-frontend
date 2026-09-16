import { useState, useMemo, type SubmitEvent } from "react";
import { grantQuizAccessApi } from "../../services/quiz.service";
import type { QuizAccessGrantResponse } from "../../types/quiz.types";

interface GrantQuizAccessSectionProps {
  quizId: string;
}

export default function GrantQuizAccessSection({ quizId }: GrantQuizAccessSectionProps) {
  const [rawInput, setRawInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [grantError, setGrantError] = useState<string | null>(null);
  const [grantResult, setGrantResult] = useState<QuizAccessGrantResponse | null>(null);

  const btnBase =
    "px-3 sm:px-4 py-2 font-jakarta font-extrabold text-xs -skew-x-8 italic tracking-wider uppercase transition-colors cursor-pointer shadow-md inline-flex items-center justify-center whitespace-nowrap";

  // Parse raw text into clean array of identifiers (usernames or emails)
  const parsedIdentifiers = useMemo(() => {
    if (!rawInput.trim()) return [];
    return Array.from(
      new Set(
        rawInput
          .split(/[\n,;\s]+/)
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
      )
    );
  }, [rawInput]);

  const handleRemoveChip = (identifier: string) => {
    const newIdentifiers = parsedIdentifiers.filter((id) => id !== identifier);
    setRawInput(newIdentifiers.join(", "));
  };

  const handleSubmitAccess = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (parsedIdentifiers.length === 0) return;

    try {
      setIsSubmitting(true);
      setGrantError(null);
      setGrantResult(null);

      const res = await grantQuizAccessApi(quizId, {
        user_ids: parsedIdentifiers,
      });

      setGrantResult(res);
      setRawInput(""); // Clear input on successful execution
    } catch (err: any) {
      setGrantError(
        err?.response?.data?.detail || "FAILED TO GRANT ACCESS TO IDENTIFIERS"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t-2 border-dashed border-p3-primary/20 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-kanit font-extrabold italic text-lg text-p3-primary uppercase tracking-wide">
          [ GRANT USER ACCESS ]
        </h4>
        <span className="text-[10px] font-rajdhani font-bold text-p3-muted uppercase">
          BY USERNAME OR EMAIL
        </span>
      </div>

      {/* Response Banners */}
      {grantError && (
        <div className="p-3 bg-red-600/20 border border-red-500 text-red-400 font-jakarta text-xs italic font-bold">
          {grantError}
        </div>
      )}

      {grantResult && (
        <div className="p-3 bg-emerald-950/30 border border-emerald-400/50 space-y-1 text-xs font-jakarta">
          <div className="text-emerald-400 font-bold font-kanit italic uppercase tracking-wider">
            ✓ {grantResult.message}
          </div>
          <div className="flex items-center gap-3 text-p3-muted font-rajdhani text-[11px] uppercase">
            <span>ADDED: <strong className="text-emerald-400">{grantResult.total_added}</strong></span>
            <span>UNMATCHED: <strong className="text-amber-400">{grantResult.unmatched_identifiers_count}</strong></span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmitAccess} className="space-y-3">
        <div>
          <label className="block font-rajdhani font-bold italic text-xs text-p3-muted uppercase tracking-wider mb-1.5">
            ENTER USERNAMES / EMAILS (SEPARATE BY COMMA OR NEWLINE)
          </label>
          <textarea
            rows={3}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder="e.g. user@example.com, john_doe, admin_test"
            className="w-full bg-p3-background border border-p3-primary/40 p-2.5 font-jakarta text-xs text-p3-primary placeholder:text-p3-muted/50 focus:outline-none focus:border-p3-primary resize-none"
          />
        </div>

        {/* Parsed Chips Preview */}
        {parsedIdentifiers.length > 0 && (
          <div className="space-y-1">
            <span className="text-[10px] font-rajdhani font-bold text-p3-muted uppercase">
              TARGET IDENTIFIERS ({parsedIdentifiers.length}):
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-p3-background/40 border border-p3-primary/10">
              {parsedIdentifiers.map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-p3-primary/10 border border-p3-primary/30 text-p3-primary font-jakarta text-[11px] font-bold"
                >
                  {id}
                  <button
                    type="button"
                    onClick={() => handleRemoveChip(id)}
                    className="text-p3-muted hover:text-red-400 font-black text-[10px]"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || parsedIdentifiers.length === 0}
            className={`${btnBase} bg-cyan-400 text-slate-950 hover:bg-cyan-300 border border-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.4)] ${
              isSubmitting || parsedIdentifiers.length === 0
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isSubmitting ? "GRANTING ACCESS..." : "GRANT ACCESS NOW"}
          </button>
        </div>
      </form>
    </div>
  );
}
