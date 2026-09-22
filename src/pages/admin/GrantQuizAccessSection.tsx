import { useState, useMemo, type SubmitEvent } from "react";
import { grantQuizAccessApi } from "../../services/quiz.service";
import type { QuizAccessGrantResponse } from "../../types/quiz.types";
import {
  UserPlus,
  ShieldAlert,
  CheckCircle2,
  X,
  Sparkles,
  Send,
  Activity,
  Users
} from "lucide-react";

interface GrantQuizAccessSectionProps {
  quizId: string;
}

export default function GrantQuizAccessSection({ quizId }: GrantQuizAccessSectionProps) {
  const [rawInput, setRawInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [grantError, setGrantError] = useState<string | null>(null);
  const [grantResult, setGrantResult] = useState<QuizAccessGrantResponse | null>(null);

  const btnBase =
    "px-3.5 sm:px-4 py-2 font-jakarta font-extrabold text-xs -skew-x-8 italic tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-md inline-flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95";

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
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setGrantError(
        errorMsg || "FAILED TO GRANT ACCESS TO IDENTIFIERS"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="group relative isolate mt-8 pt-6 border-t-2 border-p3-primary/30 space-y-5 transition-all duration-300">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-p3-primary/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-p3-background border border-p3-primary/40 -skew-x-6">
            <UserPlus className="w-4 h-4 text-p3-accent" />
          </div>
          <h4 className="font-kanit font-extrabold italic text-lg text-p3-primary uppercase tracking-wide -skew-x-6">
            GRANT USER ACCESS
          </h4>
        </div>
        <span className="text-[10px] font-rajdhani font-bold text-p3-muted uppercase tracking-widest flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-p3-accent" /> AUTHENTICATION ROUTING
        </span>
      </div>

      {/* Response Banners */}
      {grantError && (
        <div className="p-3.5 bg-red-950/40 border border-red-500 text-red-300 font-jakarta text-xs italic font-bold flex items-center gap-2.5 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
          <span>{grantError}</span>
        </div>
      )}

      {grantResult && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-400/60 space-y-2 text-xs font-jakarta shadow-[0_0_20px_rgba(52,211,153,0.2)]">
          <div className="text-emerald-400 font-extrabold font-kanit italic uppercase tracking-wider text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{grantResult.message}</span>
          </div>
          <div className="flex items-center gap-4 text-p3-muted font-rajdhani text-xs uppercase font-bold pt-1 border-t border-emerald-400/20">
            <span>ADDED: <strong className="text-emerald-400">{grantResult.total_added}</strong></span>
            <span className="opacity-40">|</span>
            <span>UNMATCHED: <strong className="text-amber-400">{grantResult.unmatched_identifiers_count}</strong></span>
          </div>
        </div>
      )}

      {/* Grant Access Form */}
      <form onSubmit={handleSubmitAccess} className="space-y-4">
        <div>
          <label className="block font-rajdhani font-bold italic text-xs text-p3-muted uppercase tracking-wider mb-2 items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-p3-primary" />
            ENTER TARGET USERNAMES OR EMAILS (SEPARATED BY COMMA OR NEWLINE)
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="e.g. user@example.com, john_doe, admin_test"
              className="w-full bg-p3-background border border-p3-primary/40 p-3 font-jakarta text-xs text-p3-primary placeholder:text-p3-muted/50 focus:outline-none focus:border-p3-primary focus:ring-1 focus:ring-p3-primary resize-none transition-all"
            />
          </div>
        </div>

        {/* Parsed Chips Preview */}
        {parsedIdentifiers.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-rajdhani font-bold text-p3-accent uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> TARGET QUEUE ({parsedIdentifiers.length}):
              </span>
            </div>
            <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-2 bg-p3-background/60 border border-p3-primary/20">
              {parsedIdentifiers.map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-2 px-2.5 py-1 bg-p3-surface border border-p3-primary/40 text-p3-primary font-jakarta text-[11px] font-bold shadow-xs hover:border-p3-accent transition-colors"
                >
                  <span className="truncate max-w-xs">{id}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChip(id)}
                    className="text-p3-muted hover:text-red-400 transition-colors p-0.5 rounded cursor-pointer"
                    title="Remove identifier"
                  >
                    <X className="w-3 h-3 stroke-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-[10px] font-rajdhani font-bold italic text-p3-muted uppercase">
            {parsedIdentifiers.length === 0 ? "[ AWAITING INPUT ]" : `[ READY TO DISPATCH ${parsedIdentifiers.length} ACCESS GRANT(S) ]`}
          </span>

          <button
            type="submit"
            disabled={isSubmitting || parsedIdentifiers.length === 0}
            className={`${btnBase} bg-cyan-400 text-slate-950 hover:bg-cyan-300 border border-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.4)] ${
              isSubmitting || parsedIdentifiers.length === 0
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isSubmitting ? (
              <>
                <Activity className="w-3.5 h-3.5 animate-spin text-slate-950" />
                <span>GRANTING ACCESS...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 text-slate-950" />
                <span>GRANT ACCESS NOW</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
