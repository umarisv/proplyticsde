"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyseHeader, ChatWizard, ResultsPanel, MapPanel } from "@/components/modules/analyse"
import { calculateValuation } from "@/lib/calculate-valuation"
import type { AnalyseFormData, AnalyseResultData } from "@/lib/types"
import { Loader2 } from "lucide-react"

// Default data for initial display
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
  const initialQuery = searchParams.get('q') || ""
  const initialAddress = searchParams.get('address') || "Musterstraße 123, 40239 Düsseldorf"
  
  const [formData, setFormData] = useState<AnalyseFormData>(defaultFormData)
  const [address, setAddress] = useState(initialAddress)
  const [isCalculating, setIsCalculating] = useState(false)
  const [resultData, setResultData] = useState<AnalyseResultData>(() => calculateValuation(defaultFormData))
  const [bewertungId, setBewertungId] = useState<string | null>(null)

  const handleNewAnalysis = () => {
    window.location.reload()
  }

  const handleRecalculate = () => {
    setIsCalculating(true)
    setTimeout(() => {
      setResultData(calculateValuation(formData))
      setIsCalculating(false)
    }, 800)
  }

  const handleDataChange = (data: Partial<AnalyseFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
    if (data.plz && data.stadt) {
      setAddress(`${data.plz} ${data.stadt}`)
    }
  }

  const handleCalculate = (data: AnalyseFormData) => {
    setFormData(data)
    setIsCalculating(true)
    setTimeout(() => {
      setResultData(calculateValuation(data))
      setIsCalculating(false)
    }, 1000)
  }

  const handleSaved = (id: string) => {
    setBewertungId(id)
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col bg-background">
        <AnalyseHeader 
          address={address} 
          onNewAnalysis={handleNewAnalysis} 
          resultData={resultData} 
          formData={formData}
          bewertungId={bewertungId}
          onSaved={handleSaved}
        />
        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <TabsList className="w-full grid grid-cols-3 bg-card border-b border-border rounded-none h-12">
            <TabsTrigger value="chat" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              Chat
            </TabsTrigger>
            <TabsTrigger value="map" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              Karte
            </TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              Ergebnisse
            </TabsTrigger>
          </TabsList>
          <TabsContent value="chat" className="flex-1 m-0 overflow-hidden">
            <ChatWizard onDataChange={handleDataChange} onCalculate={handleCalculate} initialQuery={initialQuery} />
          </TabsContent>
          <TabsContent value="map" className="flex-1 m-0 overflow-hidden">
            <MapPanel address={address} />
          </TabsContent>
          <TabsContent value="results" className="flex-1 m-0 overflow-hidden">
            <ResultsPanel data={resultData} formData={formData} onRecalculate={handleRecalculate} isCalculating={isCalculating} />
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // Desktop Layout
  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-background">
      <AnalyseHeader 
        address={address} 
        onNewAnalysis={handleNewAnalysis} 
        resultData={resultData} 
        formData={formData}
        bewertungId={bewertungId}
        onSaved={handleSaved}
      />
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Results */}
        <aside className="w-[28%] min-w-[320px] max-w-[400px] border-r border-border bg-card/50">
          <ResultsPanel data={resultData} formData={formData} onRecalculate={handleRecalculate} isCalculating={isCalculating} />
        </aside>

        {/* Center Panel - Chat */}
        <main className="flex-1 min-w-[400px] bg-background">
          <ChatWizard onDataChange={handleDataChange} onCalculate={handleCalculate} initialQuery={initialQuery} />
        </main>

        {/* Right Panel - Map */}
        <aside className="w-[28%] min-w-[300px] max-w-[400px] border-l border-border bg-card/50">
          <MapPanel address={address} />
        </aside>
      </div>
    </div>
  )
}

export default function AnalysePage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <AnalysePageContent />
    </Suspense>
  )
}
