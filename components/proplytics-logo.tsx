const LOGO_SIZES: Record<string, { icon: number; text: string; gap: string }> = {
  xs: { icon: 18, text: "text-xs", gap: "gap-1" },
  sm: { icon: 22, text: "text-sm", gap: "gap-1.5" },
  md: { icon: 28, text: "text-base", gap: "gap-2" },
  lg: { icon: 36, text: "text-xl", gap: "gap-2.5" },
}

const DEFAULT_SIZE = LOGO_SIZES.md

export function ProplyticsLogo({
  size = "md",
  showText = true,
  className = "",
}: {
  size?: string
  showText?: boolean
  className?: string
}) {
  const cfg = LOGO_SIZES[size] ?? DEFAULT_SIZE

  return (
    <span className={`inline-flex items-center ${cfg.gap} ${className}`}>
      <svg
        width={cfg.icon}
        height={cfg.icon}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="28" height="28" rx="7" className="fill-primary" />
        <rect x="6" y="16" width="4" height="6" rx="1" fill="currentColor" className="text-primary-foreground" opacity="0.6" />
        <rect x="12" y="11" width="4" height="11" rx="1" fill="currentColor" className="text-primary-foreground" opacity="0.8" />
        <rect x="18" y="6" width="4" height="16" rx="1" fill="currentColor" className="text-primary-foreground" />
      </svg>
      {showText && (
        <span className={`font-semibold tracking-tight ${cfg.text}`}>
          proplytics<span className="text-primary">.de</span>
        </span>
      )}
    </span>
  )
}
