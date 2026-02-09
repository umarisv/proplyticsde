"use client"

import { useState } from "react"
import { Plus, FileDown, MapPin, ArrowLeft, Save, Check, Loader2, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProplyticsLogo } from "@/components/proplytics-logo"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { generatePDFReport, downloadPDF } from "@/components/modules/analyse/pdf-report"
import { saveBewertung, updateBewertung } from "@/lib/api/bewertungen"
import { useAuth } from "@/hooks/use-auth"
import { LoginPromptModal } from "@/components/login-prompt-modal"
import { UserMenu } from "@/components/user-menu"
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
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  const handlePDFExport = () => {
    console.log("[v0] PDF Export clicked, resultData:", !!resultData, "formData:", !!formData)
    if (resultData && formData) {
      try {
        const htmlContent = generatePDFReport({ resultData, formData, address })
        console.log("[v0] PDF HTML generated, length:", htmlContent.length)
        downloadPDF(htmlContent, `Marktpreiseinschaetzung_${formData.plz}.pdf`)
        console.log("[v0] downloadPDF called successfully")
      } catch (err) {
        console.error("[v0] PDF generation error:", err)
      }
    } else {
      console.log("[v0] PDF Export skipped - missing data")
    }
  }

  const handleSave = async () => {
    console.log("[v0] Save clicked, resultData:", !!resultData, "formData:", !!formData, "user:", !!user)
    if (!resultData || !formData) return

    // Check if user is authenticated
    if (!user) {
      setShowLoginPrompt(true)
      return
    }

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
          userId: user.id,
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
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-card/95 px-4 py-3 backdrop-blur-md sm:px-6">
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
        <ProplyticsLogo size="sm" showText />
        <Badge variant="secondary" className="hidden sm:inline-flex text-xs">
          Analyse
        </Badge>
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
              <Link href="/portal">
                <Button variant="outline" size="sm">
                  <LayoutDashboard className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Portal</span>
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zum Dashboard wechseln</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

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

        <UserMenu />
      </div>

      <LoginPromptModal
        open={showLoginPrompt}
        onOpenChange={setShowLoginPrompt}
        title="Anmelden um zu speichern"
        description="Um Ihre Bewertung zu speichern und später darauf zugreifen zu können, benötigen Sie ein kostenloses Konto."
        feature="save"
      />
    </header>
  )
}
