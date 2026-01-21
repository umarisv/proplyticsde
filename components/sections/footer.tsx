"use client"

import Link from "next/link"

const links = [
  { label: "Impressum", href: "/impressum" },
  { label: "Datenschutz", href: "/datenschutz" },
  { label: "AGB", href: "/agb" },
  { label: "Kontakt", href: "/kontakt" },
]

export function Footer() {
  return (
    <footer className="py-8 bg-white border-t border-black/5">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoGradientFooter" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#34D399" />
                </linearGradient>
              </defs>
              <path d="M16 2C10.477 2 6 6.477 6 12c0 7.5 10 18 10 18s10-10.5 10-18c0-5.523-4.477-10-10-10z" stroke="url(#logoGradientFooter)" strokeWidth="2.5" fill="none"/>
              <rect x="11" y="10" width="3" height="8" rx="1" fill="url(#logoGradientFooter)"/>
              <rect x="15.5" y="8" width="3" height="10" rx="1" fill="url(#logoGradientFooter)"/>
              <rect x="20" y="12" width="3" height="6" rx="1" fill="url(#logoGradientFooter)" opacity="0.7"/>
            </svg>
            <span className="text-sm text-black">
              Proplytics
            </span>
            <span className="text-black/40 text-sm ml-2">
              © {new Date().getFullYear()}
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-black/50 hover:text-black transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
