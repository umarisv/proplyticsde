"use client"

import { Shield, Eye, Lock } from "lucide-react"

const trustPoints = [
  {
    icon: Shield,
    title: "DSGVO-konform",
    description: "Vollständige Einhaltung europäischer Datenschutzstandards.",
  },
  {
    icon: Eye,
    title: "Anonym nutzbar",
    description: "Keine Registrierung erforderlich – starten Sie sofort.",
  },
  {
    icon: Lock,
    title: "Keine Speicherung",
    description: "Ohne Account werden Ihre Daten nicht gespeichert.",
  },
]

export function TrustSection() {
  return (
    <section id="security" className="py-16 md:py-24 bg-white border-t border-black/5">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-black mb-4">
              Ihre Daten sind sicher
            </h2>
            <p className="text-black/60 text-lg">
              Datenschutz und Sicherheit haben für uns höchste Priorität.
            </p>
          </div>

          {/* Trust points */}
          <div className="grid md:grid-cols-3 gap-10">
            {trustPoints.map((point) => (
              <div key={point.title} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-black/5 border border-black/10 mb-4">
                  <point.icon className="h-5 w-5 text-black/70" />
                </div>
                <h3 className="text-black font-medium mb-2">
                  {point.title}
                </h3>
                <p className="text-black/60 text-sm leading-relaxed">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
