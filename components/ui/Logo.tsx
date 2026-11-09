export function Logo({ size = 28, withText = true }: { size?: number; withText?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <defs>
          <linearGradient id="lg-bl" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#22D3EE" />
            <stop offset="1" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="30" height="30" rx="9" fill="#0D1B2A" stroke="url(#lg-bl)" strokeWidth="1.5" />
        {/* stylised double helix */}
        <path d="M10 7c0 6 12 6 12 12s-12 6-12 6" fill="none" stroke="url(#lg-bl)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M22 7c0 6-12 6-12 12s12 6 12 6" fill="none" stroke="#F8FAFC" strokeOpacity=".85" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M12.5 10.5h7M12.5 21.5h7" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      {withText && (
        <span className="font-[family-name:var(--font-display)] text-[1.05rem] font-bold tracking-tight">
          BioLab <span className="text-cyan">3D</span>
        </span>
      )}
    </span>
  );
}
