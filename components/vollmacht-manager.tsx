'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText, CheckCircle, XCircle, Bot, Zap } from 'lucide-react'
import { uploadVollmacht, getVollmachten, createFinanzierungsantrag, triggerKIAgent } from '@/lib/api/vollmachten'
import type { Vollmacht, Finanzierungsantrag } from '@/lib/database.types'

interface VollmachtManagerProps {
  onVollmachtSelected?: (vollmacht: Vollmacht) => void
  selectedBewertungId?: string
}

export function VollmachtManager({ onVollmachtSelected, selectedBewertungId }: VollmachtManagerProps) {
  const [vollmachten, setVollmachten] = useState<Vollmacht[]>([])
  const [antraege, setAntraege] = useState<Finanzierungsantrag[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedVollmacht, setSelectedVollmacht] = useState<Vollmacht | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    loadVollmachten()
    loadAntraege()
  }, [])

  const loadVollmachten = async () => {
    try {
      const { data, error } = await getVollmachten()
      if (error) throw error
      setVollmachten(data || [])
    } catch (error) {
      console.error('Fehler beim Laden der Vollmachten:', error)
    }
  }

  const loadAntraege = async () => {
    // TODO: Implement getAntraege API
    setAntraege([])
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const { data, error } = await uploadVollmacht(file)
      if (error) throw error

      await loadVollmachten()
      console.log('Vollmacht erfolgreich hochgeladen:', data)
    } catch (error) {
      console.error('Fehler beim Hochladen:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleKIAgent = async () => {
    if (!selectedVollmacht || !selectedBewertungId) return

    setIsProcessing(true)
    try {
      const { data, error } = await triggerKIAgent(selectedBewertungId, selectedVollmacht.id)
      if (error) throw error

      await loadAntraege()
      console.log('KI-Agent erfolgreich gestartet:', data)
    } catch (error) {
      console.error('Fehler beim KI-Agent:', error)
    } finally {
      setIsProcessing(false)
    }
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

      {/* Vollmachten Liste */}
      {vollmachten.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ihre Vollmachten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vollmachten.map((vollmacht) => (
                <div
                  key={vollmacht.id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedVollmacht?.id === vollmacht.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedVollmacht(vollmacht)}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{vollmacht.dateiname}</p>
                      <p className="text-sm text-muted-foreground">
                        Hochgeladen am {new Date(vollmacht.created_at).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  </div>
                  {selectedVollmacht?.id === vollmacht.id && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KI-Agent Start */}
      {selectedVollmacht && selectedBewertungId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              KI-Agent Finanzierung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <Bot className="h-4 w-4" />
                <AlertDescription>
                  Basierend auf Ihrer ausgewählten Vollmacht und Bewertung kann der KI-Agent automatisch
                  die erforderlichen Finanzierungsunterlagen anfordern.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleKIAgent}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    KI-Agent verarbeitet...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    KI-Agent starten
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Finanzierungsanträge */}
      {antraege.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Aktive Finanzierungsanträge</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {antraege.map((antrag) => (
                <div key={antrag.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Antrag #{antrag.id.slice(-8)}</p>
                    <p className="text-sm text-muted-foreground">
                      Status: {antrag.status} | {new Date(antrag.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <Badge variant={antrag.status === 'completed' ? 'default' : 'secondary'}>
                    {antrag.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
