"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useIsMobile } from "@/hooks/use-mobile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BewertungenTable } from "@/components/bewertungen-table"
import { ChatPanel } from "@/components/dashboard/chat-panel"
import { UserMenu } from "@/components/user-menu"
import { RateLimitBanner } from "@/components/rate-limit-banner"
import { getBewertungen, deleteBewertung, duplicateBewertung } from "@/lib/api/bewertungen"
import { isSupabaseConfigured } from "@/lib/supabase"
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

  // Drag-and-drop für KI-Agent
  const [activeChatCase, setActiveChatCase] = useState<Case | null>(null)
  const [draggingBewertung, setDraggingBewertung] = useState<Bewertung | null>(null)

  // Konvertiert Bewertung zu Case-Format für ChatPanel
  const bewertungToCase = (b: Bewertung): Case => {
    const ergebnisse = b.ergebnisse as Record<string, number> | null
    return {
      id: b.id,
      address: b.adresse || '',
      city: b.stadt || '',
      zip: b.plz || '',
      createdAt: b.created_at,
      status: 'done',
      marktwert: ergebnisse?.marktwert || 0,
      bodenrichtwert: b.bodenrichtwert || 0,
      objekttyp: b.objekttyp || '',
      baujahr: b.baujahr || 0,
      wohnflaeche: b.wohnflaeche || 0,
      grundstueck: b.grundstueck || 0,
      istMiete: b.ist_miete || 0,
      ertragswert: ergebnisse?.ertragswert || 0,
      sachwert: ergebnisse?.sachwert || 0,
      faktor: ergebnisse?.faktor || 0,
      rendite: ergebnisse?.bruttoRendite || 0,
    }
  }

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

  // Drag-and-drop handlers
  const handleDragStart = (bewertung: Bewertung) => setDraggingBewertung(bewertung)
  const handleDragEnd = () => setDraggingBewertung(null)
  const handleDropOnChat = () => {
    if (draggingBewertung) {
      setActiveChatCase(bewertungToCase(draggingBewertung))
      setDraggingBewertung(null)
    }
  }

  // Show configuration message if Supabase is not set up
  if (!isConfigured) {
    return (
      <div className="flex h-screen flex-col bg-background">
        <RateLimitBanner />
        <header className="flex h-14 shrink-0 items-center justify-between border-b px-6">
          <div className="flex items-center">
            <Building2 className="w-6 h-6 mr-2 text-primary" />
            <h1 className="text-lg font-semibold tracking-tight">proplytics.de</h1>
            <span className="ml-2 text-sm text-muted-foreground">Bewertungsübersicht</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/analyse">
              <Button size="sm" variant="default">
                <Plus className="w-4 h-4 mr-2" />
                Neue Analyse
              </Button>
            </Link>
            <UserMenu />
          </div>
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
        <RateLimitBanner />
        <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-primary" />
            <h1 className="text-lg font-semibold tracking-tight">proplytics.de</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/analyse">
              <Button size="sm" variant="default">
                <Plus className="w-4 h-4 mr-1" />
                Neu
              </Button>
            </Link>
            <UserMenu />
          </div>
        </header>
        <Tabs defaultValue="bewertungen" className="flex flex-1 flex-col overflow-hidden">
          <TabsList className="mx-4 mt-2 grid w-auto grid-cols-2">
            <TabsTrigger value="bewertungen">Bewertungen</TabsTrigger>
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
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              isLoading={isLoading}
            />
          </TabsContent>
          <TabsContent value="chat" className="flex-1 overflow-hidden">
            <ChatPanel
              activeChatCase={activeChatCase}
              isDragging={!!draggingBewertung}
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
      <RateLimitBanner />
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
          <UserMenu />
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
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            isLoading={isLoading}
          />
        </div>
        <div className="w-96 shrink-0 border-l">
          <ChatPanel
            activeChatCase={activeChatCase}
            isDragging={!!draggingBewertung}
            onDrop={handleDropOnChat}
            onRemoveCase={() => setActiveChatCase(null)}
          />
        </div>
      </div>
    </div>
  )
}
