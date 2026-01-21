"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

const data = [
  { name: "Dach", roi: 145, cost: 85000 },
  { name: "Fenster", roi: 120, cost: 45000 },
  { name: "Heizung", roi: 180, cost: 65000 },
  { name: "Fassade", roi: 95, cost: 120000 },
  { name: "Bäder", roi: 110, cost: 72000 },
]

export function ModernizationChart() {
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
          formatter={(value: number, name: string) => {
            if (name === "roi") {
              return [`${value}% ROI`, "Rendite"]
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
