"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { getBewertungById, dbFormatToFormData } from "@/lib/api/bewertungen"
import { BankMappe } from "@/components/modules/portal/bank-mappe"
import { LoadingState } from "@/components/ui/loading-state"
import { ErrorState } from "@/components/ui/error-state"
import { Button } from "@/components/ui/button"
import { ArrowLeft, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import type { Bewertung } from "@/lib/database.types"
import type { AnalyseResultData, AnalyseFormData } from "@/lib/types"

export default function BewertungPortalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [bewertung, setBewertung] = useState<Bewertung | null>(null)
  const [formData, setFormData] = useState<AnalyseFormData | null>(null)
  const [resultData, setResultData] = useState<AnalyseResultData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        const { data, error } = await getBewertungById(id)
        if (error) throw error
        if (!data) throw new Error("Bewertung nicht gefunden")
        
        setBewertung(data)
        setFormData(dbFormatToFormData(data))
        setResultData(data.ergebnisse as unknown as AnalyseResultData)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  const handleExportPDF = () => {
    // In einer echten App würden wir hier einen PDF-Generator aufrufen
    // Für jetzt öffnen wir das Druckfenster
    window.print()
  }

  if (loading) return <LoadingState message="Lade Objektdaten..." />
  if (error) return <ErrorState title="Fehler" message={error} />
  if (!formData || !resultData) return <ErrorState title="Fehler" message="Daten konnten nicht geladen werden" />

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <span className="text-sm font-medium hidden sm:block truncate max-w-[300px]">
            {bewertung?.adresse}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="https://dashboard.proplytics.de">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>

      <main className="container py-8">
        <BankMappe 
          data={resultData} 
          formData={formData} 
          onExportPDF={handleExportPDF} 
        />
      </main>
    </div>
  )
}
