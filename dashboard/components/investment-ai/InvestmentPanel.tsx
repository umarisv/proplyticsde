'use client'

/**
 * Investment Panel
 * 
 * Main component for multi-agent investment evaluation.
 * Displays ensemble recommendation, individual agent scores, and risk factors.
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, AlertTriangle, CheckCircle, XCircle, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EnsembleResult, PropertyEvaluationInput, Verdict } from '@/lib/ai/investment-agents'
import { AgentCard } from './AgentCard'
import { EnsembleVerdict } from './EnsembleVerdict'
import { FeedbackButtons } from './FeedbackButtons'
import { RiskFactorsList } from './RiskFactorsList'

interface InvestmentPanelProps {
  propertyData: PropertyEvaluationInput
  bewertungId?: string
  onEvaluationComplete?: (result: EnsembleResult) => void
  className?: string
}

export function InvestmentPanel({
  propertyData,
  bewertungId,
  onEvaluationComplete,
  className,
}: InvestmentPanelProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<EnsembleResult | null>(null)
  const [evaluationId, setEvaluationId] = useState<string | null>(null)
  
  const runEvaluation = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/investment-ai/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyData,
          bewertungId,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Evaluation failed')
      }
      
      setResult(data.result)
      setEvaluationId(data.evaluationId)
      onEvaluationComplete?.(data.result)
      
    } catch (err) {
      console.error('Evaluation error:', err)
      setError(String(err))
    } finally {
      setIsLoading(false)
    }
  }
  
  // Auto-run on mount if we have property data
  // useEffect(() => {
  //   if (propertyData.kaufpreis && !result && !isLoading) {
  //     runEvaluation()
  //   }
  // }, [propertyData])
  
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">Investment-Analyse</span>
              {result && (
                <VerdictBadge verdict={result.recommendation} size="sm" />
              )}
            </CardTitle>
            <CardDescription>
              Multi-Agenten Bewertung durch verschiedene Investoren-Strategien
            </CardDescription>
          </div>
          <Button
            onClick={runEvaluation}
            disabled={isLoading}
            variant={result ? 'outline' : 'default'}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analysiere...
              </>
            ) : result ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Neu bewerten
              </>
            ) : (
              'Jetzt analysieren'
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Fehler bei der Analyse</span>
            </div>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}
        
        {!result && !isLoading && !error && (
          <div className="text-center py-8 text-muted-foreground">
            <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Klicke auf &quot;Jetzt analysieren&quot; um die Investment-Bewertung zu starten.</p>
            <p className="text-sm mt-2">
              Die Analyse verwendet drei Investoren-Profile mit unterschiedlichen Strategien.
            </p>
          </div>
        )}
        
        {result && (
          <>
            {/* Ensemble Verdict */}
            <EnsembleVerdict result={result} />
            
            {/* Agent Comparison */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Investoren-Vergleich</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.agentScores.map((score) => (
                  <AgentCard key={score.agentId} score={score} />
                ))}
              </div>
            </div>
            
            {/* Risk Factors */}
            {result.riskFactors.length > 0 && (
              <RiskFactorsList riskFactors={result.riskFactors} />
            )}
            
            {/* Feedback */}
            {bewertungId && evaluationId && (
              <FeedbackButtons
                bewertungId={bewertungId}
                evaluationId={evaluationId}
                predictedVerdict={result.recommendation}
                predictedScore={result.consensusScore}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Helper Components
// ============================================================================

interface VerdictBadgeProps {
  verdict: Verdict
  size?: 'sm' | 'md' | 'lg'
}

export function VerdictBadge({ verdict, size = 'md' }: VerdictBadgeProps) {
  const config = {
    go: {
      label: 'GO',
      icon: CheckCircle,
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    },
    maybe: {
      label: 'MAYBE',
      icon: HelpCircle,
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    },
    no_go: {
      label: 'NO-GO',
      icon: XCircle,
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    },
  }
  
  const { label, icon: Icon, className } = config[verdict]
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  }
  
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }
  
  return (
    <span className={cn(
      'inline-flex items-center font-semibold rounded-full',
      className,
      sizeClasses[size]
    )}>
      <Icon className={iconSizes[size]} />
      {label}
    </span>
  )
}
