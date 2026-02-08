interface ProplyticsLogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function ProplyticsLogo({ size = "md", showText = true, className = "" }: ProplyticsLogoProps) {
  const sizes = {
    sm: { icon: 24, text: "text-sm" },
    md: { icon: 32, text: "text-base" },
    lg: { icon: 40, text: "text-xl" },
  }

  const s = sizes[size]

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Rounded square background */}
        <rect width="40" height="40" rx="10" className="fill-primary" />
        {/* Stylized "P" with data-line accent */}
        <path
          d="M13 10h8a7 7 0 0 1 0 14h-4v6h-4V10z"
          className="fill-primary-foreground"
          opacity="0.95"
        />
        {/* Cut-out inner of P */}
        <rect x="17" y="14" width="4" height="6" rx="2" className="fill-primary" />
        {/* Data line accent - small rising bars */}
        <rect x="26" y="26" width="3" height="4" rx="1" className="fill-primary-foreground" opacity="0.5" />
        <rect x="30" y="23" width="3" height="7" rx="1" className="fill-primary-foreground" opacity="0.7" />
        <rect x="34" y="19" width="3" height="11" rx="1" className="fill-primary-foreground" opacity="0.4" />
      </svg>
      {showText && (
        <span className={`font-semibold tracking-tight ${s.text}`}>
          proplytics<span className="text-primary">.de</span>
        </span>
      )}
    </span>
  )
}
