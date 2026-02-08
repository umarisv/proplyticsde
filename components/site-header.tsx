"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  TrendingUp,
  Menu,
  X,
  BarChart3,
  BookOpen,
  Users,
  ShoppingBag,
  GraduationCap,
  LayoutDashboard,
} from "lucide-react"

const navLinks = [
  { href: "/analyse", label: "Analyse", icon: BarChart3 },
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/community", label: "Community", icon: Users },
  { href: "/portal/marktplatz", label: "Marktplatz", icon: ShoppingBag },
  { href: "/portal/academy", label: "Academy", icon: GraduationCap },
  { href: "/portal", label: "Portal", icon: LayoutDashboard },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight font-sans">proplytics.de</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            Anmelden
          </Link>
          <Link
            href="/register"
            className="inline-flex h-9 items-center rounded-lg bg-emerald-500 px-4 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
          >
            Kostenlos starten
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary lg:hidden"
            aria-label="Menue oeffnen"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 pb-4 pt-2 lg:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2 text-center text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              Anmelden
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
