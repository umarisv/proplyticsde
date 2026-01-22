"use client"

import { CourseList } from "@/components/modules/portal/academy/CourseList"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Users, Calendar, ArrowRight, PlayCircle } from "lucide-react"
import Link from "next/link"

export default function AcademyPage() {
  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <Badge className="bg-primary-foreground/20 text-primary-foreground border-none px-4 py-1">
              Proplytics Academy
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Meistern Sie den Immobilienmarkt mit Expertenwissen
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto md:mx-0">
              Von der ersten Bewertung bis zur komplexen Steuerstrategie. Wir begleiten Sie auf Ihrem Weg zum erfolgreichen Investor.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
              <Button size="lg" variant="secondary" className="gap-2">
                Jetzt starten
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10 gap-2">
                <Calendar className="w-4 h-4" />
                Live-Calls ansehen
              </Button>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-8 pt-4 opacity-80 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>2.500+ Studenten</span>
              </div>
              <div className="flex items-center gap-2">
                <PlayCircle className="w-4 h-4" />
                <span>45+ Stunden Video</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                <span>Zertifikate</span>
              </div>
            </div>
          </div>
          <div className="w-full max-w-sm aspect-square bg-primary-foreground/10 rounded-3xl backdrop-blur-3xl border border-primary-foreground/20 hidden lg:block" />
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 -mt-8">
        <div className="grid grid-cols-1 gap-12">
          {/* Courses Section */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Aktuelle Kurse</h2>
                <p className="text-muted-foreground">Wählen Sie das passende Thema für Ihren Fortschritt</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Alle Kurse</Button>
                <Button variant="outline" size="sm">Investment</Button>
                <Button variant="outline" size="sm">Steuern</Button>
              </div>
            </div>
            <CourseList />
          </div>

          {/* Coaching Banner */}
          <div className="bg-card border rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
            <div className="space-y-4 text-center md:text-left">
              <Badge className="bg-primary/10 text-primary border-none">1:1 Coaching</Badge>
              <h2 className="text-3xl font-bold">Persönliche Beratung durch Experten</h2>
              <p className="text-muted-foreground max-w-xl">
                Buchen Sie eine private Session mit unseren Coaches, um Ihre konkreten Deals oder Strategien zu besprechen. 
                Individuell, fokussiert und ergebnisorientiert.
              </p>
              <Button className="gap-2">
                Termin vereinbaren
                <Calendar className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex -space-x-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-16 h-16 rounded-full border-4 border-card bg-muted overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Coach" />
                </div>
              ))}
              <div className="w-16 h-16 rounded-full border-4 border-card bg-primary flex items-center justify-center text-primary-foreground font-bold">
                +4
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
