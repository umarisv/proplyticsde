'use client'

/**
 * Risk Factors List
 * 
 * Displays identified risk factors from the evaluation.
 */

import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RiskFactor } from '@/lib/ai/investment-agents'

interface RiskFactorsListProps {
  riskFactors: RiskFactor[]
  className?: string
}

export function RiskFactorsList({ riskFactors, className }: RiskFactorsListProps) {
  if (riskFactors.length === 0) return null
  
  const levelConfig = {
    critical: {
      icon: AlertTriangle,
      bg: 'bg-red-50 dark:bg-red-950',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-300',
      iconColor: 'text-red-500',
      label: 'Kritisch',
    },
    high: {
      icon: AlertCircle,
      bg: 'bg-orange-50 dark:bg-orange-950',
      border: 'border-orange-200 dark:border-orange-800',
      text: 'text-orange-700 dark:text-orange-300',
      iconColor: 'text-orange-500',
      label: 'Hoch',
    },
    medium: {
      icon: Info,
      bg: 'bg-yellow-50 dark:bg-yellow-950',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-700 dark:text-yellow-300',
      iconColor: 'text-yellow-500',
      label: 'Mittel',
    },
    low: {
      icon: CheckCircle,
      bg: 'bg-blue-50 dark:bg-blue-950',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
      iconColor: 'text-blue-500',
      label: 'Niedrig',
    },
  }
  
  // Group by level
  const grouped = {
    critical: riskFactors.filter(r => r.level === 'critical'),
    high: riskFactors.filter(r => r.level === 'high'),
    medium: riskFactors.filter(r => r.level === 'medium'),
    low: riskFactors.filter(r => r.level === 'low'),
  }
  
  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-yellow-500" />
        Risiko-Faktoren
      </h3>
      
      <div className="space-y-2">
        {(['critical', 'high', 'medium', 'low'] as const).map((level) => {
          const factors = grouped[level]
          if (factors.length === 0) return null
          
          const config = levelConfig[level]
          const Icon = config.icon
          
          return (
            <div key={level} className="space-y-1">
              {factors.map((factor, i) => (
                <div
                  key={`${factor.category}-${i}`}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border',
                    config.bg,
                    config.border
                  )}
                >
                  <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', config.iconColor)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn('font-medium', config.text)}>
                        {factor.description}
                      </span>
                      <span className={cn(
                        'text-xs px-1.5 py-0.5 rounded',
                        config.bg,
                        config.text
                      )}>
                        {config.label}
                      </span>
                    </div>
                    {(factor.value !== undefined || factor.threshold !== undefined) && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {factor.value !== undefined && (
                          <span>Aktuell: {formatValue(factor.value, factor.category)}</span>
                        )}
                        {factor.threshold !== undefined && (
                          <span className="ml-2">Schwelle: {formatValue(factor.threshold, factor.category)}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function formatValue(value: number, category: string): string {
  if (category.includes('yield') || category.includes('rendite')) {
    return `${value.toFixed(1)}%`
  }
  if (category.includes('dscr')) {
    return value.toFixed(2)
  }
  if (category.includes('ltv') || category.includes('vacancy') || category.includes('leerstand')) {
    return `${value}%`
  }
  return String(value)
}
