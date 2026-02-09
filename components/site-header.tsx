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
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="shrink-0 transition-opacity hover:opacity-80">
          <ProplyticsLogo size="sm" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-[13px] transition-colors ${
                  isActive
                    ? "font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-[13px] text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            Anmelden
          </Link>
          <Link
            href="/register"
            className="inline-flex h-8 items-center rounded-md border border-primary/50 bg-primary/10 px-4 text-[13px] font-medium text-primary transition-all hover:bg-primary/20"
          >
            Kostenlos starten
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground md:hidden"
            aria-label="Menu oeffnen"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/50 bg-background/95 px-4 pb-4 pt-2 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-0.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-md px-3 py-2.5 text-sm transition-colors ${
                    isActive ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
            <div className="mt-2 border-t border-border/50 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground"
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
