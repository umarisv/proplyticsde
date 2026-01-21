"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { AnalyseFormData } from "@/lib/types"

interface ModernizationChartProps {
  formData?: AnalyseFormData
}

interface ModernizationItem {
  name: string
  roi: number
  cost: number
  priority: 'high' | 'medium' | 'low'
}

// Calculate modernization ROI based on building data
function calculateModernizationData(formData?: AnalyseFormData): ModernizationItem[] {
  if (!formData) {
    // Default static data
    return [
      { name: "Dach", roi: 145, cost: 85000, priority: 'high' },
      { name: "Fenster", roi: 120, cost: 45000, priority: 'medium' },
      { name: "Heizung", roi: 180, cost: 65000, priority: 'high' },
      { name: "Fassade", roi: 95, cost: 120000, priority: 'low' },
      { name: "Bäder", roi: 110, cost: 72000, priority: 'medium' },
    ]
  }

  const baujahr = parseInt(formData.baujahr) || 1970
  const gebaeudealter = 2024 - baujahr
  const wohnflaeche = parseFloat(formData.wohnflaeche) || 500
  const zustand = formData.zustand || 'durchschnitt'
  const energieeffizienz = formData.energieeffizienz || 'D'

  // Base costs per m²
  const baseCosts = {
    dach: 120, // €/m² Dachfläche (ca. 60% der Wohnfläche)
    fenster: 800, // € pro Fenster (ca. 1 Fenster pro 15m²)
    heizung: 80, // €/m² Wohnfläche
    fassade: 150, // €/m² Fassadenfläche (ca. 80% der Wohnfläche)
    baeder: 15000, // € pro Bad (ca. 1 Bad pro 80m² Wohnfläche)
  }

  // Calculate costs
  const dachflaeche = wohnflaeche * 0.6
  const fensterAnzahl = Math.ceil(wohnflaeche / 15)
  const fassadenflaeche = wohnflaeche * 0.8
  const baederAnzahl = Math.ceil(wohnflaeche / 80)

  const costs = {
    dach: Math.round(dachflaeche * baseCosts.dach),
    fenster: Math.round(fensterAnzahl * baseCosts.fenster),
    heizung: Math.round(wohnflaeche * baseCosts.heizung),
    fassade: Math.round(fassadenflaeche * baseCosts.fassade),
    baeder: Math.round(baederAnzahl * baseCosts.baeder),
  }

  // Calculate ROI based on building age, condition, and energy class
  const ageFactors = {
    dach: gebaeudealter > 40 ? 1.5 : gebaeudealter > 25 ? 1.2 : 0.8,
    fenster: gebaeudealter > 30 ? 1.4 : gebaeudealter > 20 ? 1.1 : 0.7,
    heizung: gebaeudealter > 20 ? 1.6 : gebaeudealter > 15 ? 1.2 : 0.6,
    fassade: gebaeudealter > 35 ? 1.3 : gebaeudealter > 25 ? 1.0 : 0.7,
    baeder: gebaeudealter > 25 ? 1.2 : gebaeudealter > 15 ? 1.0 : 0.8,
  }

  const zustandFactors: Record<string, number> = {
    neubau: 0.5,
    gepflegt: 0.8,
    durchschnitt: 1.0,
    sanierung: 1.3,
  }
  const zustandFaktor = zustandFactors[zustand] || 1.0

  // Energy efficiency impacts heating ROI significantly
  const energieFactors: Record<string, number> = {
    'A+': 0.4, 'A': 0.5, 'B': 0.7, 'C': 0.9, 'D': 1.1,
    'E': 1.3, 'F': 1.5, 'G': 1.7, 'H': 2.0, 'unbekannt': 1.2,
  }
  const energieFaktor = energieFactors[energieeffizienz] || 1.2

  // Base ROI values (in %)
  const baseROI = {
    dach: 100,
    fenster: 90,
    heizung: 120,
    fassade: 70,
    baeder: 85,
  }

  const data: ModernizationItem[] = [
    {
      name: "Dach",
      roi: Math.round(baseROI.dach * ageFactors.dach * zustandFaktor),
      cost: costs.dach,
      priority: ageFactors.dach > 1.3 ? 'high' : ageFactors.dach > 1.0 ? 'medium' : 'low',
    },
    {
      name: "Fenster",
      roi: Math.round(baseROI.fenster * ageFactors.fenster * zustandFaktor * (energieFaktor * 0.5 + 0.5)),
      cost: costs.fenster,
      priority: ageFactors.fenster > 1.2 ? 'high' : ageFactors.fenster > 0.9 ? 'medium' : 'low',
    },
    {
      name: "Heizung",
      roi: Math.round(baseROI.heizung * ageFactors.heizung * zustandFaktor * energieFaktor),
      cost: costs.heizung,
      priority: energieFaktor > 1.2 || ageFactors.heizung > 1.4 ? 'high' : energieFaktor > 0.9 ? 'medium' : 'low',
    },
    {
      name: "Fassade",
      roi: Math.round(baseROI.fassade * ageFactors.fassade * zustandFaktor * (energieFaktor * 0.3 + 0.7)),
      cost: costs.fassade,
      priority: ageFactors.fassade > 1.2 ? 'high' : ageFactors.fassade > 0.9 ? 'medium' : 'low',
    },
    {
      name: "Bäder",
      roi: Math.round(baseROI.baeder * ageFactors.baeder * zustandFaktor),
      cost: costs.baeder,
      priority: ageFactors.baeder > 1.1 ? 'high' : ageFactors.baeder > 0.9 ? 'medium' : 'low',
    },
  ]

  // Sort by ROI descending
  return data.sort((a, b) => b.roi - a.roi)
}

export function ModernizationChart({ formData }: ModernizationChartProps) {
  const data = useMemo(() => calculateModernizationData(formData), [formData])

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 260)" horizontal={false} />
        <XAxis
          type="number"
          stroke="oklch(0.65 0.01 90)"
          fontSize={10}
          tickLine={false}
          tickFormatter={(value) => `${value}%`}
        />
        <YAxis type="category" dataKey="name" stroke="oklch(0.65 0.01 90)" fontSize={10} tickLine={false} width={50} />
        <Tooltip
          contentStyle={{
            backgroundColor: "oklch(0.18 0.015 260)",
            border: "1px solid oklch(0.30 0.02 260)",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value: number, name: string, props: { payload?: ModernizationItem }) => {
            if (name === "roi") {
              const cost = props.payload?.cost || 0
              return [`${value}% ROI (Kosten: ${cost.toLocaleString('de-DE')} €)`, "Rendite"]
            }
            return [value, name]
          }}
        />
        <Bar dataKey="roi" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                entry.roi >= 140
                  ? "oklch(0.65 0.18 160)"
                  : entry.roi >= 110
                    ? "oklch(0.75 0.18 70)"
                    : "oklch(0.55 0.15 260)"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
