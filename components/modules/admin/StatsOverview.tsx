"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Euro, Building2, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"

const STATS = [
  {
    title: "Gesamt-Umsatz",
    value: "42.850 €",
    change: "+12.5%",
    trend: "up",
    icon: Euro
  },
  {
    title: "Aktive Nutzer",
    value: "1.240",
    change: "+18.2%",
    trend: "up",
    icon: Users
  },
  {
    title: "Neue Bewertungen",
    value: "456",
    change: "-4.1%",
    trend: "down",
    icon: Building2
  },
  {
    title: "Provisions-Einnahmen",
    value: "3.120 €",
    change: "+22.4%",
    trend: "up",
    icon: TrendingUp
  }
]

export function StatsOverview() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {stat.title}
            </CardTitle>
            <stat.icon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center gap-1 mt-1">
              {stat.trend === "up" ? (
                <ArrowUpRight className="w-3 h-3 text-green-500" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-red-500" />
              )}
              <span className={`text-xs font-medium ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                {stat.change}
              </span>
              <span className="text-[10px] text-muted-foreground ml-1">vs. Vormonat</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
