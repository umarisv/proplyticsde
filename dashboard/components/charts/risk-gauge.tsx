"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { RiskAnalysisResult } from "@/lib/risk-engine"

interface RiskGaugeProps {
  riskData: RiskAnalysisResult
}

export function RiskGauge({ riskData }: RiskGaugeProps) {
  const getColorClass = (score: number) => {
    if (score < 25) return "bg-green-500"
    if (score < 45) return "bg-yellow-500"
    if (score < 65) return "bg-orange-500"
    return "bg-red-500"
  }

  const getTextColorClass = (score: number) => {
    if (score < 25) return "text-green-600"
    if (score < 45) return "text-yellow-600"
    if (score < 65) return "text-orange-600"
    return "text-red-600"
  }

  const scores = [
    { label: "Gesamtrisiko", score: riskData.overallRiskScore, description: "Aggregiertes Risiko" },
    { label: "Marktrisiko", score: riskData.marketRisk, description: "Marktvolatilität" },
    { label: "Objektrisiko", score: riskData.objectRisk, description: "Gebäude & Zustand" },
    { label: "Standortrisiko", score: riskData.locationRisk, description: "Lagequalität" },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          Risiko-Scores
          <span className={`text-2xl font-bold ${getTextColorClass(riskData.overallRiskScore)}`}>
            {riskData.overallRiskScore}/100
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {scores.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between mb-1">
              <div>
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-xs text-muted-foreground ml-2">({item.description})</span>
              </div>
              <span className={`text-sm font-semibold ${getTextColorClass(item.score)}`}>
                {item.score}
              </span>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`absolute left-0 top-0 h-full transition-all duration-500 ${getColorClass(item.score)}`}
                style={{ width: `${item.score}%` }}
              />
            </div>
          </div>
        ))}

        {/* Legende */}
        <div className="flex justify-between pt-3 border-t text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span>Niedrig</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span>Moderat</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-orange-500" />
            <span>Erhöht</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span>Hoch</span>
          </div>
        </div>

        {/* Kaufpreis-Wahrscheinlichkeit */}
        {riskData.probabilityAboveAsking > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs font-medium mb-1">Kaufpreis-Analyse</p>
            <p className="text-sm">
              Mit <span className="font-semibold text-primary">
                {(riskData.probabilityAboveAsking * 100).toFixed(1)}%
              </span> Wahrscheinlichkeit liegt der tatsächliche Marktwert über dem angegebenen Kaufpreis.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
