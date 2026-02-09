"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Mail, Shield } from "lucide-react"

const MOCK_USERS = [
  { id: "1", name: "Max Mustermann", email: "max@example.de", plan: "Pro", joined: "12.01.2026", status: "Aktiv" },
  { id: "2", name: "Sarah Schmidt", email: "sarah@schmidt.de", plan: "Free", joined: "15.01.2026", status: "Aktiv" },
  { id: "3", name: "Thomas Müller", email: "t.mueller@immobilien.de", plan: "Enterprise", joined: "05.01.2026", status: "Aktiv" },
  { id: "4", name: "Julia Wagner", email: "julia.w@web.de", plan: "Pro", joined: "20.01.2026", status: "Inaktiv" },
]

export function UserTable() {
  return (
    <div className="rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>E-Mail</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Beigetreten</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_USERS.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.plan === "Enterprise" ? "default" : user.plan === "Pro" ? "secondary" : "outline"}>
                  {user.plan}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{user.joined}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${user.status === "Aktiv" ? "bg-green-500" : "bg-red-500"}`} />
                  <span className="text-sm">{user.status}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
