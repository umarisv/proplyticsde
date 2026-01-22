"use client"

import React from "react"

import {
  Building2,
  Calendar,
  Copy,
  FileText,
  MapPin,
  Ruler,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { EmptyState } from "@/components/ui/empty-state"
import type { Case } from "@/lib/types"

interface DetailsPanelProps {
  selectedCase: Case | null
}

function formatCurrency(value: number): string {
  if (value === 0) return "-"
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPercent(value: number): string {
  if (value === 0) return "-"
  return `${value.toFixed(1)} %`
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

export function DetailsPanel({ selectedCase }: DetailsPanelProps) {
  if (!selectedCase) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/30">
        <EmptyState
          icon={Building2}
          title="Keine Bewertung ausgewahlt"
          description="Wahlen Sie eine Bewertung aus der Liste, um Details anzuzeigen"
        />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{selectedCase.address}</h2>
            <div className="mt-1 flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {selectedCase.zip} {selectedCase.city}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DetailRow icon={Building2} label="Objektart" value={selectedCase.objekttyp} />
            <DetailRow icon={Calendar} label="Baujahr" value={selectedCase.baujahr} />
            <DetailRow icon={Ruler} label="Wohnflache" value={`${selectedCase.wohnflaeche} qm`} />
            <DetailRow icon={Ruler} label="Grundstuck" value={selectedCase.grundstueck > 0 ? `${selectedCase.grundstueck} qm` : "-"} />
          </div>

          {selectedCase.istMiete > 0 && (
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">Ist-Miete (monatlich)</p>
              <p className="text-lg font-semibold">
                {formatCurrency(selectedCase.istMiete)}
              </p>
            </div>
          )}

          <Separator />

          <div>
            <h3 className="mb-4 text-lg font-semibold tracking-tight">Bewertungsergebnisse</h3>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-normal text-muted-foreground">
                    Marktwert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-semibold tracking-tight">
                    {formatCurrency(selectedCase.marktwert)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-normal text-muted-foreground">
                    Ertragswert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-semibold tracking-tight">
                    {formatCurrency(selectedCase.ertragswert)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-normal text-muted-foreground">
                    Sachwert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-semibold tracking-tight">
                    {formatCurrency(selectedCase.sachwert)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-normal text-muted-foreground">
                    Faktor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-semibold tracking-tight">
                    {selectedCase.faktor > 0 ? selectedCase.faktor.toFixed(1) : "-"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-normal text-muted-foreground">
                    Rendite
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-semibold tracking-tight">
                    {formatPercent(selectedCase.rendite)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-normal text-muted-foreground">
                    Bodenrichtwert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-semibold tracking-tight">
                    {selectedCase.bodenrichtwert} Euro/qm
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex gap-2 p-4">
        <Button className="flex-1">Offnen</Button>
        <Button variant="outline" size="icon">
          <FileText className="h-4 w-4" />
          <span className="sr-only">PDF Export</span>
        </Button>
        <Button variant="outline" size="icon">
          <Copy className="h-4 w-4" />
          <span className="sr-only">Duplizieren</span>
        </Button>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Loschen</span>
        </Button>
      </div>
    </div>
  )
}
