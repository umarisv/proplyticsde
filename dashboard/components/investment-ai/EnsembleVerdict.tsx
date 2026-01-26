'use client'

/**
 * Ensemble Verdict
 * 
 * Displays the aggregated recommendation from all agents.
 */

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, HelpCircle, Users, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EnsembleResult } from '@/lib/ai/investment-agents'

interface EnsembleVerdictProps {
  result: EnsembleResult
  className?: string
}

export function EnsembleVerdict({ result, className }: EnsembleVerdictProps) {
  const verdictConfig = {
    go: {
      label: 'GO',
      description: 'Investment empfohlen',
      icon: CheckCircle,
      gradient: 'from-green-500 to-emerald-600',
      bg: 'bg-green-50 dark:bg-green-950',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-700 dark:text-green-300',
    },
    maybe: {
      label: 'MAYBE',
      description: 'Weiteres Underwriting nötig',
      icon: HelpCircle,
      gradient: 'from-yellow-500 to-orange-500',
      bg: 'bg-yellow-50 dark:bg-yellow-950',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-700 dark:text-yellow-300',
    },
    no_go: {
      label: 'NO-GO',
      description: 'Investment nicht empfohlen',
      icon: XCircle,
      gradient: 'from-red-500 to-rose-600',
      bg: 'bg-red-50 dark:bg-red-950',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-300',
    },
  }
  
  const config = verdictConfig[result.recommendation]
  const Icon = config.icon
  
  const agreeingCount = result.agentScores.filter(
    s => s.verdict === result.majorityVerdict
  ).length
  
  return (
    <Card className={cn(config.bg, config.border, 'border-2', className)}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Verdict Badge */}
          <div className="flex items-center gap-4">
            <div className={cn(
              'h-16 w-16 rounded-full flex items-center justify-center bg-gradient-to-br',
              config.gradient
            )}>
              <Icon className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className={cn('text-3xl font-bold', config.text)}>
                {config.label}
              </div>
              <div className="text-sm text-muted-foreground">
                {config.description}
              </div>
            </div>
          </div>
          
          {/* Score & Confidence */}
          <div className="flex-1 space-y-4">
            {/* Consensus Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Ensemble-Score
                </span>
                <span className="font-semibold">{result.consensusScore}/100</span>
              </div>
              <Progress 
                value={result.consensusScore} 
                className={cn(
                  'h-3',
                  result.recommendation === 'go' && '[&>div]:bg-green-500',
                  result.recommendation === 'maybe' && '[&>div]:bg-yellow-500',
                  result.recommendation === 'no_go' && '[&>div]:bg-red-500',
                )}
              />
            </div>
            
            {/* Consensus Info */}
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {result.consensus ? 'Einstimmig' : `${agreeingCount} von ${result.agentScores.length} Investoren`}
              </span>
              <span className="text-muted-foreground">
                Konfidenz: {Math.round(result.confidence * 100)}%
              </span>
            </div>
          </div>
        </div>
        
        {/* Dissent Section */}
        {result.dissent.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="text-sm font-medium mb-2">Abweichende Meinungen:</div>
            <div className="space-y-1">
              {result.dissent.map((d) => (
                <div key={d.agentId} className="text-sm flex items-center gap-2">
                  <span className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium',
                    d.verdict === 'go' && 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
                    d.verdict === 'maybe' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
                    d.verdict === 'no_go' && 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
                  )}>
                    {d.verdict.toUpperCase().replace('_', '-')}
                  </span>
                  <span className="font-medium">{d.agentName.split('(')[0].trim()}:</span>
                  <span className="text-muted-foreground">{d.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground">{result.summary}</p>
        </div>
      </CardContent>
    </Card>
  )
}
