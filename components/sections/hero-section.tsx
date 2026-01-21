"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, ArrowRight, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { HeroBackground } from "./hero-background"

export function HeroSection() {
  const [address, setAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

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
          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-black mb-5">
            Analysiere eine Immobilie
          </h1>
          
          {/* Subline */}
          <p className="text-lg text-black/50 mb-12 max-w-md mx-auto leading-relaxed">
            KI-gestützte Wertermittlung, Sanierungskosten & Wirtschaftlichkeit.
          </p>

          {/* Search Bar */}
          <div className="flex items-center gap-2 p-2 rounded-2xl max-w-xl mx-auto bg-black/5 border border-black/10">
            <div className="relative flex-1">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/30" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Adresse eingeben..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-12 h-12 bg-transparent text-black border-0 placeholder:text-black/30 focus-visible:ring-0 text-base"
              />
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              size="lg"
              className="h-12 px-6 bg-black text-white hover:bg-black/90 font-medium rounded-xl transition-colors"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Jetzt bewerten
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* Trust Pills */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-black/50">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-emerald-500" />
              <span>ImmoWertV 2024</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-emerald-500" />
              <span>DSGVO-konform</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-emerald-500" />
              <span>Kostenlos & Anonym</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
