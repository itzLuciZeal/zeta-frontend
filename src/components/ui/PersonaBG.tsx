export const PersonaBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-[#030712] overflow-hidden pointer-events-none select-none">
      {/* Dynamic Keyframes for Seamless Grid Motion */}
      <style>{`
        @keyframes p3GridScroll {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(48px, 48px);
          }
        }
        .animate-p3-grid {
          animation: p3GridScroll 3s linear infinite;
        }
      `}</style>

      {/* Ambient Pulsing Atmospheric Highlights */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute top-1/4 -right-20 w-md h-112 bg-blue-600/20 rounded-full blur-[140px]" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-sky-400/15 rounded-full blur-[110px]" />

      {/* Skewed Moving Persona Grid Container */}
      <div className="absolute -inset-25 opacity-30 transform -skew-y-12 scale-125">
        <div className="w-full h-full animate-p3-grid">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="p3-grid"
                width="48"
                height="48"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 48 0 L 0 0 0 48"
                  fill="none"
                  stroke="#00f0ff"
                  strokeWidth="1.2"
                  opacity="0.6"
                />
                <circle cx="48" cy="0" r="1.8" fill="#00f0ff" opacity="0.9" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#p3-grid)" />
          </svg>
        </div>
      </div>

      {/* Sharp Speed-Line Accent Slashes */}
      <div className="absolute inset-0 bg-linear-to-tr from-transparent via-cyan-500/5 to-transparent opacity-70" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(3,7,18,0.6)_100%)]" />
    </div>
  );
};
