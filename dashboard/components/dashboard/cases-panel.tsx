"use client"

import { useState } from "react"
import { Plus, Search, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingState, CardSkeleton } from "@/components/ui/loading-state"
import { ErrorState } from "@/components/ui/error-state"
import { CaseCard } from "./case-card"
import type { Case } from "@/lib/types"

interface CasesPanelProps {
  cases: Case[]
  selectedCase: Case | null
  onCaseSelect: (caseItem: Case) => void
  onDragStart: (caseItem: Case) => void
  onDragEnd: () => void
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

const filterOptions = [
  { value: "all", label: "Alle" },
  { value: "draft", label: "Entwurfe" },
  { value: "done", label: "Fertig" },
  { value: "exported", label: "Exportiert" },
] as const

export function CasesPanel({
  cases,
  selectedCase,
  onCaseSelect,
  onDragStart,
  onDragEnd,
  isLoading = false,
  error = null,
  onRetry,
}: CasesPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<string>("all")

  const filteredCases = cases.filter((caseItem) => {
    const matchesSearch =
      caseItem.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.zip.includes(searchQuery) ||
      caseItem.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter =
      activeFilter === "all" || caseItem.status === activeFilter

    return matchesSearch && matchesFilter
  })

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Meine Bewertungen</h2>
            <p className="text-sm text-muted-foreground">{cases.length} Objekte</p>
          </div>
        </div>

        <Button className="w-full" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Neue Bewertung
        </Button>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Suche nach Adresse, Stadt, PLZ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={activeFilter === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(option.value)}
              className="text-xs"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 pb-4">
        <div className="space-y-3">
          {isLoading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : error ? (
            <ErrorState message={error} onRetry={onRetry} />
          ) : filteredCases.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="Keine Bewertungen gefunden"
              description={
                searchQuery || activeFilter !== "all"
                  ? "Versuchen Sie andere Suchkriterien"
                  : "Erstellen Sie Ihre erste Bewertung"
              }
            />
          ) : (
            filteredCases.map((caseItem) => (
              <CaseCard
                key={caseItem.id}
                caseItem={caseItem}
                isSelected={selectedCase?.id === caseItem.id}
                onSelect={() => onCaseSelect(caseItem)}
                onDragStart={() => onDragStart(caseItem)}
                onDragEnd={onDragEnd}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
