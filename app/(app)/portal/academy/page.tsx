"use client"

import { CourseList } from "@/components/modules/portal/academy/CourseList"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Users, Calendar, ArrowRight, PlayCircle, Sparkles } from "lucide-react"

export default function AcademyPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="border-b border-border bg-emerald-500 py-16 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-4 sm:px-6 md:flex-row">
          <div className="flex-1 text-center md:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
              <GraduationCap className="h-4 w-4" />
              <span className="text-sm font-medium">Proplytics Academy</span>
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
              Meistern Sie den Immobilienmarkt mit Expertenwissen
            </h1>
            <p className="mt-6 max-w-2xl text-xl opacity-90">
              Von der ersten Bewertung bis zur komplexen Steuerstrategie. Wir begleiten Sie auf Ihrem Weg zum erfolgreichen Investor.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
              <Button size="lg" className="gap-2 bg-white font-semibold text-emerald-600 hover:bg-emerald-50">
                Jetzt starten
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                <Calendar className="h-4 w-4" />
                Live-Calls ansehen
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-8 text-sm opacity-80 md:justify-start">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>2.500+ Studenten</span>
              </div>
              <div className="flex items-center gap-2">
                <PlayCircle className="h-4 w-4" />
                <span>45+ Stunden Video</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span>Zertifikate</span>
              </div>
            </div>
          </div>
          <div className="hidden aspect-square w-full max-w-sm rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl lg:block" />
        </div>
      </section>

      {/* Courses */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Aktuelle Kurse</h2>
              <p className="text-muted-foreground">
                Waehlen Sie das passende Thema fuer Ihren Fortschritt
              </p>
            </div>
            <div className="hidden gap-2 sm:flex">
              <Button variant="outline" size="sm">
                Alle Kurse
              </Button>
              <Button variant="outline" size="sm">
                Investment
              </Button>
              <Button variant="outline" size="sm">
                Steuern
              </Button>
            </div>
          </div>
        </div>
        <CourseList />

        {/* Coaching Banner */}
        <div className="mt-12 flex flex-col items-center justify-between gap-8 rounded-2xl border border-border bg-card p-8 shadow-sm md:flex-row">
          <div className="text-center md:text-left">
            <Badge className="mb-3 border-none bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              1:1 Coaching
            </Badge>
            <h2 className="text-3xl font-bold">
              Persoenliche Beratung durch Experten
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Buchen Sie eine private Session mit unseren Coaches, um Ihre
              konkreten Deals oder Strategien zu besprechen.
            </p>
            <Button className="mt-6 gap-2 bg-emerald-500 text-white hover:bg-emerald-600">
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
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-card bg-emerald-500 font-bold text-white">
              +4
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
