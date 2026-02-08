"use client"

import { TrendingUp, PieChart, Wrench, MapPin, GitCompare, FileDown } from "lucide-react"

const features = [
  {
    icon: TrendingUp,
    title: "Marktwert Range",
    description: "Realistische Wertspanne basierend auf aktuellen Marktdaten.",
  },
  {
    icon: PieChart,
    title: "Rendite & IRR",
    description: "Sofortige Rentabilitätsanalyse für Investitionsentscheidungen.",
  },
  {
    icon: Wrench,
    title: "Sanierungsbedarf",
    description: "Kostenschätzung für notwendige Modernisierungen.",
  },
  {
    icon: MapPin,
    title: "Mietspiegel & Lage",
    description: "Lokale Marktindikatoren und Lagefaktoren im Überblick.",
  },
  {
    icon: GitCompare,
    title: "Vergleichsobjekte",
    description: "Ähnliche Immobilien in der Umgebung zum Vergleich.",
  },
  {
    icon: FileDown,
    title: "PDF Report",
    description: "Professioneller Report zum Download in einem Klick.",
  },
]

export function FeatureGrid() {
  return (
    <section id="features" className="py-16 md:py-24 bg-card border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-4">
            Alles was Sie brauchen
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Umfassende Analyse-Tools für fundierte Entscheidungen.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-sm transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 mb-4">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-foreground font-medium mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
