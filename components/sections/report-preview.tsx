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
    <section className="py-16 md:py-24 bg-card border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
          {/* Left - Text */}
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-4">
              Professioneller PDF Report
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Ihr vollstaendiger Bewertungsbericht - sofort verfuegbar, professionell aufbereitet.
            </p>
            
            <ul className="space-y-3 mb-8">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-muted-foreground text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              variant="outline" 
              className="rounded-xl"
            >
              Report Beispiel ansehen
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Right - Mockup */}
          <div className="relative">
            <div className="p-6 rounded-2xl bg-secondary border border-border">
              {/* Report header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-foreground font-medium text-sm">Bewertungsreport</div>
                  <div className="text-muted-foreground text-xs">Musterstrasse 123, Berlin</div>
                </div>
              </div>
              
              {/* Value display */}
              <div className="mb-6">
                <div className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Geschaetzter Marktwert</div>
                <div className="text-2xl font-semibold text-foreground">485.000 - 520.000 EUR</div>
              </div>
              
              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-card border border-border">
                  <TrendingUp className="h-4 w-4 text-primary mb-2" />
                  <div className="text-muted-foreground text-xs">Rendite p.a.</div>
                  <div className="text-foreground font-medium">4.2%</div>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border">
                  <BarChart3 className="h-4 w-4 text-chart-2 mb-2" />
                  <div className="text-muted-foreground text-xs">IRR (10J)</div>
                  <div className="text-foreground font-medium">6.8%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
