"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { MeinungsbildAggregation, MeinungsbildRating } from "../types"

const dimensions = [
  { key: "rendite", label: "Rendite", desc: "Bruttomietrendite, Cashflow, IRR" },
  { key: "risiko", label: "Risiko", desc: "Deal-Killer, Standort-Score" },
  { key: "finanzierung", label: "Finanzierung", desc: "DSCR, EK-Quote, Zinsen" },
  { key: "value_add", label: "Value-Add", desc: "Werthebel, Mietsteigerung" },
  { key: "lage_markt", label: "Lage & Markt", desc: "Makrolage, Nachfrage" },
  { key: "deal_sourcing", label: "Deal Sourcing", desc: "Preis, Verhandlung" },
] as const

function getColor(val: number): string {
  if (val <= 1.5) return "bg-red-500"
  if (val <= 2.5) return "bg-amber-500"
  return "bg-emerald-500"
}

function getLabel(val: number): string {
  if (val <= 1.5) return "Kritisch"
  if (val <= 2.5) return "Neutral"
  return "Positiv"
}

function getTextColor(val: number): string {
  if (val <= 1.5) return "text-red-600"
  if (val <= 2.5) return "text-amber-600"
  return "text-emerald-600"
}

interface Props {
  aggregation: MeinungsbildAggregation
  ratings: MeinungsbildRating[]
}

export function MeinungsbildPanel({ aggregation, ratings }: Props) {
  if (aggregation.count === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Meinungsbild</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Noch keine Bewertungen vorhanden. Geben Sie die erste
            Einschaetzung ab!
          </p>
        </CardContent>
      </Card>
    )
  }

  // Calculate overall score (average of all dimensions)
  const overall =
    (aggregation.rendite +
      aggregation.risiko +
      aggregation.finanzierung +
      aggregation.value_add +
      aggregation.lage_markt +
      aggregation.deal_sourcing) /
    6

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Meinungsbild</CardTitle>
          <span className="text-xs text-muted-foreground">
            {aggregation.count}{" "}
            {aggregation.count === 1 ? "Bewertung" : "Bewertungen"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall score */}
        <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/50 p-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-primary-foreground",
              getColor(overall)
            )}
          >
            {overall.toFixed(1)}
          </div>
          <div>
            <p className={cn("text-sm font-semibold", getTextColor(overall))}>
              {getLabel(overall)}
            </p>
            <p className="text-xs text-muted-foreground">Gesamteinschaetzung</p>
          </div>
        </div>

        {/* Dimension bars */}
        <div className="space-y-3">
          {dimensions.map((dim) => {
            const val = aggregation[dim.key as keyof MeinungsbildAggregation] as number
            const pct = ((val - 1) / 2) * 100 // 1-3 scale -> 0-100%
            return (
              <div key={dim.key}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium">{dim.label}</span>
                  <span className={cn("text-xs font-semibold", getTextColor(val))}>
                    {getLabel(val)}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div
                    className={cn("h-2 rounded-full transition-all", getColor(val))}
                    style={{ width: `${Math.max(pct, 5)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Latest comments */}
        {ratings.filter((r) => r.kommentar).length > 0 && (
          <div className="border-t border-border pt-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Kommentare
            </p>
            <div className="space-y-2">
              {ratings
                .filter((r) => r.kommentar)
                .slice(0, 3)
                .map((r) => (
                  <div key={r.id} className="text-xs">
                    <span className="font-medium">{r.author_name}:</span>{" "}
                    <span className="text-muted-foreground">
                      {r.kommentar}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
