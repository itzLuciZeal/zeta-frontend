export const PersonaBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-[#020612] overflow-hidden pointer-events-none select-none">
      {/* Persona 3 Reload Keyframes */}
      <style>{`
        @keyframes p3GridScroll {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(48px, 48px);
          }
        }
        @keyframes p3DriftSlow {
          0% {
            transform: translateY(0px) rotate(45deg);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-25px) rotate(60deg);
            opacity: 0.7;
          }
          100% {
            transform: translateY(0px) rotate(45deg);
            opacity: 0.3;
          }
        }
        @keyframes p3DriftFast {
          0% {
            transform: translateY(0px) rotate(45deg);
            opacity: 0.4;
          }
          50% {
            transform: translateY(35px) rotate(30deg);
            opacity: 0.8;
          }
          100% {
            transform: translateY(0px) rotate(45deg);
            opacity: 0.4;
          }
        }
        @keyframes p3PulseGlow {
          0%, 100% {
            opacity: 0.35;
            transform: scale(1);
          }
          50% {
            opacity: 0.65;
            transform: scale(1.1);
          }
        }
        @keyframes p3RibbonSway {
          0% {
            transform: translateX(-5%) skewY(-12deg);
          }
          50% {
            transform: translateX(4%) skewY(-12deg);
          }
          100% {
            transform: translateX(-5%) skewY(-12deg);
          }
        }

        .animate-p3-grid {
          animation: p3GridScroll 2.2s linear infinite;
        }
        .animate-p3-drift-slow {
          animation: p3DriftSlow 7s ease-in-out infinite;
        }
        .animate-p3-drift-fast {
          animation: p3DriftFast 10s ease-in-out infinite;
        }
        .animate-p3-pulse {
          animation: p3PulseGlow 6s ease-in-out infinite;
        }
        .animate-p3-ribbon {
          animation: p3RibbonSway 12s ease-in-out infinite;
        }
      `}</style>

      {/* Layer 1: Ambient High-Contrast Persona Blue Glows */}
      <div className="absolute top-0 left-0 w-150 h-150 bg-linear-to-br from-cyan-500/30 via-blue-600/20 to-transparent rounded-full blur-[140px] animate-p3-pulse" />
      <div
        className="absolute bottom-0 right-0 w-175 h-175 bg-linear-to-tl from-sky-400/25 via-blue-800/20 to-transparent rounded-full blur-[160px] animate-p3-pulse"
        style={{ animationDelay: '-3s' }}
      />
      <div className="absolute top-1/3 right-1/4 w-112.5 h-112.5 bg-cyan-400/15 rounded-full blur-[120px]" />

      {/* Layer 2: Persona 3 Skewed Dynamic Speed Ribbons */}
      <div className="absolute inset-0 overflow-hidden opacity-50 pointer-events-none">
        {/* Upper Ribbon - Azure Gradient */}
        <div className="absolute -top-32 -left-20 w-[140%] h-70 bg-linear-to-r from-cyan-600/20 via-blue-600/35 to-transparent transform -skew-y-12 animate-p3-ribbon" />

        {/* Center Accent Ribbon - Sharp Electric Cyan */}
        <div
          className="absolute top-1/2 -left-32 w-[150%] h-32.5 bg-linear-to-r from-transparent via-cyan-400/20 to-blue-600/25 transform -skew-y-12 animate-p3-ribbon"
          style={{ animationDelay: '-5s' }}
        />

        {/* Lower Deep Navy Cutout */}
        <div className="absolute -bottom-20 -left-10 w-[130%] h-60 bg-linear-to-r from-blue-900/50 via-cyan-500/15 to-transparent transform -skew-y-12" />
      </div>

      {/* Layer 3: Moving Perspective Cyber Grid */}
      <div className="absolute -inset-25 opacity-55 transform -skew-y-12 scale-125">
        <div className="w-full h-full animate-p3-grid">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="p3-grid-pattern"
                width="48"
                height="48"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 48 0 L 0 0 0 48"
                  fill="none"
                  stroke="#00f0ff"
                  strokeWidth="1.4"
                  opacity="0.8"
                />
                <circle cx="48" cy="0" r="2.2" fill="#00f0ff" opacity="0.95" />
                <circle cx="0" cy="48" r="1.5" fill="#38bdf8" opacity="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#p3-grid-pattern)" />
          </svg>
        </div>
      </div>

      {/* Layer 4: Halftone Matrix Pattern */}
      <div className="absolute inset-0 opacity-20 mix-blend-overlay">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="p3-halftone"
              width="16"
              height="16"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="8" cy="8" r="2.2" fill="#00f0ff" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#p3-halftone)" />
        </svg>
      </div>

      {/* Layer 5: Floating Persona Diamond Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Upper Left Wireframe Diamond */}
        <div className="absolute top-[14%] left-[10%] w-7 h-7 border-2 border-cyan-400/50 bg-cyan-400/10 animate-p3-drift-slow" />

        {/* Center-Right Solid Cyan Diamond */}
        <div className="absolute top-[36%] right-[14%] w-5 h-5 bg-cyan-300/60 shadow-[0_0_12px_#00f0ff] animate-p3-drift-fast" />

        {/* Lower Left Large Diamond */}
        <div
          className="absolute bottom-[22%] left-[18%] w-11 h-11 border border-sky-300/40 bg-blue-500/10 animate-p3-drift-slow"
          style={{ animationDelay: '-3s' }}
        />

        {/* Small Accent Rhombuses */}
        <div
          className="absolute top-[68%] right-[26%] w-3.5 h-3.5 bg-blue-400/50 animate-p3-drift-fast"
          style={{ animationDelay: '-1s' }}
        />
        <div
          className="absolute top-[20%] right-[38%] w-2.5 h-2.5 bg-cyan-200/70 animate-p3-drift-slow"
          style={{ animationDelay: '-4s' }}
        />
      </div>

      {/* Layer 6: Dynamic Speed Slashes Gradient */}
      <div className="absolute inset-0 bg-linear-to-tr from-transparent via-cyan-400/10 to-transparent opacity-90" />

      {/* Layer 7: Deep High-Contrast Radial Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_15%,rgba(2,6,18,0.70)_75%,rgba(2,6,18,0.96)_100%)]" />
    </div>
  );
};
