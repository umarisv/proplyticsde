'use client'

/**
 * Custom Profile Editor
 * 
 * Allows users to create and edit their own investment agent profiles.
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Save, Copy, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  SYSTEM_AGENTS,
  CATEGORY_LABELS,
  type AgentProfile,
  type AgentProfileConfig,
  type AssetClass,
  type ScoringWeights,
} from '@/lib/ai/investment-agents'

interface CustomProfileEditorProps {
  profile?: AgentProfile
  onSave?: (profile: AgentProfile) => void
  onDelete?: (profileId: string) => void
  className?: string
}

export function CustomProfileEditor({
  profile,
  onSave,
  onDelete,
  className,
}: CustomProfileEditorProps) {
  const isNew = !profile
  
  // Form state
  const [name, setName] = useState(profile?.name ?? '')
  const [description, setDescription] = useState(profile?.description ?? '')
  const [baseProfile, setBaseProfile] = useState<string>('immocation')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Get base config from selected profile
  const baseConfig = profile?.config ?? SYSTEM_AGENTS[baseProfile]?.config ?? SYSTEM_AGENTS.immocation.config
  
  // Editable thresholds
  const [grossYieldMin, setGrossYieldMin] = useState(baseConfig.min_thresholds.gross_yield_hard_gate)
  const [dscrMin, setDscrMin] = useState(baseConfig.min_thresholds.dscr_min)
  const [ltvMax, setLtvMax] = useState(baseConfig.min_thresholds.ltv_max)
  const [goMin, setGoMin] = useState(baseConfig.decision_rules.go_min)
  const [maybeMin, setMaybeMin] = useState(baseConfig.decision_rules.maybe_min)
  
  // Editable weights (for ETW as example)
  const [weights, setWeights] = useState<ScoringWeights>(baseConfig.scoring_weights.ETW)
  
  const updateWeight = (category: string, value: number) => {
    setWeights(prev => ({ ...prev, [category]: value }))
  }
  
  // Normalize weights to sum to 100
  const normalizeWeights = (w: ScoringWeights): ScoringWeights => {
    const total = Object.values(w).reduce((sum, v) => sum + (v ?? 0), 0)
    if (total === 0) return w
    
    const normalized: ScoringWeights = {}
    for (const [key, value] of Object.entries(w)) {
      normalized[key] = Math.round((value ?? 0) / total * 100)
    }
    return normalized
  }
  
  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name ist erforderlich')
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const normalizedWeights = normalizeWeights(weights)
      
      const config: Partial<AgentProfileConfig> = {
        ...baseConfig,
        investor_name: name,
        min_thresholds: {
          gross_yield_screening: grossYieldMin + 0.5,
          gross_yield_hard_gate: grossYieldMin,
          dscr_min: dscrMin,
          ltv_target: ltvMax - 5,
          ltv_max: ltvMax,
        },
        decision_rules: {
          go_min: goMin,
          maybe_min: maybeMin,
          maybe_max: goMin - 1,
        },
        scoring_weights: {
          ETW: normalizedWeights,
          MFH: normalizedWeights,
          Gewerbe: baseConfig.scoring_weights.Gewerbe,
          Wohnportfolio: normalizedWeights,
        },
        hard_nogo_rules: baseConfig.hard_nogo_rules.map(rule => {
          if (rule.rule === 'gross_yield_below_minimum') {
            return { ...rule, value: grossYieldMin }
          }
          if (rule.rule === 'dscr_below_minimum') {
            return { ...rule, value: dscrMin }
          }
          return rule
        }),
      }
      
      const method = isNew ? 'POST' : 'PUT'
      const url = isNew 
        ? '/api/investment-ai/profiles'
        : `/api/investment-ai/profiles/${profile.id}`
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          baseProfileId: isNew ? baseProfile : undefined,
          config,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save profile')
      }
      
      onSave?.(data.profile)
      
    } catch (err) {
      setError(String(err))
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleDelete = async () => {
    if (!profile || !confirm('Profil wirklich löschen?')) return
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch(`/api/investment-ai/profiles/${profile.id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        onDelete?.(profile.id)
      }
    } catch (err) {
      setError(String(err))
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>
          {isNew ? 'Neues Investoren-Profil' : 'Profil bearbeiten'}
        </CardTitle>
        <CardDescription>
          Erstelle dein eigenes Investoren-Profil mit individuellen Schwellenwerten und Gewichtungen.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-destructive text-sm">
            {error}
          </div>
        )}
        
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mein Investoren-Profil"
            />
          </div>
          
          {isNew && (
            <div className="space-y-2">
              <Label>Basiert auf</Label>
              <Select value={baseProfile} onValueChange={setBaseProfile}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SYSTEM_AGENTS).map(([id, agent]) => (
                    <SelectItem key={id} value={id}>
                      <div className="flex items-center gap-2">
                        <Copy className="h-3 w-3" />
                        {agent.name.split('(')[0].trim()}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Beschreibung</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Kurze Beschreibung der Strategie..."
            rows={2}
          />
        </div>
        
        {/* Thresholds */}
        <div className="space-y-4">
          <h4 className="font-medium">Schwellenwerte</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gross Yield */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Min. Bruttomietrendite</Label>
                <span className="font-mono text-sm font-medium">{grossYieldMin}%</span>
              </div>
              <Slider
                value={[grossYieldMin]}
                onValueChange={([v]) => setGrossYieldMin(v)}
                min={3}
                max={10}
                step={0.5}
              />
              <p className="text-xs text-muted-foreground">
                Deals unter diesem Wert werden abgelehnt
              </p>
            </div>
            
            {/* DSCR */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Min. DSCR</Label>
                <span className="font-mono text-sm font-medium">{dscrMin.toFixed(2)}</span>
              </div>
              <Slider
                value={[dscrMin * 100]}
                onValueChange={([v]) => setDscrMin(v / 100)}
                min={100}
                max={150}
                step={5}
              />
              <p className="text-xs text-muted-foreground">
                Debt Service Coverage Ratio
              </p>
            </div>
            
            {/* LTV */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Max. LTV</Label>
                <span className="font-mono text-sm font-medium">{ltvMax}%</span>
              </div>
              <Slider
                value={[ltvMax]}
                onValueChange={([v]) => setLtvMax(v)}
                min={60}
                max={100}
                step={5}
              />
              <p className="text-xs text-muted-foreground">
                Loan-to-Value Ratio
              </p>
            </div>
          </div>
        </div>
        
        {/* Decision Rules */}
        <div className="space-y-4">
          <h4 className="font-medium">Entscheidungs-Schwellen</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>GO ab Score</Label>
                <span className="font-mono text-sm font-medium text-green-600">{goMin}</span>
              </div>
              <Slider
                value={[goMin]}
                onValueChange={([v]) => setGoMin(v)}
                min={60}
                max={90}
                step={5}
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>MAYBE ab Score</Label>
                <span className="font-mono text-sm font-medium text-yellow-600">{maybeMin}</span>
              </div>
              <Slider
                value={[maybeMin]}
                onValueChange={([v]) => setMaybeMin(v)}
                min={40}
                max={goMin - 5}
                step={5}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              GO: ≥{goMin}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              MAYBE: {maybeMin}-{goMin - 1}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              NO-GO: &lt;{maybeMin}
            </span>
          </div>
        </div>
        
        {/* Scoring Weights */}
        <div className="space-y-4">
          <h4 className="font-medium">Scoring-Gewichtung (ETW/MFH)</h4>
          <p className="text-sm text-muted-foreground">
            Gewichte werden automatisch auf 100% normalisiert.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(weights).map(([category, value]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">{CATEGORY_LABELS[category] ?? category}</Label>
                  <span className="font-mono text-xs">{value ?? 0}%</span>
                </div>
                <Slider
                  value={[value ?? 0]}
                  onValueChange={([v]) => updateWeight(category, v)}
                  min={0}
                  max={40}
                  step={5}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          {!isNew && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Löschen
            </Button>
          )}
          
          <div className="flex gap-2 ml-auto">
            <Button
              onClick={handleSave}
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isNew ? 'Erstellen' : 'Speichern'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
