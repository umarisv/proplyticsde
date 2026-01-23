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
  const [finanzierungsantraege, setFinanzierungsantraege] = useState<Finanzierungsantrag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    permissions: [] as string[]
  })

  // KI-Agent State
  const [kiAgentRunning, setKiAgentRunning] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [vollmachtenResult, antraegeResult] = await Promise.all([
        getVollmachten(),
        // getFinanzierungsantraege() // Noch nicht implementiert
        { data: [], error: null }
      ])

      if (vollmachtenResult.error) throw vollmachtenResult.error
      if (antraegeResult.error) throw antraegeResult.error

      setVollmachten(vollmachtenResult.data || [])
      setFinanzierungsantraege(antraegeResult.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async () => {
    if (!uploadForm.file) {
      setError('Bitte wählen Sie eine Datei aus')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const result = await uploadVollmacht({
        file: uploadForm.file,
        validFrom: uploadForm.validFrom,
        validUntil: uploadForm.validUntil || undefined,
        permissions: uploadForm.permissions
      })

      if (result.error) throw result.error

      setSuccess('Vollmacht erfolgreich hochgeladen!')
      setVollmachten(prev => [result.data!, ...prev])

      // Reset form
      setUploadForm({
        file: null,
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
        permissions: []
      })

      // Trigger file input reset
      const fileInput = document.getElementById('vollmacht-file') as HTMLInputElement
      if (fileInput) fileInput.value = ''

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload fehlgeschlagen')
    } finally {
      setUploading(false)
    }
  }

  const handleKIAgentStart = async (antragId: string) => {
    setKiAgentRunning(antragId)
    try {
      const result = await triggerKIAgent(antragId)

      if (result.success) {
        setSuccess(result.message)
        // Reload data to show updated status
        await loadData()
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('KI-Agent Fehler')
    } finally {
      setKiAgentRunning(null)
    }
  }

  const startFinanzierungsprozess = async () => {
    if (!selectedBewertungId) {
      setError('Bitte wählen Sie zuerst eine Bewertung aus')
      return
    }

    try {
      const result = await createFinanzierungsantrag({
        bewertungId: selectedBewertungId,
        bankName: 'Automatische Bankauswahl',
        dokumenteRequired: ['vollmacht', 'einkommensnachweis', 'schufa']
      })

      if (result.error) throw result.error

      setSuccess('Finanzierungsantrag erstellt! KI-Agent wird gestartet...')

      // KI-Agent automatisch starten
      if (result.data) {
        await handleKIAgentStart(result.data.id)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Erstellen des Antrags')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Lade Vollmacht-Management...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Vollmacht Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Vollmacht hochladen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="vollmacht-file">Vollmacht-Datei</Label>
            <Input
              id="vollmacht-file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setUploadForm(prev => ({ ...prev, file }))
                }
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valid-from">Gültig ab</Label>
              <Input
                id="valid-from"
                type="date"
                value={uploadForm.validFrom}
                onChange={(e) => setUploadForm(prev => ({ ...prev, validFrom: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="valid-until">Gültig bis (optional)</Label>
              <Input
                id="valid-until"
                type="date"
                value={uploadForm.validUntil}
                onChange={(e) => setUploadForm(prev => ({ ...prev, validUntil: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="permissions">Berechtigungen (kommasepariert)</Label>
            <Input
              id="permissions"
              placeholder="z.B. dokumente_beantragen, finanzierung_starten"
              value={uploadForm.permissions.join(', ')}
              onChange={(e) => setUploadForm(prev => ({
                ...prev,
                permissions: e.target.value.split(',').map(p => p.trim()).filter(p => p)
              }))}
            />
          </div>

          <Button
            onClick={handleFileUpload}
            disabled={uploading || !uploadForm.file}
            className="w-full"
          >
            {uploading ? 'Lädt hoch...' : 'Vollmacht hochladen'}
          </Button>
        </CardContent>
      </Card>

      {/* Vollmachten Liste */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Ihre Vollmachten ({vollmachten.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vollmachten.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Noch keine Vollmachten hochgeladen
            </p>
          ) : (
            <div className="space-y-3">
              {vollmachten.map((vollmacht) => (
                <div
                  key={vollmacht.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => onVollmachtSelected?.(vollmacht)}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{vollmacht.file_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Gültig bis: {vollmacht.valid_until || 'Unbefristet'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={vollmacht.status === 'aktiv' ? 'default' : 'secondary'}>
                      {vollmacht.status}
                    </Badge>
                    {vollmacht.permissions.length > 0 && (
                      <Badge variant="outline">
                        {vollmacht.permissions.length} Berechtigungen
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Finanzierungsprozess starten */}
      {selectedBewertungId && vollmachten.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Finanzierungsprozess starten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Der KI-Agent analysiert Ihre Immobilie und beantragt automatisch alle erforderlichen Finanzierungsunterlagen.
            </p>

            <Button
              onClick={startFinanzierungsprozess}
              className="w-full"
              size="lg"
            >
              <Bot className="h-5 w-5 mr-2" />
              KI-Agent starten
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Finanzierungsanträge Status */}
      {finanzierungsantraege.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Finanzierungsanträge</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {finanzierungsantraege.map((antrag) => (
                <div key={antrag.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{antrag.bank_name}</h4>
                    <Badge variant={
                      antrag.status === 'genehmigt' ? 'default' :
                      antrag.status === 'abgelehnt' ? 'destructive' :
                      'secondary'
                    }>
                      {antrag.status}
                    </Badge>
                  </div>

                  {antrag.ki_agent_status && (
                    <div className="mb-2">
                      <Badge variant="outline" className="text-xs">
                        KI-Agent: {antrag.ki_agent_status}
                      </Badge>
                    </div>
                  )}

                  {antrag.ki_agent_notes && (
                    <p className="text-sm text-muted-foreground">
                      {antrag.ki_agent_notes}
                    </p>
                  )}

                  {antrag.ki_agent_status === 'idle' && (
                    <Button
                      size="sm"
                      onClick={() => handleKIAgentStart(antrag.id)}
                      disabled={kiAgentRunning === antrag.id}
                      className="mt-2"
                    >
                      <Bot className="h-4 w-4 mr-1" />
                      {kiAgentRunning === antrag.id ? 'Läuft...' : 'KI-Agent starten'}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}