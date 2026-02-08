import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  GraduationCap,
  Store,
  ArrowRight,
  FileText,
  Plus,
  TrendingUp,
  Clock,
  Calendar,
  PlayCircle,
  BarChart3,
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

function isRecent(dateStr: string | null): boolean {
  if (!dateStr) return false
  const diff = Date.now() - new Date(dateStr).getTime()
  return diff < 5 * 60 * 1000 // 5 minutes
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
  const { data: { user } } = await supabase.auth.getUser()

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
  const recentBewertungen = bewertungen.slice(0, 3)

  return (
    <div className="bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {user?.user_metadata?.name
                ? `Hallo, ${user.user_metadata.name.split(" ")[0]}`
                : "Willkommen im Portal"}
            </h1>
            <p className="text-muted-foreground">
              {totalCount > 0
                ? `Sie haben ${totalCount} ${totalCount === 1 ? "Bewertung" : "Bewertungen"} gespeichert.`
                : "Starten Sie Ihre erste KI-gestuetzte Immobilienanalyse."}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Live-Call buchen
            </Button>
            <Button asChild className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/analyse">
                <Plus className="h-4 w-4" />
                Neue Analyse
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Bewertete Objekte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{totalCount}</p>
                  <p className="text-xs text-muted-foreground">
                    {totalCount === 0 ? "Starten Sie Ihre erste Analyse" : "Gespeicherte Bewertungen"}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Building2 className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Portfolio-Wert (Est.)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    {portfolioWert > 0 ? formatCurrency(portfolioWert, { compact: true }) : "--"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {portfolioWert > 0 ? "Summierte Marktwerte" : "Noch keine Bewertungen"}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Durchschnittl. Marktwert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    {totalCount > 0 ? formatCurrency(portfolioWert / totalCount, { compact: true }) : "--"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {totalCount > 0 ? "Pro Objekt" : "Noch keine Daten"}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <BarChart3 className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Sections */}
        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Academy Preview */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <GraduationCap className="h-5 w-5 text-primary" />
                Academy
              </h2>
              <Link
                href="/academy"
                className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
              >
                Alle Kurse <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-12 w-16 shrink-0 overflow-hidden rounded bg-secondary">
                    <img
                      src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&auto=format&fit=crop&q=60"
                      className="h-full w-full object-cover"
                      alt="Investment Masterclass"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">
                      Immobilien-Investment Masterclass
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Renditeberechnung, Finanzierung & Steuern
                    </p>
                  </div>
                  <Button size="icon" variant="ghost" asChild className="shrink-0">
                    <Link href="/academy">
                      <PlayCircle className="h-5 w-5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-amber-500">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-500">
                      Naechster Live-Call
                    </p>
                    <p className="text-sm font-medium">
                      {"Q&A mit Coach Marcus (Steuer-Spezial)"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Jeden Mittwoch, 19:00 Uhr
                    </p>
                  </div>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Teilnehmen
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Marketplace Preview */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Store className="h-5 w-5 text-primary" />
                Dienstleistungen
              </h2>
              <Link
                href="/marktplatz"
                className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
              >
                Marktplatz <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <Card className="border-2 border-dashed border-border">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Plus className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-bold">Dienstleister anfragen</p>
                  <p className="text-xs text-muted-foreground">
                    Finden Sie passende Partner fuer Ihre Objekte.
                  </p>
                  <Button variant="outline" size="sm" asChild className="mt-3">
                    <Link href="/marktplatz">Partner finden</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Recent Evaluations */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Zuletzt bewertete Objekte</h2>
            {totalCount > 3 && (
              <Link
                href="/portal/bewertungen"
                className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
              >
                Alle anzeigen <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          {recentBewertungen.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Building2 className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-lg font-semibold">Noch keine Bewertungen</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Starten Sie Ihre erste KI-gestuetzte Immobilienanalyse.
                  </p>
                </div>
                <Button asChild className="mt-2 gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/analyse">
                    <Plus className="h-4 w-4" />
                    Erste Analyse starten
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentBewertungen.map((b) => {
                const marktwert = getMarktwert(b)
                const fresh = isRecent(b.created_at)
                return (
                  <Card
                    key={b.id}
                    className={cn(
                      "transition-colors hover:border-primary/20",
                      fresh && "border-primary/30 ring-1 ring-primary/10"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-bold">
                              {b.adresse ?? `${b.plz} ${b.stadt}`}
                            </p>
                            {fresh && (
                              <Badge className="shrink-0 bg-primary/10 text-primary text-[10px] px-1.5 py-0">
                                Neu
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">
                            {getObjektLabel(b.objekttyp)}
                          </p>
                        </div>
                        {marktwert > 0 && (
                          <Badge variant="outline" className="ml-2 shrink-0 text-xs">
                            {formatCurrency(marktwert, { compact: true })}
                          </Badge>
                        )}
                      </div>
                      <div className="mb-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {b.wohnflaeche && <span>{b.wohnflaeche} m2</span>}
                        {b.baujahr && <span>Bj. {b.baujahr}</span>}
                        {b.created_at && <span>{formatDate(b.created_at)}</span>}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 flex-1 gap-1 text-xs"
                          asChild
                        >
                          <Link href={`/analyse?id=${b.id}`}>
                            <FileText className="h-3 w-3" /> Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
