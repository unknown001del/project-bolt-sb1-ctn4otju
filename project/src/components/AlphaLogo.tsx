interface Props {
  size?: number;
  glowing?: boolean;
  className?: string;
}

/** Polished metallic "Alpha Studio" wolf-profile badge.
 *  Chrome/silver base with electric violet, indigo, and neon cyan accents.
 *  Glows when AI tasks are processing. */
export default function AlphaLogo({ size = 36, glowing = false, className = '' }: Props) {
  const gid = `wolf-${size}-${glowing ? 'g' : 's'}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={glowing ? { filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.7))' } : { filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))' }}
    >
      <defs>
        {/* Chrome/silver metallic gradient */}
        <linearGradient id={`${gid}-chrome`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="30%" stopColor="#cbd5e1" />
          <stop offset="50%" stopColor="#94a3b8" />
          <stop offset="70%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        {/* Violet accent gradient */}
        <linearGradient id={`${gid}-violet`} x1="0" y1="0" x2="32" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        {/* Cyan neon gradient */}
        <linearGradient id={`${gid}-cyan`} x1="32" y1="0" x2="64" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        {/* Indigo deep glow */}
        <radialGradient id={`${gid}-glow`} cx="32" cy="32" r="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Glow halo when processing */}
      {glowing && (
        <circle cx="32" cy="32" r="30" fill={`url(#${gid}-glow)`}>
          <animate attributeName="opacity" values="0.4;0.9;0.4" dur="1.8s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Hexagonal badge frame */}
      <path
        d="M32 4 L54 17 L54 47 L32 60 L10 47 L10 17 Z"
        fill="none"
        stroke={`url(#${gid}-chrome)`}
        strokeWidth="2"
        opacity="0.6"
      />
      {/* Inner hex frame */}
      <path
        d="M32 8 L50 19 L50 45 L32 56 L14 45 L14 19 Z"
        fill="none"
        stroke={`url(#${gid}-violet)`}
        strokeWidth="0.5"
        opacity="0.3"
      />

      {/* Wolf profile — stylized geometric head facing right */}
      {/* Main head shape */}
      <path
        d="M22 20 L18 14 L20 22 L16 26 L18 30 L14 34 L20 36 L18 42 L24 40 L26 46 L30 42 L32 46 L36 42 L40 44 L42 38 L48 36 L46 30 L50 26 L46 22 L48 14 L44 20 L40 16 L36 20 L32 16 L28 20 L24 18 Z"
        fill={`url(#${gid}-chrome)`}
        stroke="#475569"
        strokeWidth="0.5"
      />

      {/* Wolf ear — left (back) */}
      <path
        d="M20 22 L16 14 L22 18 Z"
        fill={`url(#${gid}-violet)`}
        opacity="0.7"
      />
      {/* Wolf ear — right (front) */}
      <path
        d="M28 20 L24 12 L30 16 Z"
        fill={`url(#${gid}-chrome)`}
        stroke="#475569"
        strokeWidth="0.3"
      />

      {/* Wolf eye — glowing cyan */}
      <circle cx="34" cy="28" r="2.5" fill={`url(#${gid}-cyan)`}>
        {glowing && <animate attributeName="opacity" values="0.7;1;0.7" dur="1.2s" repeatCount="indefinite" />}
      </circle>
      <circle cx="34" cy="28" r="1" fill="#ecfeff" />

      {/* Wolf snout/muzzle detail */}
      <path
        d="M36 32 L44 34 L42 38 L36 36 Z"
        fill={`url(#${gid}-chrome)`}
        stroke="#475569"
        strokeWidth="0.3"
      />
      {/* Nose tip */}
      <circle cx="44" cy="34" r="1.5" fill="#1e293b" />

      {/* Lower jaw / fang hint */}
      <path
        d="M38 36 L42 38 L40 42 L36 40 Z"
        fill="#94a3b8"
        opacity="0.6"
      />

      {/* Violet accent streak along neck */}
      <path
        d="M18 36 L24 40 L22 44 L16 40 Z"
        fill={`url(#${gid}-violet)`}
        opacity="0.5"
      />

      {/* Cyan neon accent on shoulder */}
      <path
        d="M40 40 L46 38 L44 44 L38 42 Z"
        fill={`url(#${gid}-cyan)`}
        opacity="0.4"
      />
    </svg>
  );
}
