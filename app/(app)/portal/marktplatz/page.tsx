"use client"

import { PartnerList } from "@/components/modules/portal/marketplace/PartnerList"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, ShieldCheck, Hammer, Building, ArrowRight } from "lucide-react"

export default function MarktplatzPage() {
  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Header Section */}
      <section className="bg-white border-b py-12 px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-none">Dienstleister-Marktplatz</Badge>
              <h1 className="text-4xl font-bold tracking-tight">Handverlesene Partner</h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Wir arbeiten nur mit den besten Dienstleistern zusammen. Profitieren Sie von unserem Netzwerk und erhalten Sie bevorzugte Angebote.
              </p>
            </div>
            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-sm">Proplytics-Garantie</p>
                <p className="text-xs text-muted-foreground">Alle Partner sind manuell geprüft.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Suchen nach Gewerk, Region oder Partner..." className="pl-9 h-11" />
            </div>
            <div className="relative w-full sm:w-48">
              <Input placeholder="PLZ eingeben" className="h-11" />
            </div>
            <Button className="h-11 px-8">Finden</Button>
            <Button variant="outline" className="h-11 gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 gap-12">
          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-between group hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer">
              <div className="space-y-1">
                <h3 className="text-xl font-bold">Handwerker</h3>
                <p className="text-sm opacity-70">Maler, Sanitär, Elektro, etc.</p>
              </div>
              <Hammer className="w-12 h-12 opacity-20 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-between group hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer">
              <div className="space-y-1">
                <h3 className="text-xl font-bold">Hausverwaltung</h3>
                <p className="text-sm opacity-70">A-Z Verwaltung, SEV, etc.</p>
              </div>
              <Building className="w-12 h-12 opacity-20 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Partners Section */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Empfohlene Partner</h2>
              <Button variant="link" className="gap-2">
                Alle anzeigen
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <PartnerList />
          </div>

          {/* Info Banner */}
          <div className="bg-primary rounded-3xl p-10 text-primary-foreground relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-6">
              <h2 className="text-3xl font-bold">Sie sind selbst Dienstleister?</h2>
              <p className="text-lg opacity-90">
                Werden Sie Teil unseres exklusiven Netzwerks und erhalten Sie Zugang zu qualifizierten Anfragen von Immobilieninvestoren.
              </p>
              <Button variant="secondary" size="lg" className="font-bold">
                Jetzt Partner werden
              </Button>
            </div>
            <div className="absolute top-0 right-0 w-1/3 h-full bg-white/10 -skew-x-12 translate-x-1/2" />
          </div>
        </div>
      </main>
    </div>
  )
}
