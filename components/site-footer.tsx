import Link from "next/link"
import { TrendingUp, Building2 } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold font-sans">proplytics.de</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              KI-gestuetzte Immobilienbewertung fuer Profis und Privatpersonen.
            </p>
          </div>

          {/* Produkt */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">Produkt</h4>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/analyse" className="text-sm text-muted-foreground hover:text-foreground">
                  Analyse
                </Link>
              </li>
              <li>
                <Link href="/portal" className="text-sm text-muted-foreground hover:text-foreground">
                  Portal
                </Link>
              </li>
              <li>
                <Link href="/portal/marktplatz" className="text-sm text-muted-foreground hover:text-foreground">
                  Marktplatz
                </Link>
              </li>
              <li>
                <Link href="/portal/academy" className="text-sm text-muted-foreground hover:text-foreground">
                  Academy
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">Community</h4>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-sm text-muted-foreground hover:text-foreground">
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Rechtliches */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">Rechtliches</h4>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/impressum" className="text-sm text-muted-foreground hover:text-foreground">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="text-sm text-muted-foreground hover:text-foreground">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link href="/agb" className="text-sm text-muted-foreground hover:text-foreground">
                  AGB
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            {"© " + new Date().getFullYear() + " proplytics.de - Alle Rechte vorbehalten."}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>Made in Germany</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
