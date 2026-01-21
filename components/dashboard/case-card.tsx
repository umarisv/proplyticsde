"use client"

import { GripVertical, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Case } from "@/lib/types"

interface CaseCardProps {
  caseItem: Case
  isSelected: boolean
  onSelect: () => void
  onDragStart: () => void
  onDragEnd: () => void
}

const statusConfig = {
  draft: { label: "Entwurf", variant: "secondary" as const },
  done: { label: "Fertig", variant: "default" as const },
  exported: { label: "Exportiert", variant: "outline" as const },
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateString))
}

export function CaseCard({
  caseItem,
  isSelected,
  onSelect,
  onDragStart,
  onDragEnd,
}: CaseCardProps) {
  const status = statusConfig[caseItem.status]

  return (
    <Card
      className={cn(
        "cursor-pointer transition-colors hover:bg-accent",
        isSelected && "ring-2 ring-primary"
      )}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move"
        onDragStart()
      }}
      onDragEnd={onDragEnd}
      onClick={onSelect}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div className="mt-1 cursor-grab text-muted-foreground">
            <GripVertical className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 space-y-1">
                <p className="truncate text-sm font-medium leading-tight">
                  {caseItem.address}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">
                    {caseItem.zip} {caseItem.city}
                  </span>
                </div>
              </div>
              <Badge variant={status.variant} className="shrink-0 text-xs">
                {status.label}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatDate(caseItem.createdAt)}</span>
              <span className="font-mono">{caseItem.id}</span>
            </div>
            <div className="flex gap-4 pt-1">
              <div>
                <p className="text-xs text-muted-foreground">Marktwert</p>
                <p className="text-sm font-semibold">
                  {formatCurrency(caseItem.marktwert)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">BRW</p>
                <p className="text-sm font-semibold">
                  {caseItem.bodenrichtwert} Euro/qm
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
