"use client"

import { memo } from "react"

// Memoized mini logo component for performance
const MiniLogo = memo(function MiniLogo({ 
  x, 
  y, 
  scale, 
  index 
}: { 
  x: number
  y: number
  scale: number
  index: number 
}) {
  return (
    <div
      className="absolute animate-pulse-subtle"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        animationDelay: `${index * 0.6}s`,
      }}
    >
      {/* Glow */}
      <div 
        className="absolute -inset-4 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.6) 0%, transparent 70%)' }}
      />
      {/* Mini Logo */}
      <svg 
        width="28" 
        height="28" 
        viewBox="0 0 32 32" 
        fill="none" 
        className="relative"
        style={{ 
          transform: `scale(${scale})`,
          filter: 'drop-shadow(0 0 12px rgba(52,211,153,1))',
        }}
      >
        <defs>
          <linearGradient id={`logoGrad${index}`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
        </defs>
        <path d="M16 2C10.477 2 6 6.477 6 12c0 7.5 10 18 10 18s10-10.5 10-18c0-5.523-4.477-10-10-10z" stroke={`url(#logoGrad${index})`} strokeWidth="2.5" fill="rgba(16,185,129,0.15)"/>
        <rect x="11" y="10" width="3" height="8" rx="0.5" fill={`url(#logoGrad${index})`}/>
        <rect x="15.5" y="8" width="3" height="10" rx="0.5" fill={`url(#logoGrad${index})`}/>
        <rect x="20" y="12" width="3" height="6" rx="0.5" fill={`url(#logoGrad${index})`} opacity="0.8"/>
      </svg>
    </div>
  )
})

const logoPositions = [
  { x: 8, y: 35, scale: 1.2 },
  { x: 14, y: 40, scale: 1.1 },
  { x: 10, y: 48, scale: 1.3 },
  { x: 18, y: 35, scale: 1 },
  { x: 22, y: 45, scale: 1.15 },
  { x: 16, y: 52, scale: 1.1 },
  { x: 6, y: 45, scale: 1.25 },
  { x: 12, y: 55, scale: 1 },
]

export const HeroBackground = memo(function HeroBackground() {
  return (
    <>
      {/* Modern Background - Clean Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100" />

      {/* Elegant Geometric Pattern */}
      <div className="absolute inset-0 opacity-30">
        {/* Large geometric shapes */}
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 blur-3xl" />
        <div className="absolute bottom-32 left-20 w-80 h-80 rounded-full bg-gradient-to-br from-blue-100 to-emerald-100 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-slate-200 to-emerald-50 blur-3xl" />

        {/* Architectural inspired elements */}
        <div className="absolute top-40 left-32 w-2 h-32 bg-gradient-to-b from-emerald-200 to-transparent rotate-12" />
        <div className="absolute top-60 right-40 w-2 h-24 bg-gradient-to-b from-teal-200 to-transparent -rotate-6" />
        <div className="absolute bottom-40 left-1/3 w-2 h-40 bg-gradient-to-b from-slate-300 to-transparent rotate-3" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(16,185,129,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16,185,129,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Floating Property Icons */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Modern property-inspired floating elements */}
        {[
          { icon: "🏠", x: 15, y: 25, scale: 1.5, delay: 0 },
          { icon: "🏢", x: 85, y: 30, scale: 1.3, delay: 1 },
          { icon: "🏘️", x: 20, y: 70, scale: 1.2, delay: 2 },
          { icon: "🏗️", x: 80, y: 65, scale: 1.4, delay: 0.5 },
          { icon: "🏡", x: 10, y: 45, scale: 1.1, delay: 1.5 },
          { icon: "🌆", x: 90, y: 50, scale: 1.6, delay: 2.5 },
        ].map((item, i) => (
          <div
            key={i}
            className="absolute animate-pulse-subtle opacity-60"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              animationDelay: `${item.delay}s`,
              fontSize: `${item.scale}rem`,
            }}
          >
            <div className="text-emerald-600/40 drop-shadow-sm">
              {item.icon}
            </div>
          </div>
        ))}

        {/* Professional data points */}
        {[
          { label: "€2.5M", x: 25, y: 35, color: "text-emerald-600" },
          { label: "4.8%", x: 75, y: 40, color: "text-teal-600" },
          { label: "78%", x: 30, y: 60, color: "text-blue-600" },
          { label: "A+", x: 70, y: 70, color: "text-slate-600" },
        ].map((point, i) => (
          <div
            key={i}
            className="absolute animate-pulse-subtle opacity-50"
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              animationDelay: `${i * 0.8}s`,
            }}
          >
            <div className={`text-xs font-semibold ${point.color} bg-white/80 px-2 py-1 rounded-full border border-white/50 shadow-sm`}>
              {point.label}
            </div>
          </div>
        ))}
      </div>

      {/* Subtle gradient overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 40%, transparent 80%)',
        }}
      />
    </>
  )
})
