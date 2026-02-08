import Link from "next/link"
import { ProplyticsLogo } from "@/components/proplytics-logo"

const productLinks = [
  { href: "/analyse", label: "Analyse" },
  { href: "/portal", label: "Portal" },
  { href: "/portal/marktplatz", label: "Marktplatz" },
  { href: "/portal/academy", label: "Academy" },
]

const communityLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/community", label: "Community" },
]

const legalLinks = [
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/agb", label: "AGB" },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 bg-secondary/20">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <ProplyticsLogo size="sm" />
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              KI-gestuetzte Immobilienbewertung nach ImmoWertV 2024. Professionell, schnell, DSGVO-konform.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Produkt</h4>
            <nav className="flex flex-col gap-2">
              {productLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm text-foreground/70 transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Community */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Community</h4>
            <nav className="flex flex-col gap-2">
              {communityLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm text-foreground/70 transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rechtliches</h4>
            <nav className="flex flex-col gap-2">
              {legalLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm text-foreground/70 transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-8 border-t border-border/40 pt-6 text-center text-xs text-muted-foreground">
          {"© " + new Date().getFullYear() + " proplytics.de - Alle Rechte vorbehalten."}
        </div>
      </div>
    </footer>
  )
}
