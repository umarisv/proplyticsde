"use client"

import { useState, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyseHeader, ChatWizard, ResultsPanel, MapPanel } from "@/components/modules/analyse"
import { calculateValuation } from "@/lib/calculate-valuation"
import type { AnalyseFormData, AnalyseResultData } from "@/lib/types"
import { Loader2 } from "lucide-react"

const defaultFormData: AnalyseFormData = {
  plz: "40239",
  stadt: "Düsseldorf",
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
    const keys = [
      "plz", "stadt", "objekttyp", "baujahr", "wohnflaeche",
      "grundstueck", "kaufpreis", "mieteinnahmen", "wohneinheiten", "zustand", "zimmer",
    ]
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
      try {
        setResultData(calculateValuation(data))
      } catch (e) {
        console.error("[v0] calculateValuation error:", e)
      }
      setIsCalculating(false)
    }, 800)
  }

  const handleRecalculate = () => {
    setIsCalculating(true)
    setTimeout(() => {
      try {
        setResultData(calculateValuation(formData))
      } catch (e) {
        console.error("[v0] recalculate error:", e)
      }
      setIsCalculating(false)
    }, 800)
  }

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col bg-background">
        <AnalyseHeader
          address={address}
          onNewAnalysis={() => window.location.reload()}
          resultData={resultData}
          formData={formData}
          bewertungId={bewertungId}
          onSaved={(id) => setBewertungId(id)}
        />
        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <TabsList className="w-full grid grid-cols-3 bg-card border-b border-border rounded-none h-12">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="results">Ergebnisse</TabsTrigger>
            <TabsTrigger value="map">Karte</TabsTrigger>
          </TabsList>
          <TabsContent value="chat" className="flex-1 m-0 overflow-hidden">
            <ChatWizard onDataChange={handleDataChange} onCalculate={handleCalculate} initialQuery={initialQuery} initialData={initialData} />
          </TabsContent>
          <TabsContent value="results" className="flex-1 m-0 overflow-hidden">
            <ResultsPanel data={resultData} formData={formData} onRecalculate={handleRecalculate} isCalculating={isCalculating} />
          </TabsContent>
          <TabsContent value="map" className="flex-1 m-0 overflow-hidden">
            <MapPanel address={address} />
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-background">
      <AnalyseHeader
        address={address}
        onNewAnalysis={() => window.location.reload()}
        resultData={resultData}
        formData={formData}
        bewertungId={bewertungId}
        onSaved={(id) => setBewertungId(id)}
      />
      <div className="flex-1 flex overflow-hidden">
        {/* Links: Ergebnisse + Karte (grosser Bereich ~55%) */}
        <aside className="w-[55%] flex flex-col border-r border-border bg-card/50 overflow-hidden">
          {/* Oben: Ergebnisse (scrollbar, nimmt den Grossteil ein) */}
          <div className="flex-1 overflow-y-auto">
            <ResultsPanel
              data={resultData}
              formData={formData}
              onRecalculate={handleRecalculate}
              isCalculating={isCalculating}
            />
          </div>
          {/* Unten: Karte (fixe Hoehe) */}
          <div className="h-[260px] shrink-0 border-t border-border">
            <MapPanel address={address} />
          </div>
        </aside>

        {/* Rechts: Chat (schmalerer Bereich ~45%) */}
        <main className="flex-1 min-w-[380px] bg-background">
          <ChatWizard
            onDataChange={handleDataChange}
            onCalculate={handleCalculate}
            initialQuery={initialQuery}
            initialData={initialData}
          />
        </main>
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
