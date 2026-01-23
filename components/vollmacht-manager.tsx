'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileText, Bot, Zap } from 'lucide-react'

interface VollmachtManagerProps {
  onVollmachtSelected?: (vollmacht: any) => void
  selectedBewertungId?: string
}

export function VollmachtManager({ onVollmachtSelected, selectedBewertungId }: VollmachtManagerProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    // Simuliere Upload
    setTimeout(() => {
      setIsUploading(false)
      console.log('Vollmacht hochgeladen:', file.name)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Vollmacht-Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Vollmacht hochladen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {isUploading ? 'Hochladen...' : 'Klicken Sie hier, um eine Vollmacht hochzuladen'}
                  </p>
                  <p className="text-xs text-muted-foreground">PDF, DOC, DOCX (max. 10MB)</p>
                </div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            KI-Agent Finanzierung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Der KI-Agent kann automatisch Finanzierungsunterlagen anfordern,
              sobald eine Vollmacht hochgeladen wurde.
            </p>

            {selectedBewertungId && (
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-sm">
                  Ausgewählte Bewertung: <code>{selectedBewertungId}</code>
                </p>
              </div>
            )}

            <Button className="w-full" disabled>
              <Zap className="w-4 h-4 mr-2" />
              KI-Agent (noch nicht verfügbar)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
