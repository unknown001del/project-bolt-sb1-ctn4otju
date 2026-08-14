export function NovaLogo({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="Nova supernova badge"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="nova-n-grad" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff8a2b" />
          <stop offset="0.5" stopColor="#ff6b00" />
          <stop offset="1" stopColor="#26e0f0" />
        </linearGradient>
        <filter id="nova-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect
        x="3"
        y="3"
        width="42"
        height="42"
        rx="11"
        fill="#0b0b10"
        stroke="url(#nova-n-grad)"
        strokeWidth="1.5"
      />
      {/* geometric N matrix */}
      <g filter="url(#nova-glow)" stroke="url(#nova-n-grad)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 34 L15 14 L33 34 L33 14" fill="none" />
      </g>
      {/* matrix nodes */}
      <g fill="#26e0f0">
        <circle cx="15" cy="14" r="2.1" />
        <circle cx="33" cy="34" r="2.1" />
      </g>
      <g fill="#ff6b00">
        <circle cx="15" cy="34" r="2.1" />
        <circle cx="33" cy="14" r="2.1" />
        <circle cx="24" cy="24" r="1.7" />
      </g>
    </svg>
  )
}
