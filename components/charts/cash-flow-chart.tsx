"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const data = [
  { year: "J1", einnahmen: 156000, ausgaben: 137500, kumuliert: 18500 },
  { year: "J2", einnahmen: 160680, ausgaben: 138875, kumuliert: 40305 },
  { year: "J3", einnahmen: 165500, ausgaben: 140262, kumuliert: 65543 },
  { year: "J4", einnahmen: 170465, ausgaben: 141665, kumuliert: 94343 },
  { year: "J5", einnahmen: 175579, ausgaben: 143082, kumuliert: 126840 },
  { year: "J6", einnahmen: 180846, ausgaben: 144513, kumuliert: 163173 },
  { year: "J7", einnahmen: 186272, ausgaben: 145958, kumuliert: 203487 },
  { year: "J8", einnahmen: 191860, ausgaben: 147417, kumuliert: 247930 },
  { year: "J9", einnahmen: 197616, ausgaben: 148891, kumuliert: 296655 },
  { year: "J10", einnahmen: 203544, ausgaben: 150380, kumuliert: 349819 },
]

export function CashFlowChart() {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 260)" />
        <XAxis dataKey="year" stroke="oklch(0.65 0.01 90)" fontSize={10} tickLine={false} />
        <YAxis
          stroke="oklch(0.65 0.01 90)"
          fontSize={10}
          tickLine={false}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "oklch(0.18 0.015 260)",
            border: "1px solid oklch(0.30 0.02 260)",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value: number) => [`${value.toLocaleString("de-DE")} €`, ""]}
        />
        <Legend wrapperStyle={{ fontSize: "10px" }} iconSize={8} />
        <Line
          type="monotone"
          dataKey="einnahmen"
          name="Einnahmen"
          stroke="oklch(0.65 0.18 160)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="ausgaben"
          name="Ausgaben"
          stroke="oklch(0.75 0.18 70)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="kumuliert"
          name="Kumuliert"
          stroke="oklch(0.55 0.15 260)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
