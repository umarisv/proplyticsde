"use client"

import { PartnerList } from "@/components/modules/portal/marketplace/PartnerList"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Hammer, Building, ArrowRight, Store } from "lucide-react"
import { PageHero } from "@/components/page-hero"

export default function MarktplatzPage() {
  return (
    <div className="bg-background text-foreground">
      <PageHero
        badge="Dienstleister-Marktplatz"
        badgeIcon={<Store className="h-4 w-4 text-primary" />}
        title="Handverlesene"
        titleAccent="Partner"
        description="Wir arbeiten nur mit den besten Dienstleistern zusammen. Profitieren Sie von unserem Netzwerk."
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Search */}
        <div className="mb-10 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Suchen nach Gewerk, Region oder Partner..." className="h-11 pl-9" />
          </div>
          <Input placeholder="PLZ eingeben" className="h-11 w-full sm:w-48" />
          <Button className="h-11 bg-primary px-8 text-primary-foreground hover:bg-primary/90">Finden</Button>
          <Button variant="outline" className="h-11 gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Categories */}
        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="group flex cursor-pointer items-center justify-between rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/20 hover:shadow-md">
            <div>
              <h3 className="text-xl font-bold">Handwerker</h3>
              <p className="text-sm text-muted-foreground">Maler, Sanitaer, Elektro, etc.</p>
            </div>
            <Hammer className="h-12 w-12 text-muted-foreground/20 transition-colors group-hover:text-primary" />
          </div>
          <div className="group flex cursor-pointer items-center justify-between rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/20 hover:shadow-md">
            <div>
              <h3 className="text-xl font-bold">Hausverwaltung</h3>
              <p className="text-sm text-muted-foreground">A-Z Verwaltung, SEV, etc.</p>
            </div>
            <Building className="h-12 w-12 text-muted-foreground/20 transition-colors group-hover:text-primary" />
          </div>
        </div>

        {/* Partners */}
        <div className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Empfohlene Partner</h2>
            <Button variant="ghost" className="gap-2 text-primary hover:text-primary/80">
              Alle anzeigen
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <PartnerList />
        </div>

        {/* CTA Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-primary p-10 text-primary-foreground">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl font-bold">Sie sind selbst Dienstleister?</h2>
            <p className="mt-4 text-lg opacity-90">
              Werden Sie Teil unseres exklusiven Netzwerks und erhalten Sie Zugang zu qualifizierten Anfragen von Immobilieninvestoren.
            </p>
            <Button className="mt-6 bg-primary-foreground font-bold text-primary hover:bg-primary-foreground/90">
              Jetzt Partner werden
            </Button>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 -skew-x-12 translate-x-1/2 bg-primary-foreground/10" />
        </div>
      </div>
    </div>
  )
}
