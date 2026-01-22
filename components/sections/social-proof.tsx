"use client"

import { useEffect, useState, useRef } from "react"

const stats = [
  { value: 15000, suffix: "+", label: "Bewertungen", prefix: "" },
  { value: 4.8, suffix: "/5", label: "Kundenzufriedenheit", prefix: "", decimals: 1 },
  { value: 60, suffix: "s", label: "Durchschnittliche Analyse", prefix: "" },
  { value: 98, suffix: "%", label: "Genauigkeit", prefix: "" },
]

function AnimatedCounter({ 
  value, 
  suffix = "", 
  prefix = "",
  decimals = 0,
  duration = 2000 
}: { 
  value: number
  suffix?: string
  prefix?: string
  decimals?: number
  duration?: number
}) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(easeOutQuart * value)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrame)
  }, [isVisible, value, duration])

  const displayValue = decimals > 0 
    ? count.toFixed(decimals) 
    : Math.floor(count).toLocaleString('de-DE')

  return (
    <div ref={ref} className="text-3xl md:text-4xl font-semibold text-black mb-1">
      {prefix}{displayValue}{suffix}
    </div>
  )
}

export function SocialProof() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-white to-slate-50 border-t border-black/5">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <AnimatedCounter 
                value={stat.value} 
                suffix={stat.suffix} 
                prefix={stat.prefix}
                decimals={stat.decimals}
              />
              <div className="text-sm text-black/50">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
