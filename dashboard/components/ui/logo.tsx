"use client"

import Link from "next/link"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  href?: string
}

export function Logo({ size = "md", showText = true, href = "/" }: LogoProps) {
  const sizes = {
    sm: { svg: 20, text: "text-sm" },
    md: { svg: 28, text: "text-base" },
    lg: { svg: 32, text: "text-lg" },
  }

  const { svg, text } = sizes[size]

  const logoContent = (
    <div className="flex items-center gap-2 group">
      <svg
        width={svg}
        height={svg}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform group-hover:scale-110"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
        </defs>
        <path
          d="M16 2C10.477 2 6 6.477 6 12c0 7.5 10 18 10 18s10-10.5 10-18c0-5.523-4.477-10-10-10z"
          stroke="url(#logoGradient)"
          strokeWidth="2.5"
          fill="none"
        />
        <rect x="11" y="10" width="3" height="8" rx="1" fill="url(#logoGradient)" />
        <rect x="15.5" y="8" width="3" height="10" rx="1" fill="url(#logoGradient)" />
        <rect x="20" y="12" width="3" height="6" rx="1" fill="url(#logoGradient)" opacity="0.7" />
      </svg>
      {showText && (
        <span className={`${text} font-semibold tracking-tight text-foreground`}>
          Proplytics
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="flex items-center">
        {logoContent}
      </Link>
    )
  }

  return logoContent
}
