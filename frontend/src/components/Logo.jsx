export default function Logo({ size = 34 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="InterviewPrep logo"
    >
      <defs>
        <linearGradient id="logo-bubble" x1="10" y1="8" x2="110" y2="112" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--fuchsia)" />
          <stop offset="100%" stopColor="var(--cyan)" />
        </linearGradient>
      </defs>

      {/* speech-bubble body */}
      <circle cx="60" cy="52" r="48" fill="url(#logo-bubble)" />
      <path d="M28 90 L14 113 L48 89 Z" fill="url(#logo-bubble)" />

      {/* bot head */}
      <rect x="27" y="21" width="66" height="62" rx="20" fill="var(--surface-solid)" />

      {/* headset arc + ear cups */}
      <path d="M35 34 C 35 10, 85 10, 85 34" stroke="var(--text)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="34" cy="42" rx="6" ry="9" fill="var(--text)" />
      <ellipse cx="86" cy="42" rx="6" ry="9" fill="var(--text)" />

      {/* antenna */}
      <rect x="57" y="12" width="6" height="10" rx="3" fill="var(--text)" />

      {/* face plate */}
      <rect x="38" y="33" width="44" height="38" rx="13" fill="#160F22" />

      {/* eyes */}
      <circle cx="52" cy="51" r="6.5" stroke="var(--cyan)" strokeWidth="3" fill="none" />
      <circle cx="52" cy="51" r="1.8" fill="var(--cyan)" />
      <circle cx="70" cy="51" r="6.5" stroke="var(--cyan)" strokeWidth="3" fill="none" />
      <circle cx="70" cy="51" r="1.8" fill="var(--cyan)" />

      {/* smile */}
      <path d="M52 61 Q61 68 70 61" stroke="var(--cyan)" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* mic boom */}
      <path d="M35 42 C 30 60, 40 75, 58 76" stroke="var(--text)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <rect x="56" y="71" width="12" height="8" rx="4" fill="var(--text)" />
    </svg>
  );
}
