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
    <footer className="border-t border-border/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <ProplyticsLogo size="sm" />
            <p className="mt-4 max-w-xs text-xs leading-relaxed text-muted-foreground">
              KI-gestuetzte Immobilienbewertung nach ImmoWertV 2024. Professionell, schnell, DSGVO-konform.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Produkt</h4>
            <nav className="flex flex-col gap-2.5">
              {productLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="mb-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Community</h4>
            <nav className="flex flex-col gap-2.5">
              {communityLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="mb-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Rechtliches</h4>
            <nav className="flex flex-col gap-2.5">
              {legalLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-10 border-t border-border/50 pt-6 text-center text-xs text-muted-foreground/60">
          {"© " + new Date().getFullYear() + " proplytics.de"}
        </div>
      </div>
    </footer>
  )
}
