"use client"

import { useState, useEffect, useCallback } from "react"
import { getBewertungen, deleteBewertung, duplicateBewertung } from "@/lib/api/bewertungen"
import { BewertungenTable } from "@/components/bewertungen-table"
import { LoadingState } from "@/components/ui/loading-state"
import { ErrorState } from "@/components/ui/error-state"
import { Input } from "@/components/ui/input"
import { Search, Building2, Plus, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Bewertung } from "@/lib/database.types"

export default function PortalBewertungenPage() {
  const [bewertungen, setBewertungen] = useState<Bewertung[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const loadBewertungen = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await getBewertungen()
      if (fetchError) throw fetchError
      setBewertungen(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBewertungen()
  }, [loadBewertungen])

  const handleDelete = async (id: string) => {
    const { error } = await deleteBewertung(id)
    if (!error) {
      setBewertungen(prev => prev.filter(b => b.id !== id))
      setSelectedIds(prev => prev.filter(i => i !== id))
    }
  }

  const handleDuplicate = async (id: string) => {
    const { data, error } = await duplicateBewertung(id)
    if (!error && data) {
      setBewertungen(prev => [data, ...prev])
    }
  }

  const filteredBewertungen = bewertungen.filter(b => {
    if (!searchQuery) return true
    const search = searchQuery.toLowerCase()
    return (
      b.adresse?.toLowerCase().includes(search) ||
      b.stadt?.toLowerCase().includes(search) ||
      b.plz?.includes(search)
    )
  })

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <header className="bg-white border-b py-8 px-6">
        <div className="max-w-6xl mx-auto space-y-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/portal')} className="-ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zum Portal
          </Button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Meine Bewertungen</h1>
              <p className="text-muted-foreground">Verwalten Sie Ihre Immobilien-Analysen und erstellen Sie Bankmappen.</p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/analyse">
                <Plus className="w-4 h-4" />
                Neue Analyse
              </Link>
            </Button>
          </div>
          
          <div className="relative max-w-md pt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground mt-2" />
            <Input
              placeholder="Bewertungen suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {isLoading ? (
          <LoadingState message="Lade Ihre Bewertungen..." />
        ) : error ? (
          <ErrorState title="Fehler beim Laden" message={error} />
        ) : (
          <BewertungenTable
            bewertungen={filteredBewertungen}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            isLoading={false}
          />
        )}
      </main>
    </div>
  )
}
