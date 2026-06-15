/** Marca oficial do DryMusic — a mesma do favicon/ícones. */
export default function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      role="img"
      aria-label="DryMusic"
    >
      <defs>
        <linearGradient id="drymusic-logo" x1="0" y1="0" x2="0" y2="512" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1ed760" />
          <stop offset="1" stopColor="#1db954" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="118" fill="url(#drymusic-logo)" />
      <g fill="#0b0b0b">
        <rect x="300" y="120" width="34" height="236" rx="17" />
        <path d="M334 120c0 0 84 24 84 104c0 30-18 52-40 64c14-22 14-44 2-64c-12-20-46-30-46-30z" />
        <circle cx="206" cy="356" r="86" />
      </g>
      <path d="M188 326l46 30l-46 30z" fill="url(#drymusic-logo)" />
    </svg>
  );
}
