"use client"

import { MapPin, MessageSquare, FileText } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: MapPin,
    title: "Adresse eingeben",
    description: "Einfach die Adresse Ihrer Immobilie eingeben.",
  },
  {
    number: "02",
    icon: MessageSquare,
    title: "Eckdaten bestätigen",
    description: "Unser Chatbot fragt kurz die wichtigsten Details ab.",
  },
  {
    number: "03",
    icon: FileText,
    title: "Ergebnis erhalten",
    description: "Sofort Wertermittlung + PDF Report zum Download.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-white">
      <div className="mx-auto w-full max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-black mb-4">
            So funktioniert's
          </h2>
          <p className="text-black/60 text-lg max-w-md mx-auto">
            In drei einfachen Schritten zur Immobilienbewertung.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-12 md:gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.title} className="relative text-center">
              {/* Connector line - desktop only */}
              {index < steps.length - 1 && (
                <div 
                  className="hidden md:block absolute top-8 left-[60%] w-full h-px bg-slate-200"
                />
              )}
              
              {/* Icon container */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 mb-6">
                <step.icon className="h-6 w-6 text-emerald-500" />
              </div>
              
              <h3 className="text-black font-medium text-lg mb-2">
                {step.title}
              </h3>
              <p className="text-black/60 text-sm leading-relaxed max-w-[200px] mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
