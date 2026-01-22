"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  LayoutDashboard,
  PlayCircle
} from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/ui/logo"
import { UserMenu } from "@/components/user-menu"

export default function PortalDashboardPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Portal Navigation */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo size="md" href="/" />
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/portal" className="text-sm font-bold text-primary border-b-2 border-primary pb-5 mt-5">Übersicht</Link>
            <Link href="/portal/academy" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Academy</Link>
            <Link href="/portal/marktplatz" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Marktplatz</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild className="hidden sm:flex">
            <Link href="https://dashboard.proplytics.de">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Altes Dashboard
            </Link>
          </Button>
          <UserMenu />
        </div>
      </header>

      <main className="container py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Willkommen im Proplytics Portal</h1>
            <p className="text-muted-foreground">Ihr zentraler Ort für alles rund um Ihre Immobilien.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              Live-Call buchen
            </Button>
            <Button asChild className="gap-2">
              <Link href="/analyse">
                <Plus className="w-4 h-4" />
                Neue Analyse
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats / Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Subscription Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-2xl font-bold">Pro Account</p>
                  <p className="text-xs opacity-80 italic">Verlängert sich am 15.02.2026</p>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-none">Aktiv</Badge>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>Bewertungen diesen Monat</span>
                  <span>12 / Unbegrenzt</span>
                </div>
                <Progress value={35} className="h-1 bg-white/20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Bewertete Objekte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-3xl font-bold">24</p>
                  <p className="text-xs text-muted-foreground">+3 im Vergleich zum Vormonat</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio-Wert (Est.)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-3xl font-bold">8,4 Mio €</p>
                  <p className="text-xs text-green-600 font-medium">+4,2% Marktwert-Steigerung</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Academy Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Lernfortschritt Academy
              </h2>
              <Button variant="link" asChild className="gap-1 p-0">
                <Link href="/portal/academy">Alle Kurse <ArrowRight className="w-4 h-4" /></Link>
              </Button>
            </div>
            <div className="grid gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-16 h-12 rounded bg-muted overflow-hidden shrink-0">
                    <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&auto=format&fit=crop&q=60" className="object-cover w-full h-full" alt="Course" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">Immobilien-Investment Masterclass</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={45} className="h-1 flex-1" />
                      <span className="text-[10px] font-bold text-muted-foreground shrink-0">45%</span>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="shrink-0" asChild>
                    <Link href="/portal/academy"><PlayCircle className="w-5 h-5" /></Link>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4 border-l-4 border-l-yellow-500">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider">Nächster Live-Call</p>
                    <p className="text-sm font-medium">Q&A mit Coach Marcus (Steuer-Spezial)</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Heute, 19:00 Uhr</p>
                  </div>
                  <Button size="sm">Teilnehmen</Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Marketplace Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" />
                Dienstleistungen
              </h2>
              <Button variant="link" asChild className="gap-1 p-0">
                <Link href="/portal/marktplatz">Marktplatz <ArrowRight className="w-4 h-4" /></Link>
              </Button>
            </div>
            <div className="grid gap-4">
              <Card className="border-dashed border-2">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold">Dienstleister anfragen</p>
                    <p className="text-xs text-muted-foreground">Finden Sie passende Handwerker oder Hausverwaltungen für Ihre Objekte.</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/portal/marktplatz">Partner finden</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Angebot erhalten</p>
                      <p className="text-[10px] text-muted-foreground">Maler-Meister Düsseldorf (Renovierung Objekt A)</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Details</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Recent Evaluations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Zuletzt bewertete Objekte</h2>
            <Button variant="link" asChild className="gap-1 p-0">
              <Link href="https://dashboard.proplytics.de">Alle anzeigen <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="group hover:border-primary/50 transition-colors">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-bold truncate">Musterstraße {i}23, Berlin</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Mehrfamilienhaus</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">350.000 €</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="flex-1 h-8 text-xs gap-1" asChild>
                      <Link href="/analyse">
                        <FileText className="w-3 h-3" /> Report
                      </Link>
                    </Button>
                    <Button size="sm" variant="ghost" className="flex-1 h-8 text-xs gap-1 border-primary/20 text-primary" asChild>
                      <Link href="/portal/bewertungen/some-id">
                        <Plus className="w-3 h-3" /> Bankmappe
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
