"use client"

import { CourseList } from "@/components/modules/portal/academy/CourseList"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Users, Calendar, ArrowRight, PlayCircle } from "lucide-react"
import { PageHero } from "@/components/page-hero"

export default function AcademyPage() {
  return (
    <div className="bg-background text-foreground">
      <PageHero
        badge="Proplytics Academy"
        badgeIcon={<GraduationCap className="h-4 w-4 text-primary" />}
        title="Meistern Sie den Immobilienmarkt"
        titleAccent="mit Expertenwissen"
        description="Von der ersten Bewertung bis zur komplexen Steuerstrategie. Wir begleiten Sie auf Ihrem Weg zum erfolgreichen Investor."
      >
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            Jetzt starten
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Live-Calls ansehen
          </Button>
        </div>
        <div className="mt-6 flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>2.500+ Studenten</span>
          </div>
          <div className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4 text-primary" />
            <span>45+ Stunden Video</span>
          </div>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span>Zertifikate</span>
          </div>
        </div>
      </PageHero>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Aktuelle Kurse</h2>
              <p className="text-muted-foreground">Waehlen Sie das passende Thema fuer Ihren Fortschritt</p>
            </div>
            <div className="hidden gap-2 sm:flex">
              <Button variant="outline" size="sm">Alle Kurse</Button>
              <Button variant="outline" size="sm">Investment</Button>
              <Button variant="outline" size="sm">Steuern</Button>
            </div>
          </div>
        </div>
        <CourseList />

        {/* Coaching Banner */}
        <div className="mt-12 flex flex-col items-center justify-between gap-8 rounded-2xl border border-border bg-card p-8 shadow-sm md:flex-row">
          <div className="text-center md:text-left">
            <Badge className="mb-3 border-none bg-primary/10 text-primary hover:bg-primary/10">
              1:1 Coaching
            </Badge>
            <h2 className="text-3xl font-bold">
              Persoenliche Beratung durch Experten
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Buchen Sie eine private Session mit unseren Coaches, um Ihre konkreten Deals oder Strategien zu besprechen.
            </p>
            <Button className="mt-6 gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              Termin vereinbaren
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex -space-x-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 w-16 overflow-hidden rounded-full border-4 border-card bg-secondary"
              >
                <img
                  src={`https://i.pravatar.cc/100?img=${i + 10}`}
                  alt={`Coach ${i}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-card bg-primary font-bold text-primary-foreground">
              +4
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
