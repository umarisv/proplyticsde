"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Home, Euro, Percent, RefreshCw, Calculator, ChevronDown, ChevronUp } from "lucide-react"
import { CashFlowChart, ModernizationChart } from "@/components/charts"
import { LoadingState } from "@/components/ui/loading-state"
import { EmptyState } from "@/components/ui/empty-state"
import { formatCurrency, formatPercent } from "@/lib/format"
import type { AnalyseResultData } from "@/lib/types"

interface ResultsPanelProps {
  data?: AnalyseResultData | null
  onRecalculate: () => void
  isCalculating: boolean
}

export function ResultsPanel({ data, onRecalculate, isCalculating }: ResultsPanelProps) {
  const [showErtragswertDetails, setShowErtragswertDetails] = useState(false)
  const [showSachwertDetails, setShowSachwertDetails] = useState(false)

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
      <Card className="bg-primary/10 border-primary">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Geschätzter Marktwert</p>
            <p className="text-3xl font-bold text-primary">{formatCurrency(data.marktwert)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Spanne: {formatCurrency(data.marktwertMin)} - {formatCurrency(data.marktwertMax)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-card border-border">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calculator className="w-3 h-3" />
              <span className="text-xs">Faktor</span>
            </div>
            <p className="text-lg font-bold">{data.faktor.toFixed(1)}x</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Percent className="w-3 h-3" />
              <span className="text-xs">Brutto-Rendite</span>
            </div>
            <p className="text-lg font-bold text-primary">{formatPercent(data.bruttoRendite)}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Euro className="w-3 h-3" />
              <span className="text-xs">€/m²</span>
            </div>
            <p className="text-lg font-bold">{formatCurrency(data.qmPreis)}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs">Netto-Rendite</span>
            </div>
            <p className="text-lg font-bold">{formatPercent(data.nettoRendite)}</p>
          </CardContent>
        </Card>
      </div>

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
          <CashFlowChart />
        </CardContent>
      </Card>

      {/* Modernization Chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Modernisierungs-ROI</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <ModernizationChart />
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
