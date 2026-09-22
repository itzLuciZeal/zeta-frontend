export default function Footer() {
  const appVersion = import.meta.env.APP_VERSION || "";
  const lowerVersion = appVersion.toLowerCase();

  const isAlpha = lowerVersion.includes("alpha");
  const isBeta = lowerVersion.includes("beta");

  return (
    <div className="p-4 w-full flex flex-col items-center justify-center space-y-1 mt-4">
      <p className="font-rajdhani font-bold italic text-xs tracking-widest text-p3-muted -skew-x-6">
        ZETA // {appVersion.toUpperCase() || "0.0.0"}{" "}
        {isAlpha ? "[ALPHA VERSION]" : isBeta ? "[BETA VERSION]" : ""}
      </p>
      <p className="font-jakarta text-[11px] text-p3-muted/80 italic">
        © 2026 itzLuciZeal. ALL RIGHTS RESERVED.
      </p>
      <p className="font-kanit font-extrabold italic text-xs text-p3-primary tracking-wider -skew-x-6 mt-1">
        ZENITH EFFICIENCY TIMED ASSESSMENT
      </p>
    </div>
  );
}
