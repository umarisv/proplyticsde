"use client"

import { useState, useMemo } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Calendar,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  FileDown,
  Landmark,
  Scale,
  Target,
  Info
} from "lucide-react"
import { formatCurrency, formatPercent, formatNumber } from "@/lib/format"
import type { AnalyseResultData, AnalyseFormData } from "@/lib/types"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
} from "recharts"

// PDF functionality temporarily disabled to fix build
// TODO: Implement as separate API route later
const PDFComponents = () => (
  <Button
    size="lg"
    className="gap-2 bg-gray-400 text-white shadow-lg w-full"
    disabled
  >
    <FileDown className="w-4 h-4" />
    PDF Export (bald verfügbar)
  </Button>
)

interface BankMappeProps {
  data: AnalyseResultData
  formData: AnalyseFormData
  address?: string
  onExportPDF?: () => void
}

// Color palette - Bloomberg meets Real Estate
const colors = {
  deepNavy: "#022b25",
  emerald: "#10b981",
  emeraldLight: "#d1fae5",
  softGray: "#f8fafc",
}

export function BankMappe({ data, formData, address, onExportPDF }: BankMappeProps) {
  const [ltv, setLtv] = useState(80)
  const [selectedTab, setSelectedTab] = useState("overview")
  const [pdfReady, setPdfReady] = useState(false)
  const [hoveredValuationMethod, setHoveredValuationMethod] = useState<string | null>(null)
  
  const loanAmount = data.marktwert * (ltv / 100)
  const equityNeeded = data.marktwert - loanAmount
  const monthlyPayment = (loanAmount * (data.zinssatz / 100 + data.tilgung / 100)) / 12
  const dscr = data.jahresrohertrag / (monthlyPayment * 12)

  // Calculate IRR approximation (simplified)
  const irr = useMemo(() => {
    const cashflows = [-equityNeeded]
    for (let i = 0; i < 10; i++) {
      cashflows.push(data.cashflowJahr)
    }
    // Exit value at year 10
    cashflows[10] += data.marktwert * 1.2 - loanAmount * 0.7
    
    // Simple IRR approximation
    let rate = 0.1
    for (let i = 0; i < 100; i++) {
      let npv = 0
      for (let j = 0; j < cashflows.length; j++) {
        npv += cashflows[j] / Math.pow(1 + rate, j)
      }
      if (Math.abs(npv) < 1) break
      rate += npv > 0 ? 0.001 : -0.001
    }
    return rate * 100
  }, [data, loanAmount, equityNeeded])

  // Comprehensive document checklist with status (BelWertV compliant)
  const documents = [
    // Rechtliche Dokumente
    { name: "Grundbuchauszug (max. 3 Monate alt)", status: "complete", category: "Rechtlich", required: true, icon: "📋" },
    { name: "Flurkarte / Lageplan", status: "complete", category: "Rechtlich", required: true, icon: "🗺️" },
    { name: "Baulastenverzeichnis", status: "pending", category: "Rechtlich", required: true, icon: "📋" },
    { name: "Altlastenauskunft", status: "pending", category: "Rechtlich", required: false, icon: "⚠️" },
    { name: "Teilungserklärung (bei WEG)", status: "pending", category: "Rechtlich", required: formData.objekttyp === "etw", icon: "📄" },
    // Technische Dokumente
    { name: "Energieausweis", status: "pending", category: "Technisch", required: true, icon: "⚡" },
    { name: "Wohnflächenberechnung", status: "pending", category: "Technisch", required: true, icon: "📐" },
    { name: "Bauzeichnungen / Grundrisse", status: "pending", category: "Technisch", required: true, icon: "🏗️" },
    { name: "Objektfotos (Innen/Außen)", status: "complete", category: "Technisch", required: true, icon: "📷" },
    { name: "Baugenehmigung", status: "pending", category: "Technisch", required: false, icon: "📜" },
    // Wirtschaftliche Dokumente
    { name: "Mietverträge / Mietaufstellung", status: "pending", category: "Wirtschaftlich", required: true, icon: "💰" },
    { name: "Nebenkostenabrechnung (letzte 3 Jahre)", status: "pending", category: "Wirtschaftlich", required: false, icon: "📊" },
    { name: "Protokolle Eigentümerversammlung", status: "pending", category: "Wirtschaftlich", required: formData.objekttyp === "etw", icon: "📝" },
    { name: "Wirtschaftsplan (bei WEG)", status: "pending", category: "Wirtschaftlich", required: formData.objekttyp === "etw", icon: "📈" },
  ]

  const requiredDocs = documents.filter(d => d.required)
  const completedRequired = requiredDocs.filter(d => d.status === "complete").length
  const completionRate = Math.round((completedRequired / requiredDocs.length) * 100)
  
  // Vollständigkeits-Analyse for the bank
  const bankReadinessScore = useMemo(() => {
    let score = 0
    // Document completeness (40%)
    score += (completionRate / 100) * 40
    // DSCR quality (20%)
    if (dscr >= 1.5) score += 20
    else if (dscr >= 1.2) score += 15
    else if (dscr >= 1.0) score += 10
    // LTV risk (20%)
    if (ltv <= 60) score += 20
    else if (ltv <= 70) score += 15
    else if (ltv <= 80) score += 10
    else if (ltv <= 90) score += 5
    // Cashflow positive (20%)
    if (data.cashflowJahr > 0) score += 20
    else if (data.cashflowJahr >= -1000) score += 10
    return Math.round(score)
  }, [completionRate, dscr, ltv, data.cashflowJahr])

  // Get bank readiness status
  const getBankReadinessStatus = () => {
    if (bankReadinessScore >= 80) return { label: "Kreditwürdig", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" }
    if (bankReadinessScore >= 60) return { label: "Prüfenswert", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" }
    return { label: "Nachbesserung nötig", color: "text-red-600", bg: "bg-red-50 border-red-200" }
  }
  const bankStatus = getBankReadinessStatus()

  // Energy efficiency visualization helper
  const getEnergyClassColor = (energyClass: string) => {
    const colors: Record<string, { bg: string; text: string; position: number }> = {
      "A+": { bg: "bg-green-600", text: "text-white", position: 6.25 },
      A: { bg: "bg-green-500", text: "text-white", position: 18.75 },
      B: { bg: "bg-lime-500", text: "text-white", position: 31.25 },
      C: { bg: "bg-yellow-500", text: "text-white", position: 43.75 },
      D: { bg: "bg-orange-400", text: "text-white", position: 56.25 },
      E: { bg: "bg-orange-500", text: "text-white", position: 68.75 },
      F: { bg: "bg-red-400", text: "text-white", position: 81.25 },
      G: { bg: "bg-red-500", text: "text-white", position: 93.75 },
      H: { bg: "bg-red-600", text: "text-white", position: 100 },
    };
    return colors[energyClass] || { bg: "bg-gray-500", text: "text-white", position: 50 };
  };

  const energyConfig = getEnergyClassColor(formData.energieeffizienz || "C");

  // Valuation method descriptions
  const methodDescriptions: Record<string, { short: string; full: string }> = {
    Ertragswert: {
      short: "Mieteinnahmen-basiert",
      full: "Basiert auf den nachhaltig erzielbaren Erträgen unter Berücksichtigung von Mieteinnahmen, Bewirtschaftungskosten und Liegenschaftszins.",
    },
    Sachwert: {
      short: "Substanzwert",
      full: "Ermittelt aus Bodenwert plus Herstellungskosten der baulichen Anlagen abzüglich Alterswertminderung.",
    },
    Vergleichswert: {
      short: "Marktvergleich",
      full: "Abgeleitet aus tatsächlich realisierten Kaufpreisen vergleichbarer Objekte in ähnlicher Lage.",
    },
    Marktwert: {
      short: "Gutachterlicher Wert",
      full: "Gewichteter Mittelwert aus Ertrags-, Sach- und Vergleichswert inkl. Sicherheitspuffer nach BelWertV.",
    },
  };

  // Valuation comparison data for chart
  const valuationData = [
    { name: "Ertragswert", value: data.ertragswert, fill: colors.emerald },
    { name: "Sachwert", value: data.sachwert, fill: "#64748b" },
    { name: "Vergleichswert", value: data.marktwertMin, fill: "#94a3b8" },
    { name: "Marktwert", value: data.marktwert, fill: colors.deepNavy },
  ]

  // Cashflow projection data
  const cashflowProjection = Array.from({ length: 10 }, (_, i) => ({
    year: `Jahr ${i + 1}`,
    einnahmen: Math.round(data.istMiete * 12 * Math.pow(1.02, i)),
    kosten: Math.round((data.bewirtschaftungskosten + monthlyPayment * 12) * Math.pow(1.01, i)),
    cashflow: Math.round(data.cashflowJahr * Math.pow(1.015, i)),
  }))

  // Calculate CAGR (Compound Annual Growth Rate) for cashflow
  const cagr = useMemo(() => {
    if (cashflowProjection.length < 2) return 0
    const initial = Math.abs(cashflowProjection[0].cashflow) || 1
    const final = Math.abs(cashflowProjection[cashflowProjection.length - 1].cashflow) || 1
    const years = cashflowProjection.length - 1
    const growth = (final / initial) ** (1 / years) - 1
    return growth * 100
  }, [cashflowProjection])

  // Calculate total cashflow over the projection period
  const totalProjectedCashflow = useMemo(() => {
    return cashflowProjection.reduce((sum, year) => sum + year.cashflow, 0)
  }, [cashflowProjection])

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#022b25] via-[#033d35] to-[#022b25] p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Landmark className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Finanzierungsmappe</h1>
                  <p className="text-emerald-300/80 text-sm">Banken-Exposé nach BelWertV</p>
                </div>
              </div>
              {address && (
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="w-4 h-4" />
                  <span>{formData.plz} {formData.stadt}</span>
                  <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-xs">
                    {formData.objekttyp.toUpperCase()}
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {/* Bank Readiness Score */}
              <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${bankStatus.bg}`}>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">Bank-Bewertung</span>
                    <span className={`text-sm font-bold ${bankStatus.color}`}>{bankStatus.label}</span>
                  </div>
                  <Progress value={bankReadinessScore} className="h-2" />
                </div>
                <span className={`text-2xl font-bold ${bankStatus.color}`}>{bankReadinessScore}%</span>
              </div>

              {/* PDF Download Button - Client-side only */}
              <PDFComponents data={data} formData={formData} address={address} />
            </div>
          </div>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
            <div className="space-y-1">
              <p className="text-xs text-emerald-300/70 uppercase tracking-wider">Marktwert</p>
              <p className="text-2xl md:text-3xl font-bold">{formatCurrency(data.marktwert)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-emerald-300/70 uppercase tracking-wider">Beleihungswert</p>
              <p className="text-2xl md:text-3xl font-bold">{formatCurrency(loanAmount)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-emerald-300/70 uppercase tracking-wider">Netto-Rendite</p>
              <p className="text-2xl md:text-3xl font-bold text-emerald-400">{formatPercent(data.nettoRendite)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-emerald-300/70 uppercase tracking-wider">Cashflow p.a.</p>
              <p className={`text-2xl md:text-3xl font-bold ${data.cashflowJahr >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatCurrency(data.cashflowJahr)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="w-4 h-4 hidden sm:block" />
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="valuation" className="gap-2">
            <Scale className="w-4 h-4 hidden sm:block" />
            Bewertung
          </TabsTrigger>
          <TabsTrigger value="financing" className="gap-2">
            <Calculator className="w-4 h-4 hidden sm:block" />
            Finanzierung
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="w-4 h-4 hidden sm:block" />
            Dokumente
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Property Profile */}
            <Card className="lg:col-span-2 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Objektprofil</CardTitle>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    {formData.zustand}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Wohnfläche</p>
                    <p className="text-xl font-bold">{formatNumber(Number(formData.wohnflaeche))} m²</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Grundstück</p>
                    <p className="text-xl font-bold">{formatNumber(Number(formData.grundstueck))} m²</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Baujahr</p>
                    <p className="text-xl font-bold">{formData.baujahr}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Energieklasse</p>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-lg text-sm font-bold ${energyConfig.bg} ${energyConfig.text}`}>
                        {formData.energieeffizienz || "N/A"}
                      </span>
                    </div>
                    {/* Energy Scale */}
                    <div className="relative mt-2">
                      <div className="flex h-2 overflow-hidden rounded-full">
                        <div className="w-[12.5%] bg-green-600" />
                        <div className="w-[12.5%] bg-green-500" />
                        <div className="w-[12.5%] bg-lime-500" />
                        <div className="w-[12.5%] bg-yellow-500" />
                        <div className="w-[12.5%] bg-orange-400" />
                        <div className="w-[12.5%] bg-orange-500" />
                        <div className="w-[12.5%] bg-red-400" />
                        <div className="w-[12.5%] bg-red-600" />
                      </div>
                      {/* Marker */}
                      <div
                        className="absolute -top-1 h-4 w-0.5 rounded-full bg-primary"
                        style={{ left: `${energyConfig.position}%`, transform: 'translateX(-50%)' }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Einheiten</p>
                    <p className="text-xl font-bold">{formData.anzahlWohnungen || "1"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">qm-Preis</p>
                    <p className="text-xl font-bold">{formatCurrency(data.qmPreis)}/m²</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Metrics */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Kennzahlen</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-white border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-emerald-100 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium">IRR (10J)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${irr >= 8 ? 'bg-emerald-500' : irr >= 5 ? 'bg-amber-500' : 'bg-red-500'}`} />
                    <span className={`font-bold ${irr >= 8 ? 'text-emerald-600' : irr >= 5 ? 'text-amber-600' : 'text-red-600'}`}>{formatPercent(irr, 1)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-gray-100 rounded-lg">
                      <Percent className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium">Kaufpreisfaktor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${data.faktor <= 20 ? 'bg-emerald-500' : data.faktor <= 25 ? 'bg-amber-500' : 'bg-red-500'}`} />
                    <span className={`font-bold ${data.faktor <= 20 ? 'text-emerald-600' : data.faktor <= 25 ? 'text-amber-600' : 'text-red-600'}`}>{data.faktor.toFixed(1)}x</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-gray-100 rounded-lg">
                      <ShieldCheck className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium">DSCR</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${dscr >= 1.3 ? 'bg-emerald-500' : dscr >= 1.1 ? 'bg-amber-500' : 'bg-red-500'}`} />
                    <span className={`font-bold ${dscr >= 1.3 ? 'text-emerald-600' : dscr >= 1.1 ? 'text-amber-600' : 'text-red-600'}`}>
                      {dscr.toFixed(2)}x
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-gray-100 rounded-lg">
                      <Euro className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium">EK-Rendite</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${data.eigenkapitalrendite >= 10 ? 'bg-emerald-500' : data.eigenkapitalrendite >= 6 ? 'bg-amber-500' : 'bg-red-500'}`} />
                    <span className={`font-bold ${data.eigenkapitalrendite >= 10 ? 'text-emerald-600' : data.eigenkapitalrendite >= 6 ? 'text-amber-600' : 'text-red-600'}`}>{formatPercent(data.eigenkapitalrendite)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cashflow Projection Chart */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Cashflow-Prognose (10 Jahre)
              </CardTitle>
              <CardDescription>
                Entwicklung der Mieteinnahmen und Kosten • CAGR: {cagr >= 0 ? '+' : ''}{cagr.toFixed(1)}% p.a.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashflowProjection} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="year" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="einnahmen" name="Einnahmen" fill={colors.emerald} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="kosten" name="Kosten" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="cashflow" name="Cashflow" fill={colors.deepNavy} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Cashflow Statistics */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Summe 10 Jahre</p>
                  <p className={`font-mono text-sm font-bold ${totalProjectedCashflow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatCurrency(totalProjectedCashflow)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">CAGR Cashflow</p>
                  <p className={`font-mono text-sm font-bold ${cagr >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {cagr >= 0 ? '+' : ''}{cagr.toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Durchschnitt p.a.</p>
                  <p className={`font-mono text-sm font-bold ${totalProjectedCashflow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatCurrency(totalProjectedCashflow / 10)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Valuation Tab */}
        <TabsContent value="valuation" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Valuation Methods */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Scale className="w-5 h-5 text-primary" />
                  Wertermittlung (BelWertV)
                </CardTitle>
                <CardDescription>Drei-Säulen-Bewertung zur Plausibilisierung</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Ertragswert */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-white border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-emerald-700">Ertragswert</span>
                      <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-600">PRIMÄR</Badge>
                    </div>
                    <span className="text-xl font-bold">{formatCurrency(data.ertragswert)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span>Liegenschaftszins: {formatPercent(data.liegenschaftszins, 1)}</span>
                    <span>Vervielfältiger: {data.vervielfaeltiger.toFixed(2)}</span>
                  </div>
                </div>

                {/* Sachwert */}
                <div className="p-4 rounded-xl bg-muted/50 border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-semibold">Sachwert</span>
                    </div>
                    <span className="text-xl font-bold">{formatCurrency(data.sachwert)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span>NHK-Basis: {formatCurrency(data.nhkBasiswert)}</span>
                    <span>Alterswertm.: {formatPercent(data.alterswertminderung * 100, 0)}</span>
                  </div>
                </div>

                {/* Vergleichswert */}
                <div className="p-4 rounded-xl bg-muted/50 border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-semibold">Vergleichswert</span>
                    </div>
                    <span className="text-xl font-bold">{formatCurrency(data.marktwertMin)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Spanne: {formatCurrency(data.marktwertMin)} - {formatCurrency(data.marktwertMax)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Valuation Chart */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Wertvergleich</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={valuationData} layout="vertical" margin={{ left: 20, right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis 
                        type="number" 
                        tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                        fontSize={12}
                      />
                      <YAxis type="category" dataKey="name" fontSize={12} width={100} />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar
                        dataKey="value"
                        radius={[0, 4, 4, 0]}
                        onMouseEnter={(_, index) => setHoveredValuationMethod(valuationData[index].name)}
                        onMouseLeave={() => setHoveredValuationMethod(null)}
                      >
                        {valuationData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.fill}
                            opacity={hoveredValuationMethod === null || hoveredValuationMethod === entry.name ? 1 : 0.4}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Method Description on Hover */}
          {hoveredValuationMethod && (
            <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-white border border-emerald-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">
                      {hoveredValuationMethod}: {methodDescriptions[hoveredValuationMethod]?.short}
                    </p>
                    <p className="text-xs text-emerald-700 mt-1">
                      {methodDescriptions[hoveredValuationMethod]?.full}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Market Value Highlight */}
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-[#022b25] to-[#033d35] text-white overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    <span className="text-sm text-emerald-300 uppercase tracking-wider">Gutachterlicher Marktwert</span>
                  </div>
                  <p className="text-4xl md:text-5xl font-bold">{formatCurrency(data.marktwert)}</p>
                  <p className="text-emerald-300/70 text-sm">
                    Gewichteter Mittelwert aus Ertrags-, Sach- und Vergleichswert inkl. Sicherheitspuffer
                  </p>
                </div>
                <div className="flex flex-col gap-2 text-right">
                  <div className="text-sm text-emerald-300/70">Bewertungsspanne</div>
                  <div className="text-lg font-semibold">
                    {formatCurrency(data.marktwertMin)} - {formatCurrency(data.marktwertMax)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financing Tab */}
        <TabsContent value="financing" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enhanced LTV Simulator */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  Beleihungs-Simulator
                </CardTitle>
                <CardDescription>Interaktive Anpassung des Beleihungsauslaufs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* LTV Slider with Visual Zones */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Beleihungsauslauf (LTV)</span>
                    <Badge 
                      className={`text-lg font-bold transition-all ${
                        ltv <= 60 ? 'bg-emerald-500 hover:bg-emerald-500' : 
                        ltv <= 70 ? 'bg-emerald-400 hover:bg-emerald-400' :
                        ltv <= 80 ? 'bg-amber-500 hover:bg-amber-500' :
                        ltv <= 90 ? 'bg-orange-500 hover:bg-orange-500' :
                        'bg-red-500 hover:bg-red-500'
                      }`}
                    >
                      {ltv}%
                    </Badge>
                  </div>
                  
                  {/* LTV Zone Indicator */}
                  <div className="relative h-3 rounded-full overflow-hidden bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500">
                    <div 
                      className="absolute top-0 h-full w-1 bg-white shadow-lg border border-gray-300 rounded-full transition-all"
                      style={{ left: `${((ltv - 50) / 50) * 100}%` }}
                    />
                  </div>
                  
                  <Slider 
                    value={[ltv]} 
                    onValueChange={(vals) => setLtv(vals[0])} 
                    min={50} 
                    max={100} 
                    step={5}
                    className="py-4"
                  />
                  
                  <div className="grid grid-cols-5 gap-1 text-[10px] text-center">
                    <div className={`p-1 rounded ${ltv <= 60 ? 'bg-emerald-100 text-emerald-700 font-bold' : 'text-muted-foreground'}`}>
                      50-60%<br/>Erstklassig
                    </div>
                    <div className={`p-1 rounded ${ltv > 60 && ltv <= 70 ? 'bg-emerald-100 text-emerald-700 font-bold' : 'text-muted-foreground'}`}>
                      60-70%<br/>Sehr gut
                    </div>
                    <div className={`p-1 rounded ${ltv > 70 && ltv <= 80 ? 'bg-amber-100 text-amber-700 font-bold' : 'text-muted-foreground'}`}>
                      70-80%<br/>Standard
                    </div>
                    <div className={`p-1 rounded ${ltv > 80 && ltv <= 90 ? 'bg-orange-100 text-orange-700 font-bold' : 'text-muted-foreground'}`}>
                      80-90%<br/>Erhöht
                    </div>
                    <div className={`p-1 rounded ${ltv > 90 ? 'bg-red-100 text-red-700 font-bold' : 'text-muted-foreground'}`}>
                      90-100%<br/>Riskant
                    </div>
                  </div>
                </div>

                {/* Live Calculation Results */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className={`p-4 rounded-xl transition-colors ${ltv <= 70 ? 'bg-emerald-50 border border-emerald-200' : 'bg-muted/50'}`}>
                    <p className="text-xs text-muted-foreground uppercase">Kreditsumme</p>
                    <p className="text-2xl font-bold">{formatCurrency(loanAmount)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Monatliche Rate: {formatCurrency(monthlyPayment)}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl transition-colors ${ltv <= 70 ? 'bg-emerald-50 border border-emerald-200' : 'bg-muted/50'}`}>
                    <p className="text-xs text-muted-foreground uppercase">Eigenkapital</p>
                    <p className="text-2xl font-bold">{formatCurrency(equityNeeded)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      EK-Quote: {formatPercent((equityNeeded / data.marktwert) * 100)}
                    </p>
                  </div>
                </div>

                {/* Dynamic Bank Recommendation */}
                <div className={`p-4 rounded-xl border transition-all ${
                  dscr >= 1.5 && ltv <= 70 ? 'bg-emerald-50 border-emerald-300' :
                  dscr >= 1.2 && ltv <= 80 ? 'bg-emerald-50 border-emerald-200' :
                  dscr >= 1.0 ? 'bg-amber-50 border-amber-200' :
                  'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <Info className={`w-5 h-5 mt-0.5 ${
                      dscr >= 1.2 && ltv <= 80 ? 'text-emerald-600' :
                      dscr >= 1.0 ? 'text-amber-600' : 'text-red-600'
                    }`} />
                    <div>
                      <p className={`text-sm font-medium ${
                        dscr >= 1.2 && ltv <= 80 ? 'text-emerald-700' :
                        dscr >= 1.0 ? 'text-amber-700' : 'text-red-700'
                      }`}>
                        {dscr >= 1.5 && ltv <= 70 ? '✓ Ausgezeichnete Finanzierungsstruktur' :
                         dscr >= 1.2 && ltv <= 80 ? '✓ Solide Finanzierungsstruktur' :
                         dscr >= 1.0 ? '⚠️ Grenzwertige Finanzierung' :
                         '⛔ Hohes Risiko - Nachbesserung empfohlen'}
                      </p>
                      <p className={`text-xs ${
                        dscr >= 1.2 && ltv <= 80 ? 'text-emerald-600' :
                        dscr >= 1.0 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        DSCR: {dscr.toFixed(2)}x • LTV: {ltv}% • 
                        {dscr >= 1.2 ? ' Kapitaldienstfähigkeit gegeben' : ' Eigenkapitalerhöhung empfohlen'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Metrics */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Euro className="w-5 h-5 text-primary" />
                  Finanzierungsstruktur
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border">
                  <span className="text-sm">Zinssatz</span>
                  <span className="font-bold">{formatPercent(data.zinssatz)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border">
                  <span className="text-sm">Tilgung p.a.</span>
                  <span className="font-bold">{formatPercent(data.tilgung)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border">
                  <span className="text-sm">Monatliche Annuität</span>
                  <span className="font-bold">{formatCurrency(monthlyPayment)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border">
                  <span className="text-sm">Schuldendienstdeckung (DSCR)</span>
                  <span className={`font-bold ${dscr >= 1.2 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {dscr.toFixed(2)}x
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-white border border-emerald-200">
                  <span className="text-sm font-medium">Cashflow nach Finanzierung</span>
                  <span className={`text-xl font-bold ${data.cashflowJahr >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatCurrency(data.cashflowJahr)}/Jahr
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6 mt-6">
          {/* Vollständigkeits-Analyse Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-[#022b25] to-[#033d35] text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    Vollständigkeits-Analyse
                  </CardTitle>
                  <CardDescription className="text-emerald-300/70">Bank-Bewertung der Unterlagen</CardDescription>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${bankStatus.color === 'text-emerald-600' ? 'text-emerald-400' : bankStatus.color === 'text-amber-600' ? 'text-amber-400' : 'text-red-400'}`}>
                    {bankReadinessScore}%
                  </div>
                  <div className={`text-sm ${bankStatus.color === 'text-emerald-600' ? 'text-emerald-300' : bankStatus.color === 'text-amber-600' ? 'text-amber-300' : 'text-red-300'}`}>
                    {bankStatus.label}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-white/10">
                  <div className="text-xs text-emerald-300/70 uppercase">Dokumente</div>
                  <div className="text-lg font-bold">{completedRequired}/{requiredDocs.length}</div>
                  <Progress value={completionRate} className="h-1 mt-2" />
                </div>
                <div className="p-3 rounded-lg bg-white/10">
                  <div className="text-xs text-emerald-300/70 uppercase">DSCR</div>
                  <div className={`text-lg font-bold ${dscr >= 1.2 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {dscr.toFixed(2)}x
                  </div>
                  <div className="text-xs text-emerald-300/50 mt-1">{dscr >= 1.2 ? '✓ OK' : '⚠️ Grenzwertig'}</div>
                </div>
                <div className="p-3 rounded-lg bg-white/10">
                  <div className="text-xs text-emerald-300/70 uppercase">Beleihung</div>
                  <div className={`text-lg font-bold ${ltv <= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {ltv}%
                  </div>
                  <div className="text-xs text-emerald-300/50 mt-1">{ltv <= 80 ? '✓ OK' : '⚠️ Hoch'}</div>
                </div>
                <div className="p-3 rounded-lg bg-white/10">
                  <div className="text-xs text-emerald-300/70 uppercase">Cashflow</div>
                  <div className={`text-lg font-bold ${data.cashflowJahr >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {data.cashflowJahr >= 0 ? '+' : ''}{formatCurrency(data.cashflowJahr)}
                  </div>
                  <div className="text-xs text-emerald-300/50 mt-1">{data.cashflowJahr >= 0 ? '✓ Positiv' : '⛔ Negativ'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categorized Document Checklist */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Rechtliche Dokumente */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  📋 Rechtliche Dokumente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {documents.filter(d => d.category === "Rechtlich").map((doc, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      doc.status === "complete" 
                        ? "bg-emerald-50 border-emerald-200" 
                        : "bg-muted/30 border-dashed"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {doc.status === "complete" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <div>
                        <p className={`text-xs font-medium ${doc.status === "complete" ? "" : "text-muted-foreground"}`}>
                          {doc.name}
                        </p>
                        {doc.required && (
                          <Badge variant="outline" className="text-[8px] h-3 px-1 mt-0.5">Pflicht</Badge>
                        )}
                      </div>
                    </div>
                    {doc.status !== "complete" && (
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Upload className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Technische Dokumente */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  🏗️ Technische Dokumente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {documents.filter(d => d.category === "Technisch").map((doc, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      doc.status === "complete" 
                        ? "bg-emerald-50 border-emerald-200" 
                        : "bg-muted/30 border-dashed"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {doc.status === "complete" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <div>
                        <p className={`text-xs font-medium ${doc.status === "complete" ? "" : "text-muted-foreground"}`}>
                          {doc.name}
                        </p>
                        {doc.required && (
                          <Badge variant="outline" className="text-[8px] h-3 px-1 mt-0.5">Pflicht</Badge>
                        )}
                      </div>
                    </div>
                    {doc.status !== "complete" && (
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Upload className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Wirtschaftliche Dokumente */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  💰 Wirtschaftliche Dokumente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {documents.filter(d => d.category === "Wirtschaftlich").map((doc, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      doc.status === "complete" 
                        ? "bg-emerald-50 border-emerald-200" 
                        : "bg-muted/30 border-dashed"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {doc.status === "complete" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <div>
                        <p className={`text-xs font-medium ${doc.status === "complete" ? "" : "text-muted-foreground"}`}>
                          {doc.name}
                        </p>
                        {doc.required && (
                          <Badge variant="outline" className="text-[8px] h-3 px-1 mt-0.5">Pflicht</Badge>
                        )}
                      </div>
                    </div>
                    {doc.status !== "complete" && (
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Upload className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Bank Requirements Note */}
          <Card className={`border-0 shadow-lg ${completionRate === 100 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${completionRate === 100 ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                  {completionRate === 100 ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <Info className="w-6 h-6 text-amber-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-lg font-semibold ${completionRate === 100 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {completionRate === 100 ? 'Bereit zur Einreichung' : 'Was die Bank noch benötigt'}
                  </p>
                  <p className={`text-sm mt-1 ${completionRate === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {completionRate === 100 
                      ? "Alle erforderlichen Dokumente sind vollständig. Die Finanzierungsmappe kann bei der Bank eingereicht werden."
                      : `Es fehlen noch ${requiredDocs.length - completedRequired} Pflichtdokumente für eine vollständige Kreditprüfung. Laden Sie die fehlenden Unterlagen hoch, um die Bank-Bewertung zu verbessern.`}
                  </p>
                  {completionRate < 100 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {documents.filter(d => d.required && d.status !== "complete").slice(0, 3).map((doc, idx) => (
                        <Badge key={idx} variant="outline" className="bg-white text-amber-700 border-amber-300">
                          {doc.icon} {doc.name.split(' ')[0]}
                        </Badge>
                      ))}
                      {documents.filter(d => d.required && d.status !== "complete").length > 3 && (
                        <Badge variant="outline" className="bg-white text-amber-700 border-amber-300">
                          +{documents.filter(d => d.required && d.status !== "complete").length - 3} weitere
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
