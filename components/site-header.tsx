"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { ProplyticsLogo } from "@/components/proplytics-logo"

const navLinks = [
  { href: "/analyse", label: "Analyse" },
  { href: "/portal", label: "Portal" },
  { href: "/portal/marktplatz", label: "Marktplatz" },
  { href: "/portal/academy", label: "Academy" },
  { href: "/blog", label: "Blog" },
  { href: "/community", label: "Community" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <ProplyticsLogo size="sm" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-lg px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            Anmelden
          </Link>
          <Link
            href="/register"
            className="inline-flex h-8 items-center rounded-lg bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Kostenlos starten
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary md:hidden"
            aria-label="Menu oeffnen"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-border/40 bg-background px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-0.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
            <div className="mt-2 border-t border-border/40 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground"
              >
                Anmelden
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
