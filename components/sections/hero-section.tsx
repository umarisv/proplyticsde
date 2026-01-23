"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, ArrowRight, Loader2, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { HeroBackground } from "./hero-background"

export function HeroSection() {
  const [address, setAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleSubmit = () => {
    if (!address.trim()) {
      inputRef.current?.focus()
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      router.push(`/analyse?address=${encodeURIComponent(address)}`)
    }, 500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit()
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <HeroBackground />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-700">KI-gestützte Immobilienbewertung</span>
          </div>

          {/* Headline */}
          <h1
            className={`text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-slate-900 mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            Immobilie bewerten.{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Sofort.
            </span>
          </h1>

          {/* Subline */}
          <p
            className={`text-lg md:text-xl text-slate-600 mb-10 max-w-lg mx-auto leading-relaxed transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            Marktwert, Rendite, Sanierungskosten & Risikoanalyse – alles in einem Report.
          </p>

          {/* Search Bar */}
          <div
            className={`flex flex-col sm:flex-row items-center gap-3 p-2 rounded-2xl max-w-xl mx-auto bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xl shadow-slate-200/20 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <div className="relative flex-1 w-full">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Adresse eingeben, z.B. Musterstraße 1, Berlin"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-12 h-14 bg-transparent text-slate-900 border-0 placeholder:text-slate-400 focus-visible:ring-0 text-base w-full"
              />
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              size="lg"
              className="h-14 px-8 w-full sm:w-auto bg-emerald-500 text-white hover:bg-emerald-600 font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Jetzt bewerten
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>

          {/* Trust Pills */}
          <div
            className={`mt-10 flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm text-slate-500 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>ImmoWertV 2024</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>DSGVO-konform</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>100% kostenlos</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
