"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  Home,
  Euro,
  Percent,
  RefreshCw,
  Calculator,
  ChevronDown,
  ChevronUp,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MinusCircle,
} from "lucide-react"
import { CashFlowChart, ModernizationChart } from "@/components/charts"
import { RiskDistributionChart } from "@/components/charts/risk-distribution-chart"
import { RiskGauge } from "@/components/charts/risk-gauge"
import { LoadingState } from "@/components/ui/loading-state"
import { EmptyState } from "@/components/ui/empty-state"
import { formatCurrency, formatPercent } from "@/lib/format"
import { analyzeRisk, type RiskAnalysisResult } from "@/lib/risk-engine"
import type { AnalyseResultData, AnalyseFormData } from "@/lib/types"
import type { Ampel, InvestmentScore, DimensionScore } from "@/lib/investment-scoring"

interface ResultsPanelProps {
  data?: AnalyseResultData | null
  formData?: AnalyseFormData
  onRecalculate: () => void
  isCalculating: boolean
}

// ─── Ampel Color Helpers ────────────────────────────────────────────────

function ampelBg(a: Ampel) {
  return a === "gruen"
    ? "bg-emerald-500/10 border-emerald-500/30"
    : a === "gelb"
      ? "bg-amber-500/10 border-amber-500/30"
      : "bg-red-500/10 border-red-500/30"
}
function ampelText(a: Ampel) {
  return a === "gruen"
    ? "text-emerald-600"
    : a === "gelb"
      ? "text-amber-600"
      : "text-red-600"
}
function ampelBar(a: Ampel) {
  return a === "gruen"
    ? "bg-emerald-500"
    : a === "gelb"
      ? "bg-amber-500"
      : "bg-red-500"
}
function AmpelIcon({ ampel, className = "w-4 h-4" }: { ampel: Ampel; className?: string }) {
  if (ampel === "gruen") return <CheckCircle2 className={`${className} text-emerald-500`} />
  if (ampel === "gelb") return <MinusCircle className={`${className} text-amber-500`} />
  return <XCircle className={`${className} text-red-500`} />
}

// ─── Investment Score Card ──────────────────────────────────────────────

function InvestmentScoreCard({ score }: { score: InvestmentScore }) {
  const [expanded, setExpanded] = useState(true)
  const [showStress, setShowStress] = useState(false)

  console.log("[v0] InvestmentScoreCard render, expanded:", expanded)

  const empfehlungColor =
    score.empfehlung === "Go"
      ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
      : score.empfehlung === "Bedingt Go"
        ? "bg-amber-500/10 text-amber-700 border-amber-500/30"
        : "bg-red-500/10 text-red-700 border-red-500/30"

  const dims = Object.values(score.dimensionen) as DimensionScore[]

  const handleToggle = () => {
    console.log("[v0] InvestmentScore toggle clicked, current expanded:", expanded)
    setExpanded(prev => {
      console.log("[v0] InvestmentScore setting expanded from", prev, "to", !prev)
      return !prev
    })
  }

  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        className="relative z-10 w-full px-6 py-4 cursor-pointer text-left select-none hover:bg-muted/50 transition-colors"
        onClick={handleToggle}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleToggle(); } }}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Investment-Score
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={empfehlungColor}>
              {score.empfehlung} ({score.gesamtScore}/100)
            </Badge>
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-6 pb-4 space-y-4">
          {/* Deal-Killer Warnung */}
          {score.dealKillers.length > 0 && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                  {score.dealKillers.length} Deal-Killer
                </span>
              </div>
              <ul className="space-y-1.5">
                {score.dealKillers.map((dk, i) => (
                  <li key={i} className="text-xs text-red-600/90">
                    <span className="font-medium">{dk.label}:</span>{" "}
                    {dk.description}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Empfehlung */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            {score.empfehlungText}
          </p>

          {/* 6 Ampel-Dimensionen */}
          <div className="space-y-2">
            {dims.map((dim) => (
              <DimensionRow key={dim.label} dim={dim} maxScore={3} />
            ))}
          </div>

          {/* Kennzahlen-Grid */}
          <div className="pt-2 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
              Finanz-Kennzahlen
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <KennzahlRow label="DSCR" value={score.kennzahlen.dscr.toFixed(2)} good={score.kennzahlen.dscr >= 1.3} bad={score.kennzahlen.dscr < 1.0} />
              <KennzahlRow label="ICR" value={score.kennzahlen.icr.toFixed(2)} good={score.kennzahlen.icr >= 2.0} bad={score.kennzahlen.icr < 1.5} />
              <KennzahlRow label="LTV" value={`${Math.round(score.kennzahlen.ltv * 100)}%`} good={score.kennzahlen.ltv <= 0.7} bad={score.kennzahlen.ltv > 0.85} />
              <KennzahlRow label="Cash-on-Cash" value={`${score.kennzahlen.cashOnCash.toFixed(1)}%`} good={score.kennzahlen.cashOnCash >= 8} bad={score.kennzahlen.cashOnCash < 4} />
              <KennzahlRow label="Mietmultiplikator" value={`${score.kennzahlen.mietmultiplikator.toFixed(1)}x`} good={score.kennzahlen.mietmultiplikator <= 20} bad={score.kennzahlen.mietmultiplikator > 25} />
              <KennzahlRow label="Break-Even" value={`${Math.round(score.kennzahlen.breakEvenOccupancy * 100)}%`} good={score.kennzahlen.breakEvenOccupancy <= 0.75} bad={score.kennzahlen.breakEvenOccupancy > 0.85} />
            </div>
          </div>

          {/* Stress-Tests */}
          <div className="pt-2 border-t border-border">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowStress(!showStress); }}
              className="flex items-center justify-between w-full text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
            >
              Stress-Tests
              {showStress ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
            {showStress && (
              <div className="mt-2 space-y-1.5">
                {score.stressTests.map((st, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between text-xs p-2 rounded border ${ampelBg(st.status)}`}
                  >
                    <span className="font-medium">{st.label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={ampelText(st.status)}>
                        DSCR {st.stressedValue}
                      </span>
                      <AmpelIcon ampel={st.status} className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function DimensionRow({
  dim,
  maxScore,
}: {
  dim: DimensionScore
  maxScore: number
}) {
  const [open, setOpen] = useState(false)
  const pct = (dim.score / maxScore) * 100

  return (
    <div>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="flex w-full items-center gap-3 text-left group cursor-pointer"
      >
        <AmpelIcon ampel={dim.ampel} className="w-4 h-4 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-xs font-medium truncate">{dim.label}</span>
            <span className={`text-xs font-semibold ${ampelText(dim.ampel)}`}>
              {dim.score.toFixed(1)}/{maxScore}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${ampelBar(dim.ampel)}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </button>
      {open && (
        <ul className="mt-1 ml-7 space-y-0.5">
          {dim.details.map((d, i) => (
            <li key={i} className="text-[11px] text-muted-foreground">
              {d}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function KennzahlRow({
  label,
  value,
  good,
  bad,
}: {
  label: string
  value: string
  good: boolean
  bad: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`font-semibold ${
          bad ? "text-red-500" : good ? "text-emerald-600" : ""
        }`}
      >
        {value}
      </span>
    </div>
  )
}

// ─── Main ResultsPanel ──────────────────────────────────────────────────

export function ResultsPanel({
  data,
  formData,
  onRecalculate,
  isCalculating,
}: ResultsPanelProps) {
  const [showErtragswertDetails, setShowErtragswertDetails] = useState(false)
  const [showSachwertDetails, setShowSachwertDetails] = useState(false)
  const [showRiskAnalysis, setShowRiskAnalysis] = useState(false)

  const riskAnalysis = useMemo<RiskAnalysisResult | null>(() => {
    if (!data || !formData) return null
    try {
      return analyzeRisk(formData, data)
    } catch {
      return null
    }
  }, [data, formData])

  if (isCalculating) {
    return (
      <div className="p-4 h-full">
        <LoadingState message="Bewertung wird berechnet..." />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-4 h-full">
        <EmptyState
          icon={Calculator}
          title="Keine Bewertung vorhanden"
          description="Fuehren Sie den Chat-Wizard durch, um eine Immobilienbewertung zu erhalten."
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto custom-scrollbar">
      {/* Marktwert Card */}
      <Card className="relative overflow-hidden border-primary bg-primary/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
        <CardContent className="relative p-5">
          <div className="text-center">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-primary/70">
              Geschaetzter Marktwert
            </p>
            <p className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              {formatCurrency(data.marktwert)}
            </p>
            <div className="mx-auto mt-3 flex max-w-xs items-center justify-between rounded-lg bg-background/60 px-4 py-2 text-xs">
              <div className="text-center">
                <p className="text-muted-foreground">Min</p>
                <p className="font-semibold">
                  {formatCurrency(data.marktwertMin)}
                </p>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="text-center">
                <p className="text-muted-foreground">Marktwert</p>
                <p className="font-semibold text-primary">
                  {formatCurrency(data.marktwert)}
                </p>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="text-center">
                <p className="text-muted-foreground">Max</p>
                <p className="font-semibold">
                  {formatCurrency(data.marktwertMax)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment Score - Ampel Dashboard */}
      {data.investmentScore && (
        <InvestmentScoreCard score={data.investmentScore} />
      )}

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
              <p className={`text-lg font-bold ${metric.accent ? "text-primary" : ""}`}>
                {metric.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Risikoanalyse Section (Monte Carlo) */}
      {riskAnalysis && (
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div
            role="button"
            tabIndex={0}
            className="relative z-10 w-full px-6 py-4 cursor-pointer select-none hover:bg-muted/50 transition-colors"
            onClick={() => setShowRiskAnalysis(prev => !prev)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setShowRiskAnalysis(prev => !prev); } }}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Risikoanalyse (Monte-Carlo)
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    riskAnalysis.riskCategory === "niedrig"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                      : riskAnalysis.riskCategory === "moderat"
                        ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                        : riskAnalysis.riskCategory === "erhöht"
                          ? "bg-orange-500/10 text-orange-600 border-orange-500/30"
                          : "bg-red-500/10 text-red-600 border-red-500/30"
                  }`}
                >
                  {riskAnalysis.riskCategory} ({riskAnalysis.overallRiskScore}
                  /100)
                </Badge>
                {showRiskAnalysis ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </div>
          </div>
          <div className="px-6 pb-4">
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="p-2 bg-muted/50 rounded">
                <p className="text-muted-foreground">90% Konfidenz</p>
                <p className="font-semibold">
                  {formatCurrency(riskAnalysis.confidence90.min)} -{" "}
                  {formatCurrency(riskAnalysis.confidence90.max)}
                </p>
              </div>
              <div className="p-2 bg-muted/50 rounded">
                <p className="text-muted-foreground">Variationskoeffizient</p>
                <p className="font-semibold">
                  {(riskAnalysis.coefficientOfVariation * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            {showRiskAnalysis && (
              <div className="space-y-4 pt-2 border-t">
                <RiskDistributionChart
                  riskData={riskAnalysis}
                  marktwert={data.marktwert}
                  kaufpreis={parseFloat(formData?.kaufpreis || "0")}
                />
                <RiskGauge riskData={riskAnalysis} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ertragswert */}
      <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div
          role="button"
          tabIndex={0}
          className="relative z-10 w-full px-6 py-4 cursor-pointer select-none hover:bg-muted/50 transition-colors"
          onClick={() => setShowErtragswertDetails(prev => !prev)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setShowErtragswertDetails(prev => !prev); } }}
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Ertragswert: {formatCurrency(data.ertragswert)}
            </div>
            {showErtragswertDetails ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
        {showErtragswertDetails && (
          <div className="px-6 pb-4 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jahresrohertrag:</span>
              <span>{formatCurrency(data.jahresrohertrag)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                - Bewirtschaftungskosten:
              </span>
              <span>{formatCurrency(data.bewirtschaftungskosten)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1">
              <span className="text-muted-foreground">= Reinertrag:</span>
              <span className="font-medium">
                {formatCurrency(data.reinertrag)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bodenwert:</span>
              <span>{formatCurrency(data.bodenwert)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                - Bodenwertverzinsung:
              </span>
              <span>{formatCurrency(data.bodenwertverzinsung)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1">
              <span className="text-muted-foreground">
                = Gebaeudeertrag:
              </span>
              <span className="font-medium">
                {formatCurrency(data.gebaeudertrag)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Liegenschaftszins:
              </span>
              <span>{formatPercent(data.liegenschaftszins)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Restnutzungsdauer:
              </span>
              <span>{data.restnutzungsdauer} Jahre</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vervielfaeltiger:</span>
              <span>{data.vervielfaeltiger.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Sachwert */}
      <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div
          role="button"
          tabIndex={0}
          className="relative z-10 w-full px-6 py-4 cursor-pointer select-none hover:bg-muted/50 transition-colors"
          onClick={() => setShowSachwertDetails(prev => !prev)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setShowSachwertDetails(prev => !prev); } }}
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium flex items-center gap-2">
              <Home className="w-4 h-4" />
              Sachwert: {formatCurrency(data.sachwert)}
            </div>
            {showSachwertDetails ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
        {showSachwertDetails && (
          <div className="px-6 pb-4 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bodenwert:</span>
              <span>{formatCurrency(data.bodenwert)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">NHK Basiswert:</span>
              <span>{formatCurrency(data.nhkBasiswert)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                - Alterswertminderung:
              </span>
              <span>{formatPercent(data.alterswertminderung)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                = Gebaeudesachwert:
              </span>
              <span>{formatCurrency(data.gebaeudesachwert)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sachwertfaktor:</span>
              <span>{data.sachwertfaktor.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Mietpotenzial */}
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
              <p className="font-semibold">
                {formatCurrency(data.marktMiete)}/a
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Potenzial</p>
              <p
                className={`font-semibold ${data.potenzial > 0 ? "text-emerald-500" : "text-red-500"}`}
              >
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
          <CardTitle className="text-sm font-medium">
            Cash Flow (10 Jahre)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <CashFlowChart data={data || undefined} />
        </CardContent>
      </Card>

      {/* Modernization Chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Modernisierungs-ROI
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <ModernizationChart formData={formData} />
        </CardContent>
      </Card>

      {/* Finanzierungsanalyse */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Finanzierungsanalyse
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">Kaufpreis</p>
              <p className="font-semibold">
                {formatCurrency(data.kaufpreis)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Eigenkapital (20%)</p>
              <p className="font-semibold">
                {formatCurrency(data.eigenkapital)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Fremdkapital</p>
              <p className="font-semibold">
                {formatCurrency(data.fremdkapital)}
              </p>
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
              <p className="font-semibold text-primary">
                {formatCurrency(data.monatsrate)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Cashflow/Monat</p>
              <p
                className={`font-semibold ${data.cashflowMonat >= 0 ? "text-emerald-500" : "text-red-500"}`}
              >
                {data.cashflowMonat >= 0 ? "+" : ""}
                {formatCurrency(data.cashflowMonat)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Cashflow/Jahr</p>
              <p
                className={`font-semibold ${data.cashflowJahr >= 0 ? "text-emerald-500" : "text-red-500"}`}
              >
                {data.cashflowJahr >= 0 ? "+" : ""}
                {formatCurrency(data.cashflowJahr)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">EK-Rendite</p>
              <p className="font-semibold text-primary">
                {formatPercent(data.eigenkapitalrendite)}
              </p>
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
        <RefreshCw
          className={`w-4 h-4 mr-2 ${isCalculating ? "animate-spin" : ""}`}
        />
        {isCalculating ? "Berechne..." : "Neu berechnen"}
      </Button>
    </div>
  )
}
