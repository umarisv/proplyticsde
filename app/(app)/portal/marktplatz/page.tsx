"use client"

import { PartnerList } from "@/components/modules/portal/marketplace/PartnerList"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, ShieldCheck, Hammer, Building, ArrowRight, Sparkles } from "lucide-react"

export default function MarktplatzPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="border-b border-border bg-secondary/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">
                  Dienstleister-Marktplatz
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Handverlesene Partner
              </h1>
              <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
                Wir arbeiten nur mit den besten Dienstleistern zusammen. Profitieren Sie von unserem Netzwerk.
              </p>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold">Proplytics-Garantie</p>
                <p className="text-xs text-muted-foreground">
                  Alle Partner sind manuell geprueft.
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Suchen nach Gewerk, Region oder Partner..."
                className="h-11 pl-9"
              />
            </div>
            <Input placeholder="PLZ eingeben" className="h-11 w-full sm:w-48" />
            <Button className="h-11 bg-emerald-500 px-8 text-white hover:bg-emerald-600">
              Finden
            </Button>
            <Button variant="outline" className="h-11 gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {/* Categories */}
        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="group flex cursor-pointer items-center justify-between rounded-2xl border border-border bg-card p-6 transition-all hover:border-emerald-200 hover:shadow-md">
            <div>
              <h3 className="text-xl font-bold">Handwerker</h3>
              <p className="text-sm text-muted-foreground">
                Maler, Sanitaer, Elektro, etc.
              </p>
            </div>
            <Hammer className="h-12 w-12 text-muted-foreground/20 transition-colors group-hover:text-emerald-500" />
          </div>
          <div className="group flex cursor-pointer items-center justify-between rounded-2xl border border-border bg-card p-6 transition-all hover:border-emerald-200 hover:shadow-md">
            <div>
              <h3 className="text-xl font-bold">Hausverwaltung</h3>
              <p className="text-sm text-muted-foreground">
                A-Z Verwaltung, SEV, etc.
              </p>
            </div>
            <Building className="h-12 w-12 text-muted-foreground/20 transition-colors group-hover:text-emerald-500" />
          </div>
        </div>

        {/* Partners */}
        <div className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Empfohlene Partner</h2>
            <Button variant="ghost" className="gap-2 text-emerald-600 hover:text-emerald-700">
              Alle anzeigen
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <PartnerList />
        </div>

        {/* CTA Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-emerald-500 p-10 text-white">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl font-bold">Sie sind selbst Dienstleister?</h2>
            <p className="mt-4 text-lg opacity-90">
              Werden Sie Teil unseres exklusiven Netzwerks und erhalten Sie Zugang zu qualifizierten Anfragen von Immobilieninvestoren.
            </p>
            <Button className="mt-6 bg-white font-bold text-emerald-600 hover:bg-emerald-50">
              Jetzt Partner werden
            </Button>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 -skew-x-12 translate-x-1/2 bg-white/10" />
        </div>
      </div>
    </div>
  )
}
