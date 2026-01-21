"use client"

import { useState } from "react"
import { Building2, Plus, FileDown, MapPin, ArrowLeft, Save, Check, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { generatePDFReport, downloadPDF } from "@/components/modules/analyse/pdf-report"
import { saveBewertung, updateBewertung } from "@/lib/api/bewertungen"
import type { AnalyseResultData, AnalyseFormData } from "@/lib/types"

interface AnalyseHeaderProps {
  address: string
  onNewAnalysis: () => void
  resultData?: AnalyseResultData
  formData?: AnalyseFormData
  bewertungId?: string | null
  onSaved?: (id: string) => void
}

export function AnalyseHeader({ address, onNewAnalysis, resultData, formData, bewertungId, onSaved }: AnalyseHeaderProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handlePDFExport = () => {
    if (resultData && formData) {
      const htmlContent = generatePDFReport({ resultData, formData, address })
      downloadPDF(htmlContent, `Marktpreiseinschaetzung_${formData.plz}.pdf`)
    }
  }

  const handleSave = async () => {
    if (!resultData || !formData) return

    setIsSaving(true)
    setSaveSuccess(false)

    try {
      if (bewertungId) {
        // Update existing
        const { data, error } = await updateBewertung(bewertungId, {
          formData,
          resultData,
          adresse: address,
        })
        if (error) throw error
        if (data) onSaved?.(data.id)
      } else {
        // Create new
        const { data, error } = await saveBewertung({
          formData,
          resultData,
          adresse: address,
        })
        if (error) throw error
        if (data) onSaved?.(data.id)
      }
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (error) {
      console.error('Fehler beim Speichern:', error)
      alert('Fehler beim Speichern. Bitte versuchen Sie es erneut.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border bg-card/80 backdrop-blur-md">
      {/* Logo & Brand */}
      <div className="flex items-center gap-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/">
                <Button variant="ghost" size="icon" className="mr-2">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zurück zur Übersicht</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20">
          <Building2 className="w-5 h-5 text-primary" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold tracking-tight">Proplytics</span>
          <Badge variant="secondary" className="hidden sm:inline-flex text-xs">
            Analyse
          </Badge>
        </div>
      </div>

      {/* Address Display */}
      <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
        <MapPin className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">{address}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={onNewAnalysis}>
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Neue Analyse</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Neue Bewertung starten</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSave} 
                disabled={!resultData || !formData || isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 sm:mr-2 animate-spin" />
                ) : saveSuccess ? (
                  <Check className="w-4 h-4 sm:mr-2 text-green-500" />
                ) : (
                  <Save className="w-4 h-4 sm:mr-2" />
                )}
                <span className="hidden sm:inline">
                  {isSaving ? 'Speichern...' : saveSuccess ? 'Gespeichert!' : 'Speichern'}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bewertung speichern</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handlePDFExport} 
                disabled={!resultData || !formData}
              >
                <FileDown className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">PDF Export</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Marktpreiseinschätzung als PDF herunterladen</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  )
}
