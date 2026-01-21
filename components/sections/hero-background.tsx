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
      {/* Base Background - White */}
      <div className="absolute inset-0 bg-white" />
      
      {/* Subtle gradient accent */}
      <div 
        className="absolute top-0 left-0 w-full h-[60%] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,185,129,0.05) 0%, transparent 60%)',
        }}
      />

      {/* Earth Image - positioned left side */}
      <div 
        className="absolute pointer-events-none"
        style={{ 
          top: '30%',
          left: '-40%',
          width: '100%',
          height: '80%',
        }}
      >
        {/* Earth image */}
        <img 
          src="/brand/earth-night.png" 
          alt="" 
          className="w-full h-full object-cover object-[50%_60%]"
          loading="eager"
          style={{
            filter: 'saturate(0.9) brightness(1.1) contrast(1.1)',
            maskImage: 'radial-gradient(ellipse 80% 80% at 20% 50%, black 20%, transparent 60%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 20% 50%, black 20%, transparent 60%)',
          }}
        />
        
        {/* Mini Proplytics Logos */}
        {logoPositions.map((p, i) => (
          <MiniLogo key={i} x={p.x} y={p.y} scale={p.scale} index={i} />
        ))}
      </div>
      
      {/* Gradient overlay for text readability */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ 
          background: 'radial-gradient(ellipse 60% 50% at 50% 35%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
        }}
      />
    </>
  )
})
