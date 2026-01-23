"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, ArrowRight, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function FinalCTA() {
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
    <section className="py-16 md:py-24 bg-white border-t border-black/5">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Header */}
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-black mb-4">
            Starte jetzt – Adresse reicht.
          </h2>
          <p className="text-black/60 text-lg mb-12">
            Erhalten Sie eine professionelle Werteinschätzung.
          </p>

          {/* Search Bar */}
          <div className="flex items-center gap-2 p-2 rounded-2xl max-w-xl mx-auto bg-black/5 border border-black/10">
            <div className="relative flex-1">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Adresse eingeben..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-12 h-12 bg-transparent text-black border-0 placeholder:text-black/40 focus-visible:ring-0 text-base"
              />
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              size="lg"
              className="h-12 px-6 bg-emerald-500 text-white hover:bg-emerald-600 font-medium rounded-xl transition-colors"
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

          {/* Hint */}
          <p className="mt-8 text-black/40 text-sm">
            Dauer: ~60 Sekunden
          </p>
        </div>
      </div>
    </section>
  )
}
