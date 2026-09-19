import type { FC } from "react";

interface PersonaLoadingProps {
  fullScreen?: boolean;
  message?: string;
}

export const PersonaLoading: FC<PersonaLoadingProps> = ({
  fullScreen = false,
  message = "SYSTEM LOADING...",
}) => {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030b1e] select-none overflow-hidden p-4"
    : "fixed bottom-3 right-3 sm:bottom-5 sm:right-5 md:bottom-6 md:right-6 z-40 pointer-events-none select-none max-w-[calc(100vw-1.5rem)] w-fit";

  const appVersion = import.meta.env.APP_VERSION || "0.0.0";

  const getBadgeLabel = (version: string): string => {
    if (version.includes("alpha")) return "[ALPHA]";
    if (version.includes("beta")) return "[BETA]";
    return "";
  };

  return (
    <div className={containerClasses}>
      <style>{`
        @keyframes p3PulseText {
          0%, 100% { opacity: 1; transform: scale(1); filter: drop-shadow(0 0 6px rgba(0,240,255,0.8)); }
          50% { opacity: 0.75; transform: scale(0.98); filter: drop-shadow(0 0 2px rgba(0,240,255,0.4)); }
        }
        @keyframes p3RotateShard {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.15); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes p3BarWave {
          0%, 100% { height: 3px; }
          50% { height: 14px; }
        }
        @media (min-width: 640px) {
          @keyframes p3BarWave {
            0%, 100% { height: 4px; }
            50% { height: 18px; }
          }
        }
        .animate-p3-rotate {
          animation: p3RotateShard 2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
        .animate-p3-pulse-text {
          animation: p3PulseText 1.2s ease-in-out infinite;
        }
      `}</style>

      {/* PITCH-BLACK / DEEP BLUE FULLSCREEN CANVAS */}
      {fullScreen && (
        <>
          {/* Solid Deep Space Base Layer */}
          <div className="absolute inset-0 bg-[#020714] pointer-events-none" />

          {/* Radial Center Glow Accent */}
          <div className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-cyan-900/25 via-[#030b1e]/90 to-[#030b1e] pointer-events-none" />

          {/* Skewed Background Graphic Slashes */}
          <div className="absolute top-1/3 -left-20 w-[120%] h-20 sm:h-32 bg-cyan-500/10 -skew-y-6 pointer-events-none" />
          <div className="absolute top-2/3 -right-20 w-[120%] h-28 sm:h-48 bg-blue-900/20 -skew-y-6 pointer-events-none" />

          {/* Watermark Persona Canvas Typography */}
          <div className="absolute left-3 bottom-3 sm:left-6 sm:bottom-6 opacity-15 pointer-events-none flex flex-col leading-none italic font-black text-5xl sm:text-7xl md:text-8xl text-cyan-400 -skew-x-12 select-none">
            <span>LOADING</span>
            <span className="text-white text-3xl sm:text-5xl md:text-6xl">
              SYSTEM//03
            </span>
          </div>
        </>
      )}

      {/* PERSONA 3 RELOAD HUD LOADING CARD */}
      <div
        className={`relative flex items-center gap-2 sm:gap-2.5 bg-[#020a1c]/95 border-2 border-cyan-400 p-2 sm:p-2.5 md:p-3 shadow-[3px_3px_0px_0px_#001144] sm:shadow-[4px_4px_0px_0px_#001144] -skew-x-6 overflow-hidden w-fit max-w-full ${
          fullScreen
            ? "z-10 scale-85 sm:scale-95 md:scale-105"
            : "scale-80 sm:scale-85 md:scale-90 origin-bottom-right"
        }`}
      >
        {/* Ambient Light Sweep Effect */}
        <div className="absolute inset-0 bg-linear-to-r from-cyan-500/20 via-blue-600/30 to-transparent pointer-events-none" />

        {/* Rotating Geometric Core Shard */}
        <div className="relative w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center bg-cyan-400 text-[#020612] shrink-0 -skew-x-6 shadow-[1.5px_1.5px_0px_0px_#000]">
          <div
            className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-[#020612] animate-p3-rotate flex items-center justify-center"
            style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
          >
            <div
              className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-cyan-400"
              style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
            />
          </div>
        </div>

        {/* Text & Status Details */}
        <div className="flex flex-col min-w-0 pr-1 z-10">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="w-1.5 h-1.5 bg-cyan-400 animate-ping shrink-0" />
            <span className="text-cyan-400 font-black italic text-[8px] sm:text-[9px] md:text-[10px] tracking-wider uppercase whitespace-nowrap">
              ZETA SYSTEM // {appVersion} {getBadgeLabel(appVersion)}
            </span>
          </div>
          <p className="text-cyan-200 font-black italic text-[10px] sm:text-xs md:text-xs tracking-wider uppercase animate-p3-pulse-text drop-shadow-[1px_1px_0px_#001144] whitespace-nowrap">
            {message}
          </p>
        </div>

        {/* P3 Equalizer Audio Waveform */}
        <div className="flex items-end gap-0.5 sm:gap-1 h-3.5 sm:h-5 pl-1.5 sm:pl-2 border-l-2 border-cyan-500/40 z-10 shrink-0">
          <span
            className="w-0.5 sm:w-1 bg-cyan-400"
            style={{ animation: "p3BarWave 0.7s ease-in-out infinite 0.1s" }}
          />
          <span
            className="w-0.5 sm:w-1 bg-cyan-300"
            style={{ animation: "p3BarWave 0.7s ease-in-out infinite 0.3s" }}
          />
          <span
            className="w-0.5 sm:w-1 bg-blue-500"
            style={{ animation: "p3BarWave 0.7s ease-in-out infinite 0.2s" }}
          />
          <span
            className="w-0.5 sm:w-1 bg-cyan-400"
            style={{ animation: "p3BarWave 0.7s ease-in-out infinite 0.4s" }}
          />
        </div>

        {/* Accent Corner Triangle */}
        <div
          className="absolute -right-1 -bottom-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-cyan-400 opacity-90"
          style={{ clipPath: "polygon(100% 0, 0 100%, 100% 100%)" }}
        />
      </div>
    </div>
  );
};
