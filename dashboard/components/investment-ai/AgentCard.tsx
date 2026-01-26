'use client'

/**
 * Agent Card
 * 
 * Displays a single agent's score with verdict and key metrics.
 */

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AlertTriangle, CheckCircle, XCircle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { AgentScore, Verdict } from '@/lib/ai/investment-agents'

interface AgentCardProps {
  score: AgentScore
  className?: string
}

export function AgentCard({ score, className }: AgentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const verdictConfig = {
    go: {
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-950',
      border: 'border-green-200 dark:border-green-800',
    },
    maybe: {
      icon: HelpCircle,
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-50 dark:bg-yellow-950',
      border: 'border-yellow-200 dark:border-yellow-800',
    },
    no_go: {
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950',
      border: 'border-red-200 dark:border-red-800',
    },
  }
  
  const config = verdictConfig[score.verdict]
  const VerdictIcon = config.icon
  
  // Extract minimum yield from agent name
  const getMinYield = () => {
    if (score.agentId === 'immocation') return '4.5%'
    if (score.agentId === 'hoerhan') return '5.0%'
    if (score.agentId === 'raue') return '6.0%'
    return '5.0%'
  }
  
  // Get short agent name
  const getShortName = () => {
    if (score.agentName.includes('immocation')) return 'immocation'
    if (score.agentName.includes('Hörhan')) return 'Hörhan'
    if (score.agentName.includes('Raue')) return 'Raue'
    return score.agentName.split(' ')[0]
  }
  
  return (
    <Card className={cn(config.bg, config.border, 'border', className)}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">{getShortName()}</div>
          <div className={cn('flex items-center gap-1', config.color)}>
            <VerdictIcon className="h-5 w-5" />
            <span className="font-bold">{score.verdict.toUpperCase().replace('_', '-')}</span>
          </div>
        </div>
        
        {/* Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Score</span>
            <span className="font-semibold">{score.totalScore}/100</span>
          </div>
          <Progress 
            value={score.totalScore} 
            className={cn(
              'h-2',
              score.verdict === 'go' && '[&>div]:bg-green-500',
              score.verdict === 'maybe' && '[&>div]:bg-yellow-500',
              score.verdict === 'no_go' && '[&>div]:bg-red-500',
            )}
          />
        </div>
        
        {/* Minimum Yield */}
        <div className="mt-3 text-sm text-muted-foreground">
          Min. Rendite: <span className="font-medium text-foreground">{getMinYield()}</span>
        </div>
        
        {/* Deal Killers */}
        {score.dealKillers.length > 0 && (
          <div className="mt-3 space-y-1">
            {score.dealKillers.slice(0, 2).map((dk, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{dk.label}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Expand/Collapse for details */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              Weniger anzeigen
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              Details anzeigen
            </>
          )}
        </button>
        
        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-3">
            {/* Category Scores */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase">Kategorie-Scores</div>
              {score.categoryScores.map((cs) => (
                <TooltipProvider key={cs.category}>
                  <Tooltip>
                    <TooltipTrigger className="w-full">
                      <div className="flex items-center justify-between text-xs">
                        <span className="truncate">{cs.label}</span>
                        <span className={cn(
                          'font-medium',
                          cs.score >= 70 && 'text-green-600',
                          cs.score >= 50 && cs.score < 70 && 'text-yellow-600',
                          cs.score < 50 && 'text-red-600',
                        )}>
                          {cs.score}
                        </span>
                      </div>
                      <Progress value={cs.score} className="h-1 mt-1" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{cs.explanation}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Gewicht: {cs.weight}%
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            
            {/* Thresholds Met */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground uppercase">Schwellenwerte</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <ThresholdBadge label="Rendite" met={score.thresholdsMet.grossYield} />
                <ThresholdBadge label="DSCR" met={score.thresholdsMet.dscr} />
                <ThresholdBadge label="LTV" met={score.thresholdsMet.ltv} />
              </div>
            </div>
            
            {/* Confidence */}
            <div className="text-xs text-muted-foreground">
              Konfidenz: {Math.round(score.confidence * 100)}%
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ThresholdBadge({ label, met }: { label: string; met: boolean }) {
  return (
    <div className={cn(
      'flex items-center justify-center gap-1 px-2 py-1 rounded',
      met ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
          : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    )}>
      {met ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {label}
    </div>
  )
}
