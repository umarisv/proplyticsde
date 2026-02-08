"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Building2,
  GraduationCap,
  Store,
  ArrowRight,
  FileText,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  PlayCircle,
} from "lucide-react"
import Link from "next/link"

export default function PortalDashboardPage() {
  return (
    <div className="bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Willkommen im Portal
            </h1>
            <p className="text-muted-foreground">
              Ihr zentraler Ort fuer alle Immobilien-Aktivitaeten.
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

        {/* Quick Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">
                Subscription Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">Pro Account</p>
                  <p className="text-xs opacity-80">
                    Verlaengert sich am 15.02.2026
                  </p>
                </div>
                <Badge className="border-none bg-white/20 text-white hover:bg-white/20">
                  Aktiv
                </Badge>
              </div>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs font-medium">
                  <span>Bewertungen diesen Monat</span>
                  <span>12 / Unbegrenzt</span>
                </div>
                <Progress value={35} className="h-1 bg-white/20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Bewertete Objekte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">24</p>
                  <p className="text-xs text-muted-foreground">
                    +3 zum Vormonat
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
                  <p className="text-3xl font-bold">8,4 Mio</p>
                  <p className="text-xs font-medium text-primary">
                    +4,2% Marktwert-Steigerung
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <TrendingUp className="h-6 w-6" />
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
                Lernfortschritt Academy
              </h2>
              <Link
                href="/portal/academy"
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
                    <div className="mt-1 flex items-center gap-2">
                      <Progress value={45} className="h-1 flex-1" />
                      <span className="shrink-0 text-xs font-bold text-muted-foreground">
                        45%
                      </span>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" asChild className="shrink-0">
                    <Link href="/portal/academy">
                      <PlayCircle className="h-5 w-5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-amber-500">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-500">
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
                      Heute, 19:00 Uhr
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
                href="/portal/marktplatz"
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
                    <Link href="/portal/marktplatz">Partner finden</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-emerald-100 text-primary">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Angebot erhalten</p>
                      <p className="text-xs text-muted-foreground">
                        Maler-Meister Duesseldorf (Renovierung Objekt A)
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Details
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
            <Link
              href="/portal/bewertungen"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
            >
              Alle anzeigen <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { addr: "Musterstrasse 123, Berlin", type: "Mehrfamilienhaus", price: "350.000" },
              { addr: "Beispielweg 45, Hamburg", type: "Eigentumswohnung", price: "220.000" },
              { addr: "Hauptstr. 7, Muenchen", type: "Einfamilienhaus", price: "580.000" },
            ].map((obj) => (
              <Card
                key={obj.addr}
                className="transition-colors hover:border-primary/20"
              >
                <CardContent className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <p className="truncate text-sm font-bold">{obj.addr}</p>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        {obj.type}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {obj.price} EUR
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 flex-1 gap-1 text-xs"
                      asChild
                    >
                      <Link href="/analyse">
                        <FileText className="h-3 w-3" /> Report
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 flex-1 gap-1 text-xs text-primary"
                      asChild
                    >
                      <Link href="/portal/bewertungen/some-id">
                        <Plus className="h-3 w-3" /> Bankmappe
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
