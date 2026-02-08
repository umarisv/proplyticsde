interface ProplyticsLogoProps {
  size?: "xs" | "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function ProplyticsLogo({ size = "md", showText = true, className = "" }: ProplyticsLogoProps) {
  const sizes = {
    xs: { icon: 18, text: "text-xs", gap: "gap-1" },
    sm: { icon: 22, text: "text-sm", gap: "gap-1.5" },
    md: { icon: 28, text: "text-base", gap: "gap-2" },
    lg: { icon: 36, text: "text-xl", gap: "gap-2.5" },
  }

  const s = sizes[size] || sizes.md

  return (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="28" height="28" rx="7" className="fill-primary" />
        {/* Minimalist chart bars */}
        <rect x="6" y="16" width="4" height="6" rx="1" fill="currentColor" className="text-primary-foreground" opacity="0.6" />
        <rect x="12" y="11" width="4" height="11" rx="1" fill="currentColor" className="text-primary-foreground" opacity="0.8" />
        <rect x="18" y="6" width="4" height="16" rx="1" fill="currentColor" className="text-primary-foreground" />
      </svg>
      {showText && (
        <span className={`font-semibold tracking-tight ${s.text}`}>
          proplytics<span className="text-primary">.de</span>
        </span>
      )}
    </span>
  )
}
