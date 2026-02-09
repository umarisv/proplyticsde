"use client"

import { useState, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyseHeader, ChatWizard, ResultsPanel, MapPanel } from "@/components/modules/analyse"
import { calculateValuation } from "@/lib/calculate-valuation"
import type { AnalyseFormData, AnalyseResultData } from "@/lib/types"
import { Loader2, MessageSquare, BarChart3, Map } from "lucide-react"

const defaultFormData: AnalyseFormData = {
  plz: "40239",
  stadt: "Duesseldorf",
  objekttyp: "mfh",
  wohnflaeche: "850",
  grundstueck: "1200",
  baujahr: "1965",
  zustand: "gepflegt",
  ausstattung: "mittel",
  lage: "mittel",
  energieeffizienz: "D",
  anzahlWohnungen: "6",
  stellplaetze: "4",
  keller: true,
  balkon: true,
  aufzug: false,
  istMiete: "12500",
  bodenrichtwert: "580",
  kaufpreis: "3200000",
}

function AnalysePageContent() {
  const isMobile = useIsMobile()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const initialData = useMemo(() => {
    const data: Record<string, string> = {}
    const keys = ["plz", "stadt", "objekttyp", "baujahr", "wohnflaeche", "grundstueck", "kaufpreis", "mieteinnahmen", "wohneinheiten", "zustand", "zimmer"]
    for (const k of keys) {
      const v = searchParams.get(k)
      if (v) data[k] = v
    }
    return Object.keys(data).length > 0 ? data : undefined
  }, [searchParams])

  const [formData, setFormData] = useState<AnalyseFormData>(defaultFormData)
  const [plz, setPlz] = useState(initialData?.plz || "40239")
  const [isCalculating, setIsCalculating] = useState(false)
  const [resultData, setResultData] = useState<AnalyseResultData>(() => calculateValuation(defaultFormData))
  const [bewertungId, setBewertungId] = useState<string | null>(null)

  const address = `${formData.plz || plz} ${formData.stadt || "Deutschland"}`

  const handleDataChange = (data: Partial<AnalyseFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
    if (data.plz) setPlz(data.plz)
  }

  const handleCalculate = (data: AnalyseFormData) => {
    setFormData(data)
    if (data.plz) setPlz(data.plz)
    setIsCalculating(true)
    setTimeout(() => {
      try { setResultData(calculateValuation(data)) } catch {}
      setIsCalculating(false)
    }, 800)
  }

  const handleRecalculate = () => {
    setIsCalculating(true)
    setTimeout(() => {
      try { setResultData(calculateValuation(formData)) } catch {}
      setIsCalculating(false)
    }, 800)
  }

  /* ---- MOBILE ---- */
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col bg-background">
        <AnalyseHeader address={address} onNewAnalysis={() => window.location.reload()} resultData={resultData} formData={formData} bewertungId={bewertungId} onSaved={(id) => setBewertungId(id)} />
        <Tabs defaultValue="chat" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full grid grid-cols-3 bg-card border-b border-border rounded-none h-11 shrink-0">
            <TabsTrigger value="chat" className="gap-1.5 text-xs"><MessageSquare className="h-3.5 w-3.5" />Chat</TabsTrigger>
            <TabsTrigger value="results" className="gap-1.5 text-xs"><BarChart3 className="h-3.5 w-3.5" />Ergebnisse</TabsTrigger>
            <TabsTrigger value="map" className="gap-1.5 text-xs"><Map className="h-3.5 w-3.5" />Karte</TabsTrigger>
          </TabsList>
          <TabsContent value="chat" className="flex-1 m-0 overflow-hidden"><ChatWizard onDataChange={handleDataChange} onCalculate={handleCalculate} initialQuery={initialQuery} initialData={initialData} /></TabsContent>
          <TabsContent value="results" className="flex-1 m-0 overflow-auto"><ResultsPanel data={resultData} formData={formData} onRecalculate={handleRecalculate} isCalculating={isCalculating} /></TabsContent>
          <TabsContent value="map" className="flex-1 m-0 overflow-hidden"><MapPanel address={address} /></TabsContent>
        </Tabs>
      </div>
    )
  }

  /* ---- DESKTOP: Chat links | Ergebnisse mitte | Karte rechts ---- */
  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-background">
      <AnalyseHeader address={address} onNewAnalysis={() => window.location.reload()} resultData={resultData} formData={formData} bewertungId={bewertungId} onSaved={(id) => setBewertungId(id)} />
      <div className="flex-1 flex overflow-hidden">

        {/* Links: Chat */}
        <aside className="w-[420px] shrink-0 flex flex-col border-r border-border bg-background overflow-hidden">
          <ChatWizard onDataChange={handleDataChange} onCalculate={handleCalculate} initialQuery={initialQuery} initialData={initialData} />
        </aside>

        {/* Mitte: Ergebnisse */}
        <main className="flex-1 overflow-y-auto bg-muted/30">
          <ResultsPanel data={resultData} formData={formData} onRecalculate={handleRecalculate} isCalculating={isCalculating} />
        </main>

        {/* Rechts: Karte */}
        <aside className="w-[380px] shrink-0 border-l border-border">
          <MapPanel address={address} />
        </aside>

      </div>
    </div>
  )
}

export default function AnalysePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <AnalysePageContent />
    </Suspense>
  )
}
