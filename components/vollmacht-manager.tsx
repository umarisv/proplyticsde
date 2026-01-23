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

// Einfache Test-Version zuerst
export function VollmachtManager({ onVollmachtSelected, selectedBewertungId }: VollmachtManagerProps) {
  console.log('🔧 VollmachtManager wird gerendert!')

  return (
    <div className="p-6 border rounded-lg bg-card">
      <h2 className="text-2xl font-bold mb-4">🔑 Vollmacht-Management</h2>
      <p className="text-muted-foreground mb-4">
        Hier können Sie Vollmachten für automatische Finanzierungsprozesse hochladen.
      </p>

      <div className="space-y-4">
        <div className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            Vollmacht-Upload kommt bald...
          </p>
        </div>

        {selectedBewertungId && (
          <div className="p-4 bg-primary/10 rounded-lg">
            <p className="text-sm">
              ✅ Ausgewählte Bewertung: <code>{selectedBewertungId}</code>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Vollständige Implementierung auskommentiert für Test
/*
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

}