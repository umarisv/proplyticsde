"use client"

import { Button } from "@/components/ui/button"
import { Check, ArrowRight, FileText, TrendingUp, BarChart3 } from "lucide-react"

const benefits = [
  "Wertspanne mit Min/Max-Angabe",
  "Alle relevanten Kennzahlen auf einen Blick",
  "Empfehlung für nächste Schritte",
]

export function ReportPreview() {
  return (
    <section className="py-16 md:py-24 bg-white border-t border-black/5">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
          {/* Left - Text */}
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-black mb-4">
              Professioneller PDF Report
            </h2>
            <p className="text-black/60 text-lg mb-8 leading-relaxed">
              Ihr vollständiger Bewertungsbericht – sofort verfügbar, professionell aufbereitet.
            </p>
            
            <ul className="space-y-3 mb-8">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Check className="h-3 w-3 text-emerald-500" />
                  </div>
                  <span className="text-black/70 text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              variant="outline" 
              className="border-slate-200 text-slate-700 hover:bg-slate-50 bg-transparent rounded-xl"
            >
              Report Beispiel ansehen
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Right - Mockup */}
          <div className="relative">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              {/* Report header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <div className="text-black font-medium text-sm">Bewertungsreport</div>
                  <div className="text-black/50 text-xs">Musterstraße 123, Berlin</div>
                </div>
              </div>
              
              {/* Value display */}
              <div className="mb-6">
                <div className="text-black/50 text-xs uppercase tracking-wider mb-2">Geschätzter Marktwert</div>
                <div className="text-2xl font-semibold text-black">485.000 - 520.000 EUR</div>
              </div>
              
              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white border border-slate-100">
                  <TrendingUp className="h-4 w-4 text-emerald-500 mb-2" />
                  <div className="text-black/50 text-xs">Rendite p.a.</div>
                  <div className="text-black font-medium">4.2%</div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-black/10">
                  <BarChart3 className="h-4 w-4 text-blue-500 mb-2" />
                  <div className="text-black/50 text-xs">IRR (10J)</div>
                  <div className="text-black font-medium">6.8%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
