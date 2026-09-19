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
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030b1e] select-none overflow-hidden"
    : "fixed bottom-6 right-6 z-50 pointer-events-none select-none";
  const appVersion = import.meta.env.APP_VERSION;

  return (
    <div className={containerClasses}>
      <style>{`
        @keyframes p3PulseText {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.98); }
        }
        @keyframes p3RotateShard {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.2); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes p3BarWave {
          0%, 100% { height: 6px; }
          50% { height: 28px; }
        }
        .animate-p3-rotate {
          animation: p3RotateShard 2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
        .animate-p3-pulse-text {
          animation: p3PulseText 1.2s ease-in-out infinite;
        }
      `}</style>

      {/* PITCH-BLACK / DEEP BLUE FULLSCREEN CANVAS (FULLY OPAQUE) */}
      {fullScreen && (
        <>
          {/* Solid Deep Space Base Layer */}
          <div className="absolute inset-0 bg-[#020714] pointer-events-none" />

          {/* Radial Center Glow Accent */}
          <div className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-cyan-900/25 via-[#030b1e]/90 to-[#030b1e] pointer-events-none" />

          {/* Skewed Background Graphic Slashes */}
          <div className="absolute top-1/3 -left-20 w-[120%] h-32 bg-cyan-500/10 -skew-y-6 pointer-events-none" />
          <div className="absolute top-2/3 -right-20 w-[120%] h-48 bg-blue-900/20 -skew-y-6 pointer-events-none" />

          {/* Watermark Persona Canvas Typography */}
          <div className="absolute left-6 bottom-6 opacity-15 pointer-events-none flex flex-col leading-none italic font-black text-8xl sm:text-9xl text-cyan-400 -skew-x-12 select-none">
            <span>LOADING</span>
            <span className="text-white text-6xl sm:text-7xl">SYSTEM//03</span>
          </div>
        </>
      )}

      {/* PERSONA 3 RELOAD HUD LOADING CARD */}
      <div
        className={`relative flex items-center gap-4 bg-[#030d22] border-2 border-cyan-400 p-5 sm:p-6 shadow-[10px_10px_0px_0px_#001144] -skew-x-6 overflow-hidden max-w-sm sm:max-w-md ${
          fullScreen ? "z-10 scale-110 sm:scale-125" : ""
        }`}
      >
        {/* Ambient Light Sweep Effect */}
        <div className="absolute inset-0 bg-linear-to-r from-cyan-500/20 via-blue-600/30 to-transparent pointer-events-none" />

        {/* Rotating Geometric Core Shard */}
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-cyan-400 text-[#020612] shrink-0 -skew-x-6 shadow-[4px_4px_0px_0px_#000]">
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 bg-[#020612] animate-p3-rotate flex items-center justify-center"
            style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
          >
            <div
              className="w-4 h-4 bg-cyan-400"
              style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
            />
          </div>
        </div>

        {/* Text & Status Details */}
        <div className="flex flex-col pr-2 z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 bg-cyan-400 animate-ping" />
            <span className="text-cyan-400 font-black italic text-[11px] sm:text-xs tracking-widest uppercase">
              ZETA SYSTEM // {appVersion} {appVersion.includes("alpha") ? "[ALPHA VERSION]" : appVersion.includes("beta") && "[BETA VERSION]"}
            </span>
          </div>
          <p className="text-white font-black italic text-sm sm:text-base tracking-wider uppercase animate-p3-pulse-text drop-shadow-[2px_2px_0px_#00f0ff]">
            {message}
          </p>
        </div>

        {/* P3 Equalizer Audio Waveform */}
        <div className="flex items-end gap-1.5 h-8 pl-3 border-l-2 border-cyan-500/40 z-10">
          <span
            className="w-1.5 bg-cyan-400"
            style={{ animation: "p3BarWave 0.7s ease-in-out infinite 0.1s" }}
          />
          <span
            className="w-1.5 bg-cyan-300"
            style={{ animation: "p3BarWave 0.7s ease-in-out infinite 0.3s" }}
          />
          <span
            className="w-1.5 bg-blue-500"
            style={{ animation: "p3BarWave 0.7s ease-in-out infinite 0.2s" }}
          />
          <span
            className="w-1.5 bg-cyan-400"
            style={{ animation: "p3BarWave 0.7s ease-in-out infinite 0.4s" }}
          />
        </div>

        {/* Accent Corner Triangle */}
        <div
          className="absolute -right-1 -bottom-1 w-7 h-7 bg-cyan-400 opacity-90"
          style={{ clipPath: "polygon(100% 0, 0 100%, 100% 100%)" }}
        />
      </div>
    </div>
  );
};
