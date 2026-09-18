export function getPressureScoreBadge(grade: string): string {
  switch (grade?.toUpperCase()) {
    case "A+":
    case "A":
      return "bg-emerald-400 text-slate-950 border-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.5)] transition-all duration-300 hover:scale-105";
    case "A-":
    case "B+":
    case "B":
      return "bg-cyan-400 text-slate-950 border-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all duration-300 hover:scale-105";
    case "B-":
    case "C+":
    case "C":
      return "bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.5)] transition-all duration-300 hover:scale-105";
    case "C-":
    case "D":
      return "bg-orange-500 text-white border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.5)] transition-all duration-300 hover:scale-105";
    default:
      return "bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all duration-300 hover:scale-105"; // F / Critical
  }
}

export function getAccuracyBadge(integrityLevel: string): string {
  const level = integrityLevel || "";
  if (level.includes("Mastery")) {
    return "text-emerald-400 border-emerald-500/50 bg-emerald-950/30 shadow-[0_0_10px_rgba(52,211,153,0.3)] transition-all duration-300 hover:bg-emerald-950/50";
  }
  if (level.includes("Proficiency")) {
    return "text-cyan-400 border-cyan-500/50 bg-cyan-950/30 shadow-[0_0_10px_rgba(34,211,238,0.3)] transition-all duration-300 hover:bg-cyan-950/50";
  }
  if (level.includes("Competence")) {
    return "text-blue-400 border-blue-500/50 bg-blue-950/30 shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all duration-300 hover:bg-blue-950/50";
  }
  if (level.includes("Fragile")) {
    return "text-amber-400 border-amber-500/50 bg-amber-950/30 shadow-[0_0_10px_rgba(251,191,36,0.3)] transition-all duration-300 hover:bg-amber-950/50";
  }
  return "text-red-400 border-red-500/50 bg-red-950/30 shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-all duration-300 hover:bg-red-950/50"; // Critical Deficit
}

export function getPacingVelocityBadge(velocity: string): string {
  switch (velocity?.toUpperCase()) {
    case "HYPER-VELOCITY":
      return "text-purple-400 border-purple-500/50 bg-purple-950/30 shadow-[0_0_10px_rgba(168,85,247,0.3)] transition-all duration-300 hover:bg-purple-950/50";
    case "OPTIMAL FLOW":
      return "text-emerald-400 border-emerald-500/50 bg-emerald-950/30 shadow-[0_0_10px_rgba(52,211,153,0.3)] transition-all duration-300 hover:bg-emerald-950/50";
    case "DELIBERATE ANALYSIS":
      return "text-cyan-400 border-cyan-500/50 bg-cyan-950/30 shadow-[0_0_10px_rgba(34,211,238,0.3)] transition-all duration-300 hover:bg-cyan-950/50";
    case "EXTENDED STRAIN":
      return "text-amber-400 border-amber-500/50 bg-amber-950/30 shadow-[0_0_10px_rgba(251,191,36,0.3)] transition-all duration-300 hover:bg-amber-950/50";
    default:
      return "text-red-400 border-red-500/50 bg-red-950/30 shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-all duration-300 hover:bg-red-950/50";
  }
}
