"use client"

import { useState, type ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Bot, FileText } from "lucide-react"

interface VollmachtManagerProps {
  selectedBewertungId?: string
}

export function VollmachtManager({ selectedBewertungId }: VollmachtManagerProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [lastFileName, setLastFileName] = useState<string | null>(null)

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setLastFileName(file.name)
    window.setTimeout(() => setIsUploading(false), 1200)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Vollmacht hochladen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="vollmacht-upload"
            />
            <label htmlFor="vollmacht-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isUploading ? "Hochladen..." : "Vollmacht auswählen"}
                </p>
                <p className="text-xs text-muted-foreground">PDF, DOC, DOCX (max. 10MB)</p>
              </div>
            </label>
          </div>
          {lastFileName && (
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-4 w-4" />
              {lastFileName}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            KI-Agent Finanzierung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Der KI-Agent fordert nach dem Upload automatisch fehlende Unterlagen an.
          </p>
          {selectedBewertungId && (
            <div className="rounded-lg bg-primary/10 p-3 text-sm">
              Ausgewählte Bewertung: <code>{selectedBewertungId}</code>
            </div>
          )}
          <Button className="w-full" disabled>
            KI-Agent starten (coming soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
