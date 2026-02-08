"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Home, Euro, Percent, RefreshCw, Calculator, ChevronDown, ChevronUp, AlertTriangle, Shield } from "lucide-react"
import { CashFlowChart, ModernizationChart } from "@/components/charts"
import { RiskDistributionChart } from "@/components/charts/risk-distribution-chart"
import { RiskGauge } from "@/components/charts/risk-gauge"
import { LoadingState } from "@/components/ui/loading-state"
import { EmptyState } from "@/components/ui/empty-state"
import { formatCurrency, formatPercent } from "@/lib/format"
import { analyzeRisk, type RiskAnalysisResult } from "@/lib/risk-engine"
import type { AnalyseResultData, AnalyseFormData } from "@/lib/types"

interface ResultsPanelProps {
  data?: AnalyseResultData | null
  formData?: AnalyseFormData
  onRecalculate: () => void
  isCalculating: boolean
}

export function ResultsPanel({ data, formData, onRecalculate, isCalculating }: ResultsPanelProps) {
  const [showErtragswertDetails, setShowErtragswertDetails] = useState(false)
  const [showSachwertDetails, setShowSachwertDetails] = useState(false)
  const [showRiskAnalysis, setShowRiskAnalysis] = useState(false)

  // Risikoanalyse berechnen
  const riskAnalysis = useMemo<RiskAnalysisResult | null>(() => {
    if (!data || !formData) return null
    try {
      return analyzeRisk(formData, data)
    } catch {
      return null
    }
  }, [data, formData])

  // Loading State
  if (isCalculating) {
    return (
      <div className="p-4 h-full">
        <LoadingState message="Bewertung wird berechnet..." />
      </div>
    )
  }

  // Empty State
  if (!data) {
    return (
      <div className="p-4 h-full">
        <EmptyState
          icon={Calculator}
          title="Keine Bewertung vorhanden"
          description="Führen Sie den Chat-Wizard durch, um eine Immobilienbewertung zu erhalten."
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto custom-scrollbar">
      <Card className="relative overflow-hidden border-primary bg-primary/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
        <CardContent className="relative p-5">
          <div className="text-center">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-primary/70">Geschaetzter Marktwert</p>
            <p className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">{formatCurrency(data.marktwert)}</p>
            <div className="mx-auto mt-3 flex max-w-xs items-center justify-between rounded-lg bg-background/60 px-4 py-2 text-xs">
              <div className="text-center">
                <p className="text-muted-foreground">Min</p>
                <p className="font-semibold">{formatCurrency(data.marktwertMin)}</p>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="text-center">
                <p className="text-muted-foreground">Marktwert</p>
                <p className="font-semibold text-primary">{formatCurrency(data.marktwert)}</p>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="text-center">
                <p className="text-muted-foreground">Max</p>
                <p className="font-semibold">{formatCurrency(data.marktwertMax)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: Calculator, label: "Faktor", value: `${data.faktor.toFixed(1)}x`, accent: false },
          { icon: Percent, label: "Brutto-Rendite", value: formatPercent(data.bruttoRendite), accent: true },
          { icon: Euro, label: "Preis/m\u00B2", value: formatCurrency(data.qmPreis), accent: false },
          { icon: TrendingUp, label: "Netto-Rendite", value: formatPercent(data.nettoRendite), accent: true },
        ].map((metric) => (
          <Card key={metric.label} className="border-border bg-card transition-colors hover:bg-accent/50">
            <CardContent className="p-3">
              <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">
                <metric.icon className="h-3 w-3" />
                <span className="text-xs">{metric.label}</span>
              </div>
              <p className={`text-lg font-bold ${metric.accent ? "text-primary" : ""}`}>{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Risikoanalyse Section */}
      {riskAnalysis && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowRiskAnalysis(!showRiskAnalysis)}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Risikoanalyse (Monte-Carlo)
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    riskAnalysis.riskCategory === 'niedrig' ? 'bg-green-500/10 text-green-600 border-green-500/30' :
                    riskAnalysis.riskCategory === 'moderat' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' :
                    riskAnalysis.riskCategory === 'erhöht' ? 'bg-orange-500/10 text-orange-600 border-orange-500/30' :
                    'bg-red-500/10 text-red-600 border-red-500/30'
                  }`}
                >
                  {riskAnalysis.riskCategory} ({riskAnalysis.overallRiskScore}/100)
                </Badge>
                {showRiskAnalysis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Quick Stats - immer sichtbar */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="p-2 bg-muted/50 rounded">
                <p className="text-muted-foreground">90% Konfidenz</p>
                <p className="font-semibold">
                  {formatCurrency(riskAnalysis.confidence90.min)} - {formatCurrency(riskAnalysis.confidence90.max)}
                </p>
              </div>
              <div className="p-2 bg-muted/50 rounded">
                <p className="text-muted-foreground">Variationskoeffizient</p>
                <p className="font-semibold">{(riskAnalysis.coefficientOfVariation * 100).toFixed(1)}%</p>
              </div>
            </div>
            
            {/* Expanded Risk Analysis */}
            {showRiskAnalysis && (
              <div className="space-y-4 pt-2 border-t">
                <RiskDistributionChart 
                  riskData={riskAnalysis} 
                  marktwert={data.marktwert}
                  kaufpreis={parseFloat(formData?.kaufpreis || '0')}
                />
                <RiskGauge riskData={riskAnalysis} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border">
        <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowErtragswertDetails(!showErtragswertDetails)}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Ertragswert: {formatCurrency(data.ertragswert)}
            </CardTitle>
            {showErtragswertDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </CardHeader>
        {showErtragswertDetails && (
          <CardContent className="pt-0 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jahresrohertrag:</span>
              <span>{formatCurrency(data.jahresrohertrag)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">- Bewirtschaftungskosten:</span>
              <span>{formatCurrency(data.bewirtschaftungskosten)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1">
              <span className="text-muted-foreground">= Reinertrag:</span>
              <span className="font-medium">{formatCurrency(data.reinertrag)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bodenwert:</span>
              <span>{formatCurrency(data.bodenwert)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">- Bodenwertverzinsung:</span>
              <span>{formatCurrency(data.bodenwertverzinsung)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1">
              <span className="text-muted-foreground">= Gebäudeertrag:</span>
              <span className="font-medium">{formatCurrency(data.gebaeudertrag)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Liegenschaftszins:</span>
              <span>{formatPercent(data.liegenschaftszins)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Restnutzungsdauer:</span>
              <span>{data.restnutzungsdauer} Jahre</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vervielfältiger:</span>
              <span>{data.vervielfaeltiger.toFixed(2)}</span>
            </div>
          </CardContent>
        )}
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowSachwertDetails(!showSachwertDetails)}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Home className="w-4 h-4" />
              Sachwert: {formatCurrency(data.sachwert)}
            </CardTitle>
            {showSachwertDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </CardHeader>
        {showSachwertDetails && (
          <CardContent className="pt-0 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bodenwert:</span>
              <span>{formatCurrency(data.bodenwert)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">NHK Basiswert:</span>
              <span>{formatCurrency(data.nhkBasiswert)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">- Alterswertminderung:</span>
              <span>{formatPercent(data.alterswertminderung)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">= Gebäudesachwert:</span>
              <span>{formatCurrency(data.gebaeudesachwert)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sachwertfaktor:</span>
              <span>{data.sachwertfaktor.toFixed(2)}</span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Potenzial Card */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Mietpotenzial</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">Ist-Miete</p>
              <p className="font-semibold">{formatCurrency(data.istMiete)}/a</p>
            </div>
            <div>
              <p className="text-muted-foreground">Marktmiete</p>
              <p className="font-semibold">{formatCurrency(data.marktMiete)}/a</p>
            </div>
            <div>
              <p className="text-muted-foreground">Potenzial</p>
              <p className={`font-semibold ${data.potenzial > 0 ? "text-green-500" : "text-red-500"}`}>
                {data.potenzial > 0 ? "+" : ""}
                {formatPercent(data.potenzial)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cash Flow Chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Cash Flow (10 Jahre)</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <CashFlowChart data={data || undefined} />
        </CardContent>
      </Card>

      {/* Modernization Chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Modernisierungs-ROI</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <ModernizationChart formData={formData} />
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Finanzierungsanalyse</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">Kaufpreis</p>
              <p className="font-semibold">{formatCurrency(data.kaufpreis)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Eigenkapital (20%)</p>
              <p className="font-semibold">{formatCurrency(data.eigenkapital)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Fremdkapital</p>
              <p className="font-semibold">{formatCurrency(data.fremdkapital)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Zins / Tilgung</p>
              <p className="font-semibold">
                {formatPercent(data.zinssatz)} / {formatPercent(data.tilgung)}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">Monatsrate</p>
              <p className="font-semibold text-primary">{formatCurrency(data.monatsrate)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Cashflow/Monat</p>
              <p className={`font-semibold ${data.cashflowMonat >= 0 ? "text-green-500" : "text-red-500"}`}>
                {data.cashflowMonat >= 0 ? "+" : ""}
                {formatCurrency(data.cashflowMonat)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Cashflow/Jahr</p>
              <p className={`font-semibold ${data.cashflowJahr >= 0 ? "text-green-500" : "text-red-500"}`}>
                {data.cashflowJahr >= 0 ? "+" : ""}
                {formatCurrency(data.cashflowJahr)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">EK-Rendite</p>
              <p className="font-semibold text-primary">{formatPercent(data.eigenkapitalrendite)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recalculate Button */}
      <Button
        className="w-full"
        onClick={onRecalculate}
        disabled={isCalculating}
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${isCalculating ? "animate-spin" : ""}`} />
        {isCalculating ? "Berechne..." : "Neu berechnen"}
      </Button>
    </div>
  )
}
