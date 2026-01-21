"use client"

import { useState } from "react"
import Link from "next/link"
import { formatCurrency } from "@/lib/format"
import { Building2, Eye, Pencil, Trash2, Copy, GitCompare, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Bewertung } from "@/lib/database.types"
import type { AnalyseResultData } from "@/lib/types"

interface BewertungenTableProps {
  bewertungen: Bewertung[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  onDelete: (id: string) => Promise<void>
  onDuplicate: (id: string) => Promise<void>
  isLoading?: boolean
}

const objektTypLabels: Record<string, string> = {
  mfh: "Mehrfamilienhaus",
  zfh: "Zweifamilienhaus",
  efh: "Einfamilienhaus",
  etw: "Eigentumswohnung",
  wgh: "Wohn-/Geschäftshaus",
}

export function BewertungenTable({
  bewertungen,
  selectedIds,
  onSelectionChange,
  onDelete,
  onDuplicate,
  isLoading,
}: BewertungenTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(bewertungen.map(b => b.id))
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id])
    } else {
      onSelectionChange(selectedIds.filter(i => i !== id))
    }
  }

  const handleDelete = async () => {
    if (deleteId) {
      await onDelete(deleteId)
      setDeleteId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getErgebnisse = (ergebnisse: unknown): AnalyseResultData | null => {
    if (!ergebnisse || typeof ergebnisse !== 'object') return null
    return ergebnisse as AnalyseResultData
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Lade Bewertungen...</p>
        </div>
      </div>
    )
  }

  if (bewertungen.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Building2 className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">Keine Bewertungen vorhanden</h3>
        <p className="text-muted-foreground mt-1">
          Erstellen Sie Ihre erste Immobilienbewertung
        </p>
        <Link href="/analyse" className="mt-4">
          <Button>Neue Analyse starten</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === bewertungen.length && bewertungen.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Objekttyp</TableHead>
              <TableHead className="text-right">Marktwert</TableHead>
              <TableHead className="text-right">Rendite</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {bewertungen.map((bewertung) => {
              const ergebnisse = getErgebnisse(bewertung.ergebnisse)
              const marktwert = ergebnisse?.marktwert || 0
              const rendite = ergebnisse?.bruttoRendite || 0

              return (
                <TableRow key={bewertung.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(bewertung.id)}
                      onCheckedChange={(checked) => handleSelectOne(bewertung.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{bewertung.adresse || '-'}</div>
                      <div className="text-xs text-muted-foreground">
                        {bewertung.plz} {bewertung.stadt}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {objektTypLabels[bewertung.objekttyp || ''] || bewertung.objekttyp || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(marktwert)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={rendite >= 4 ? 'text-green-600' : rendite >= 3 ? 'text-yellow-600' : 'text-red-600'}>
                      {rendite.toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(bewertung.created_at)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/analyse?id=${bewertung.id}`} className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            Ansehen
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/analyse?id=${bewertung.id}&edit=true`} className="flex items-center">
                            <Pencil className="mr-2 h-4 w-4" />
                            Bearbeiten
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDuplicate(bewertung.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplizieren
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteId(bewertung.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {selectedIds.length > 1 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-card border rounded-lg shadow-lg px-4 py-3 flex items-center gap-4">
          <span className="text-sm font-medium">{selectedIds.length} ausgewählt</span>
          <Link href={`/vergleich?ids=${selectedIds.join(',')}`}>
            <Button size="sm">
              <GitCompare className="w-4 h-4 mr-2" />
              Vergleichen
            </Button>
          </Link>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bewertung löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Die Bewertung wird dauerhaft gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
