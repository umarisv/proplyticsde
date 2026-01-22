"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { 
  FileText, 
  MapPin, 
  Home, 
  Euro, 
  Percent, 
  TrendingUp, 
  CheckCircle2, 
  Circle, 
  Download, 
  Upload, 
  Calculator,
  ShieldCheck,
  Building2,
  Calendar
} from "lucide-react"
import { formatCurrency, formatPercent } from "@/lib/format"
import type { AnalyseResultData, AnalyseFormData } from "@/lib/types"

interface BankMappeProps {
  data: AnalyseResultData
  formData: AnalyseFormData
  onExportPDF: () => void
}

export function BankMappe({ data, formData, onExportPDF }: BankMappeProps) {
  const [ltv, setLtv] = useState(80)
  
  const loanAmount = data.marktwert * (ltv / 100)
  const equityNeeded = data.marktwert - loanAmount

  const documents = [
    { name: "Grundbuchauszug", status: "complete", category: "Rechtlich" },
    { name: "Flurkarte", status: "complete", category: "Rechtlich" },
    { name: "Energieausweis", status: "pending", category: "Technisch" },
    { name: "Mietwertgutachten / Mietverträge", status: "pending", category: "Wirtschaftlich" },
    { name: "Objektfotos (Innen/Außen)", status: "complete", category: "Technisch" },
    { name: "Wohnflächenberechnung", status: "pending", category: "Technisch" },
  ]

  const completionRate = Math.round((documents.filter(d => d.status === "complete").length / documents.length) * 100)

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finanzierungsmappe</h1>
          <p className="text-muted-foreground">Banken-Exposé für Ihre Immobilie</p>
        </div>
        <Button onClick={onExportPDF} className="gap-2">
          <Download className="w-4 h-4" />
          PDF Exportieren
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Property Summary */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Objektübersicht
                </CardTitle>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                  {formData.objekttyp.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Wohnfläche</p>
                  <p className="font-semibold">{formData.wohnflaeche} m²</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Grundstück</p>
                  <p className="font-semibold">{formData.grundstueck} m²</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Baujahr</p>
                  <p className="font-semibold">{formData.baujahr}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Zustand</p>
                  <p className="font-semibold capitalize">{formData.zustand}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Energieklasse</p>
                  <p className="font-semibold">{formData.energieeffizienz}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Einheiten</p>
                  <p className="font-semibold">{formData.anzahlWohnungen || "1"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                Wertermittlung (nach BelWertV)
              </CardTitle>
              <CardDescription>Berechnete Verfahren zur Plausibilisierung</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase">Ertragswert</span>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(data.ertragswert)}</p>
                  <Progress value={75} className="h-1" />
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Home className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase">Sachwert</span>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(data.sachwert)}</p>
                  <Progress value={65} className="h-1" />
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Euro className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase">Vergleichswert</span>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(data.marktwertMin)}</p>
                  <Progress value={80} className="h-1" />
                </div>
              </div>

              <div className="p-6 rounded-xl bg-primary text-primary-foreground space-y-4 shadow-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium opacity-90">Gutachterlicher Marktwert</span>
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{formatCurrency(data.marktwert)}</span>
                  <span className="text-sm opacity-80">inkl. Sicherheitspuffer</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Euro className="w-5 h-5 text-primary" />
                Beleihungs-Simulator
              </CardTitle>
              <CardDescription>Passen Sie die Finanzierungsstruktur an</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Beleihungsauslauf (LTV)</span>
                  <span className="font-bold">{ltv}%</span>
                </div>
                <Slider 
                  value={[ltv]} 
                  onValueChange={(vals) => setLtv(vals[0])} 
                  min={50} 
                  max={100} 
                  step={5}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Kreditsumme</p>
                  <p className="text-xl font-bold">{formatCurrency(loanAmount)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Eigenkapital</p>
                  <p className="text-xl font-bold">{formatCurrency(equityNeeded)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Key Metrics & Documents */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Wirtschaftlichkeit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-primary" />
                  <span className="text-sm">Netto-Rendite</span>
                </div>
                <span className="font-bold">{formatPercent(data.nettoRendite)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm">Kaufpreisfaktor</span>
                </div>
                <span className="font-bold">{data.faktor.toFixed(1)}x</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Euro className="w-4 h-4 text-primary" />
                  <span className="text-sm">Cashflow / Jahr</span>
                </div>
                <span className={`font-bold ${data.cashflowJahr >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(data.cashflowJahr)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Dokumenten-Check</CardTitle>
                <span className="text-sm font-bold text-primary">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {documents.map((doc, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm">
                    {doc.status === "complete" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className={doc.status === "complete" ? "font-medium" : "text-muted-foreground"}>
                        {doc.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{doc.category}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full gap-2 text-xs h-9">
                <Upload className="w-3 h-3" />
                Dokumente hochladen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
