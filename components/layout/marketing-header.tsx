"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function MarketingHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-b border-black/5" />
      <div className="relative mx-auto w-full max-w-6xl px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>
            </defs>
            <path d="M16 2C10.477 2 6 6.477 6 12c0 7.5 10 18 10 18s10-10.5 10-18c0-5.523-4.477-10-10-10z" stroke="url(#logoGradient)" strokeWidth="2.5" fill="none"/>
            <rect x="11" y="10" width="3" height="8" rx="1" fill="url(#logoGradient)"/>
            <rect x="15.5" y="8" width="3" height="10" rx="1" fill="url(#logoGradient)"/>
            <rect x="20" y="12" width="3" height="6" rx="1" fill="url(#logoGradient)" opacity="0.7"/>
          </svg>
          <span className="text-base font-semibold tracking-tight text-black">
            Proplytics
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            asChild
            className="text-black/70 hover:text-black hover:bg-black/5"
          >
            <Link href="/analyse">Analyse</Link>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            asChild
            className="text-black/70 hover:text-black hover:bg-black/5"
          >
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button 
            size="sm"
            asChild
            className="bg-black text-white hover:bg-black/90 rounded-full px-4 font-medium"
          >
            <Link href="/login">Anmelden</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
