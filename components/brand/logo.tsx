interface LogoProps {
  className?: string;
  size?: number;
}

export function PunchlyLogo({ className = "", size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Geometric structural node - represents precision and inspection points */}

      {/* Main vertical line (structural beam) */}
      <path
        d="M16 4 L16 28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Horizontal cross-section */}
      <path
        d="M8 12 L24 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Angular supports - forming abstract 'P' */}
      <path
        d="M16 12 L24 4"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <path
        d="M16 12 L24 20"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Inspection node points */}
      <circle cx="16" cy="12" r="3" fill="currentColor" />
      <circle cx="24" cy="4" r="2.5" fill="currentColor" />
      <circle cx="24" cy="20" r="2.5" fill="currentColor" />
      <circle cx="8" cy="12" r="2.5" fill="currentColor" />
    </svg>
  );
}

export function PunchlyWordmark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <PunchlyLogo size={32} className="text-slate-900" />
      <span className="text-xl font-semibold tracking-tight text-slate-900">
        Punchly
      </span>
    </div>
  );
}
