export function LiftIQMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="LiftIQ AI"
    >
      {/* Left plate */}
      <rect x="1" y="10" width="6" height="20" rx="3" fill="currentColor" />
      {/* Left collar */}
      <rect x="7" y="14" width="4" height="12" rx="1.5" fill="currentColor" />
      {/* Bar */}
      <rect x="11" y="17" width="18" height="6" rx="1.5" fill="currentColor" />
      {/* Right collar */}
      <rect x="29" y="14" width="4" height="12" rx="1.5" fill="currentColor" />
      {/* Right plate */}
      <rect x="33" y="10" width="6" height="20" rx="3" fill="currentColor" />
      {/* Rising IQ spark — dark line cuts through the bar suggesting intelligence */}
      <path
        d="M14 17L17 10L20 14L23 7L26 13"
        stroke="#0a0a0a"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
