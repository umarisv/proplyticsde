"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useIsMobile } from "@/hooks/use-mobile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BewertungenTable } from "@/components/bewertungen-table"
import { CasesPanel } from "@/components/dashboard/cases-panel"
import { DetailsPanel } from "@/components/dashboard/details-panel"
import { ChatPanel } from "@/components/dashboard/chat-panel"
import { getBewertungen, deleteBewertung, duplicateBewertung } from "@/lib/api/bewertungen"
import { isSupabaseConfigured } from "@/lib/supabase"
import { mockCases } from "@/lib/mock-data"
import type { Bewertung } from "@/lib/database.types"
import type { Case } from "@/lib/types"
import { Plus, Search, Building2, RefreshCw } from "lucide-react"

export default function DashboardPage() {
  const isMobile = useIsMobile()
  const [bewertungen, setBewertungen] = useState<Bewertung[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConfigured, setIsConfigured] = useState(false)

  // Legacy support for old dashboard
  const [cases] = useState<Case[]>(mockCases)
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [activeChatCase, setActiveChatCase] = useState<Case | null>(null)
  const [draggingCase, setDraggingCase] = useState<Case | null>(null)

  const loadBewertungen = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error: fetchError } = await getBewertungen()
      if (fetchError) {
        throw fetchError
      }
      setBewertungen(data || [])
    } catch (err) {
      console.error('Fehler beim Laden:', err)
      setError('Fehler beim Laden der Bewertungen')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const configured = isSupabaseConfigured()
    setIsConfigured(configured)
    
    if (configured) {
      loadBewertungen()
    } else {
      setIsLoading(false)
    }
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

  // Legacy handlers
  const handleCaseSelect = (caseItem: Case) => setSelectedCase(caseItem)
  const handleDragStart = (caseItem: Case) => setDraggingCase(caseItem)
  const handleDragEnd = () => setDraggingCase(null)
  const handleDropOnChat = () => {
    if (draggingCase) {
      setActiveChatCase(draggingCase)
      setDraggingCase(null)
    }
  }

  // Show configuration message if Supabase is not set up
  if (!isConfigured) {
    return (
      <div className="flex h-screen flex-col bg-background">
        <header className="flex h-14 shrink-0 items-center justify-between border-b px-6">
          <div className="flex items-center">
            <Building2 className="w-6 h-6 mr-2 text-primary" />
            <h1 className="text-lg font-semibold tracking-tight">proplytics.de</h1>
            <span className="ml-2 text-sm text-muted-foreground">Bewertungsübersicht</span>
          </div>
          <Link href="/analyse">
            <Button size="sm" variant="default">
              <Plus className="w-4 h-4 mr-2" />
              Neue Analyse
            </Button>
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <Building2 className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Datenbank nicht konfiguriert</h2>
            <p className="text-muted-foreground mb-6">
              Um Bewertungen zu speichern und zu verwalten, konfigurieren Sie bitte Supabase in den Umgebungsvariablen.
            </p>
            <div className="space-y-2">
              <Link href="/analyse">
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Neue Analyse starten
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground">
                Analysen können auch ohne Datenbank durchgeführt werden
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="flex h-screen flex-col bg-background">
        <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-primary" />
            <h1 className="text-lg font-semibold tracking-tight">proplytics.de</h1>
          </div>
          <Link href="/analyse">
            <Button size="sm" variant="default">
              <Plus className="w-4 h-4 mr-1" />
              Neu
            </Button>
          </Link>
        </header>
        <Tabs defaultValue="bewertungen" className="flex flex-1 flex-col overflow-hidden">
          <TabsList className="mx-4 mt-2 grid w-auto grid-cols-3">
            <TabsTrigger value="bewertungen">Bewertungen</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="chat">KI-Agent</TabsTrigger>
          </TabsList>
          <TabsContent value="bewertungen" className="flex-1 overflow-auto p-4">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <BewertungenTable
              bewertungen={filteredBewertungen}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              isLoading={isLoading}
            />
          </TabsContent>
          <TabsContent value="details" className="flex-1 overflow-hidden">
            <DetailsPanel selectedCase={selectedCase} />
          </TabsContent>
          <TabsContent value="chat" className="flex-1 overflow-hidden">
            <ChatPanel
              activeChatCase={activeChatCase}
              isDragging={!!draggingCase}
              onDrop={handleDropOnChat}
              onRemoveCase={() => setActiveChatCase(null)}
            />
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-6">
        <div className="flex items-center">
          <Building2 className="w-6 h-6 mr-2 text-primary" />
          <h1 className="text-lg font-semibold tracking-tight">proplytics.de</h1>
          <span className="ml-2 text-sm text-muted-foreground">Bewertungsübersicht</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Bewertungen suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon" onClick={loadBewertungen} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Link href="/analyse">
            <Button size="sm" variant="default">
              <Plus className="w-4 h-4 mr-2" />
              Neue Analyse
            </Button>
          </Link>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg">
              {error}
            </div>
          )}
          <BewertungenTable
            bewertungen={filteredBewertungen}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            isLoading={isLoading}
          />
        </div>
        <div className="w-96 shrink-0 border-l">
          <ChatPanel
            activeChatCase={activeChatCase}
            isDragging={!!draggingCase}
            onDrop={handleDropOnChat}
            onRemoveCase={() => setActiveChatCase(null)}
          />
        </div>
      </div>
    </div>
  )
}
