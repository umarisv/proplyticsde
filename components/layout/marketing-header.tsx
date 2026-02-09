"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, LayoutDashboard } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function MarketingHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  useEffect(() => {
    try {
      const supabase = createClient()
      if (!supabase) return
      
      supabase.auth.getSession().then(({ data: { session } }) => {
        setIsLoggedIn(!!session)
      }).catch(() => {})
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsLoggedIn(!!session)
      })
      
      return () => subscription.unsubscribe()
    } catch (e) {
      console.error("[v0] MarketingHeader auth error:", e)
    }
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="absolute inset-0 bg-card/80 backdrop-blur-xl border-b border-border" />
      <div className="relative mx-auto w-full max-w-6xl px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform group-hover:scale-110">
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
          <span className="text-base font-semibold tracking-tight text-foreground">
            Proplytics
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Blog
          </Link>
          <Link href="/portal/academy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Academy
          </Link>
          <Link href="/portal/marktplatz" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Marktplatz
          </Link>
          <Link href="/community" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Community
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Button
              size="sm"
              asChild
              className="bg-emerald-500 text-white hover:bg-emerald-600 rounded-full px-5 font-medium shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40"
            >
              <Link href="/portal" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Portal
              </Link>
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden sm:flex text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <Link href="/login">Anmelden</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="bg-emerald-500 text-white hover:bg-emerald-600 rounded-full px-5 font-medium shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40"
              >
                <Link href="/analyse" className="flex items-center gap-2">
                  Kostenlos starten
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
