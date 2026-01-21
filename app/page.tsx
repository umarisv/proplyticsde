"use client"

import { useState } from "react"
import Link from "next/link"
import { useIsMobile } from "@/hooks/use-mobile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CasesPanel } from "@/components/dashboard/cases-panel"
import { DetailsPanel } from "@/components/dashboard/details-panel"
import { ChatPanel } from "@/components/dashboard/chat-panel"
import { mockCases } from "@/lib/mock-data"
import type { Case } from "@/lib/types"
import { Plus } from "lucide-react"

export default function DashboardPage() {
  const isMobile = useIsMobile()
  const [cases] = useState<Case[]>(mockCases)
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [activeChatCase, setActiveChatCase] = useState<Case | null>(null)
  const [draggingCase, setDraggingCase] = useState<Case | null>(null)
  const [isLoading] = useState(false)
  const [error] = useState<string | null>(null)

  const handleCaseSelect = (caseItem: Case) => {
    setSelectedCase(caseItem)
  }

  const handleDragStart = (caseItem: Case) => {
    setDraggingCase(caseItem)
  }

  const handleDragEnd = () => {
    setDraggingCase(null)
  }

  const handleDropOnChat = () => {
    if (draggingCase) {
      setActiveChatCase(draggingCase)
      setDraggingCase(null)
    }
  }

  if (isMobile) {
    return (
      <div className="flex h-screen flex-col bg-background">
        <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <h1 className="text-lg font-semibold tracking-tight">proplytics.de</h1>
          <Link href="/analyse">
            <Button size="sm" variant="default">
              <Plus className="w-4 h-4 mr-1" />
              Neue Analyse
            </Button>
          </Link>
        </header>
        <Tabs defaultValue="cases" className="flex flex-1 flex-col overflow-hidden">
          <TabsList className="mx-4 mt-2 grid w-auto grid-cols-3">
            <TabsTrigger value="cases">Bewertungen</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="chat">KI-Agent</TabsTrigger>
          </TabsList>
          <TabsContent value="cases" className="flex-1 overflow-hidden">
            <CasesPanel
              cases={cases}
              selectedCase={selectedCase}
              onCaseSelect={handleCaseSelect}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              isLoading={isLoading}
              error={error}
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
      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 shrink-0 border-r">
          <CasesPanel
            cases={cases}
            selectedCase={selectedCase}
            onCaseSelect={handleCaseSelect}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            isLoading={isLoading}
            error={error}
          />
        </div>
        <div className="flex-1 border-r">
          <DetailsPanel selectedCase={selectedCase} />
        </div>
        <div className="w-96 shrink-0">
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
