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
