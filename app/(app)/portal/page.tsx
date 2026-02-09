import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  GraduationCap,
  Store,
  ArrowRight,
  ArrowUpRight,
  Plus,
  TrendingUp,
  BarChart3,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"
import { formatCurrency, formatDate } from "@/lib/format"
import type { Bewertung } from "@/lib/database.types"
import type { AnalyseResultData } from "@/lib/types"

function getMarktwert(bewertung: Bewertung): number {
  const ergebnisse = bewertung.ergebnisse as unknown as AnalyseResultData | null
  return ergebnisse?.marktwert ?? 0
}

function getObjektLabel(typ: string | null): string {
  const labels: Record<string, string> = {
    mfh: "Mehrfamilienhaus",
    zfh: "Zweifamilienhaus",
    efh: "Einfamilienhaus",
    etw: "Eigentumswohnung",
    wgh: "Wohn-/Geschaeftshaus",
  }
  return labels[typ ?? ""] ?? typ ?? "Immobilie"
}

export default async function PortalDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let bewertungen: Bewertung[] = []
  let totalCount = 0

  if (user) {
    const { data, count } = await supabase
      .from("bewertungen")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .eq("status", "aktiv")
      .order("created_at", { ascending: false })
      .limit(6)

    bewertungen = (data ?? []) as Bewertung[]
    totalCount = count ?? 0
  }

  const portfolioWert = bewertungen.reduce((sum, b) => sum + getMarktwert(b), 0)
  const recentBewertungen = bewertungen.slice(0, 4)
  const firstName = user?.user_metadata?.name?.split(" ")[0] ?? null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Hero Header */}
        <section className="mb-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Willkommen zurueck</p>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-balance">
                {firstName ? `${firstName}'s Portfolio` : "Ihr Investment-Portal"}
              </h1>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <Link href="/academy">
                  <GraduationCap className="h-4 w-4" />
                  Academy
                </Link>
              </Button>
              <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <Link href="/analyse">
                  <Plus className="h-4 w-4" />
                  Neue Analyse
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Row */}
        <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/20 hover:shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Objekte</p>
                <p className="mt-2 text-4xl font-bold tabular-nums">{totalCount}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {totalCount === 0 ? "Noch keine Bewertungen" : "Bewertete Immobilien"}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/20 hover:shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Portfolio-Wert</p>
                <p className="mt-2 text-4xl font-bold tabular-nums">
                  {portfolioWert > 0 ? formatCurrency(portfolioWert, { compact: true }) : "--"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {portfolioWert > 0 ? "Summierte Marktwerte" : "Noch keine Daten"}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/20 hover:shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Durchschnitt</p>
                <p className="mt-2 text-4xl font-bold tabular-nums">
                  {totalCount > 0 ? formatCurrency(portfolioWert / totalCount, { compact: true }) : "--"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {totalCount > 0 ? "Pro Objekt" : "Noch keine Daten"}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>
          </div>
        </section>

        {/* Bewertungen + Sidebar */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* Main: Bewertungen */}
          <section className="lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">Ihre Objekte</h2>
              {totalCount > 4 && (
                <Link href="/portal/bewertungen" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  Alle anzeigen <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            {recentBewertungen.length === 0 ? (
              <div className="flex flex-col items-center gap-5 rounded-2xl border-2 border-dashed border-border bg-card px-6 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-lg font-semibold">Starten Sie Ihre erste Analyse</p>
                  <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
                    Geben Sie PLZ, Objekttyp und Eckdaten ein - unsere KI berechnet Marktwert, Rendite und Risiko in Sekunden.
                  </p>
                </div>
                <Button asChild className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/analyse">
                    <Plus className="h-4 w-4" /> Analyse starten
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {recentBewertungen.map((b) => {
                  const marktwert = getMarktwert(b)
                  return (
                    <Link
                      key={b.id}
                      href={`/analyse?id=${b.id}`}
                      className={cn(
                        "group relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-5",
                        "transition-all hover:border-primary/30 hover:shadow-md"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <p className="truncate text-sm font-semibold">
                              {b.adresse ?? `${b.plz} ${b.stadt}`}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {getObjektLabel(b.objekttyp)}
                          </p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>

                      {marktwert > 0 && (
                        <p className="text-xl font-bold tabular-nums text-primary">
                          {formatCurrency(marktwert, { compact: true })}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                        {b.wohnflaeche && (
                          <Badge variant="secondary" className="text-[11px] font-normal rounded-lg px-2 py-0.5">
                            {b.wohnflaeche} m2
                          </Badge>
                        )}
                        {b.baujahr && (
                          <Badge variant="secondary" className="text-[11px] font-normal rounded-lg px-2 py-0.5">
                            Bj. {b.baujahr}
                          </Badge>
                        )}
                        {b.created_at && (
                          <Badge variant="secondary" className="text-[11px] font-normal rounded-lg px-2 py-0.5">
                            {formatDate(b.created_at)}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>

          {/* Sidebar: Quick Links */}
          <aside className="flex flex-col gap-5">

            {/* Academy Card */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold">Academy</h3>
                </div>
                <Link href="/academy" className="text-xs font-medium text-primary hover:underline">
                  Alle Kurse
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
                  <div className="h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-secondary">
                    <img
                      src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&auto=format&fit=crop&q=60"
                      className="h-full w-full object-cover"
                      alt="Masterclass"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold">Investment Masterclass</p>
                    <p className="text-[11px] text-muted-foreground">Rendite, Finanzierung & Steuern</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-primary uppercase tracking-wider">Naechster Live-Call</p>
                    <p className="text-xs text-foreground">Mi, 19:00 Uhr</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Marketplace Card */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Store className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold">Dienstleistungen</h3>
                </div>
                <Link href="/marktplatz" className="text-xs font-medium text-primary hover:underline">
                  Marktplatz
                </Link>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Finden Sie passende Partner fuer Finanzierung, Verwaltung und Sanierung.
              </p>
              <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                <Link href="/marktplatz">
                  <Store className="h-3.5 w-3.5" />
                  Partner finden
                </Link>
              </Button>
            </div>

            {/* Quick Action */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Beratung buchen</p>
                  <p className="text-xs text-muted-foreground">30 Min. mit einem Experten</p>
                </div>
              </div>
              <Button size="sm" className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                Termin vereinbaren
              </Button>
            </div>

          </aside>
        </div>
      </div>
    </div>
  )
}
