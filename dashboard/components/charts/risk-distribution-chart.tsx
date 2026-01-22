"use client"

import { useMemo } from "react"
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { RiskAnalysisResult } from "@/lib/risk-engine"

interface RiskDistributionChartProps {
  riskData: RiskAnalysisResult
  marktwert: number
  kaufpreis?: number
}

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M €`
  }
  return `${(value / 1000).toFixed(0)}k €`
}

const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`

export function RiskDistributionChart({ riskData, marktwert, kaufpreis }: RiskDistributionChartProps) {
  const chartData = useMemo(() => {
    return riskData.distribution.map(d => ({
      ...d,
      value: d.value,
      probability: d.probability * 100, // In Prozent
    }))
  }, [riskData.distribution])

  const riskColorMap = {
    niedrig: "bg-green-500",
    moderat: "bg-yellow-500",
    erhöht: "bg-orange-500",
    hoch: "bg-red-500",
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Wahrscheinlichkeitsverteilung</CardTitle>
            <CardDescription>Monte-Carlo-Simulation (n=10.000)</CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className={`${riskColorMap[riskData.riskCategory]} text-white border-0`}
          >
            Risiko: {riskData.riskCategory}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorProbability" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="value" 
                tickFormatter={formatCurrency}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tickFormatter={(v) => `${v.toFixed(1)}%`}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={45}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(2)}%`, 'Wahrscheinlichkeit']}
                labelFormatter={(value) => formatCurrency(value as number)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              {/* Marktwert Linie */}
              <ReferenceLine 
                x={marktwert} 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{ 
                  value: 'Marktwert', 
                  position: 'top',
                  fontSize: 10,
                  fill: 'hsl(var(--primary))'
                }}
              />
              {/* Kaufpreis Linie (falls vorhanden) */}
              {kaufpreis && kaufpreis > 0 && (
                <ReferenceLine 
                  x={kaufpreis} 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{ 
                    value: 'Kaufpreis', 
                    position: 'top',
                    fontSize: 10,
                    fill: 'hsl(var(--destructive))'
                  }}
                />
              )}
              {/* Konfidenzintervall 90% */}
              <ReferenceLine 
                x={riskData.confidence90.min} 
                stroke="hsl(var(--muted-foreground))" 
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <ReferenceLine 
                x={riskData.confidence90.max} 
                stroke="hsl(var(--muted-foreground))" 
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <Area
                type="monotone"
                dataKey="probability"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#colorProbability)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Statistiken */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">5. Perzentil</p>
            <p className="text-sm font-semibold">{formatCurrency(riskData.percentiles.p5)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Median (50%)</p>
            <p className="text-sm font-semibold">{formatCurrency(riskData.percentiles.p50)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Erwartungswert</p>
            <p className="text-sm font-semibold text-primary">{formatCurrency(riskData.expectedValue)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">95. Perzentil</p>
            <p className="text-sm font-semibold">{formatCurrency(riskData.percentiles.p95)}</p>
          </div>
        </div>

        {/* Konfidenzintervalle */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs font-medium mb-2">Konfidenzintervalle</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">90% Konfidenz:</span>
              <span>{formatCurrency(riskData.confidence90.min)} - {formatCurrency(riskData.confidence90.max)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">95% Konfidenz:</span>
              <span>{formatCurrency(riskData.confidence95.min)} - {formatCurrency(riskData.confidence95.max)}</span>
            </div>
          </div>
        </div>

        {/* Risikofaktoren */}
        {riskData.riskFactors.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium mb-2">Identifizierte Risikofaktoren</p>
            <div className="space-y-2">
              {riskData.riskFactors.map((factor, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div>
                    <p className="text-xs font-medium">{factor.name}</p>
                    <p className="text-xs text-muted-foreground">{factor.description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {factor.impact}% Impact
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
