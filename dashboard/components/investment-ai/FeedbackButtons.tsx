'use client'

/**
 * Feedback Buttons
 * 
 * Allows users to provide feedback on evaluations for learning.
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ThumbsUp, ThumbsDown, CheckCircle, Loader2, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Verdict, DealOutcome } from '@/lib/ai/investment-agents'

interface FeedbackButtonsProps {
  bewertungId: string
  evaluationId: string
  predictedVerdict: Verdict
  predictedScore: number
  agentId?: string
  className?: string
  onFeedbackSubmitted?: () => void
}

export function FeedbackButtons({
  bewertungId,
  evaluationId,
  predictedVerdict,
  predictedScore,
  agentId,
  className,
  onFeedbackSubmitted,
}: FeedbackButtonsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState<string | null>(null)
  const [showOutcome, setShowOutcome] = useState(false)
  const [selectedOutcome, setSelectedOutcome] = useState<DealOutcome | ''>('')
  
  const submitFeedback = async (feedbackType: 'thumbs_up' | 'thumbs_down' | 'deal_outcome', outcome?: DealOutcome) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/investment-ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bewertungId,
          evaluationId,
          agentId,
          feedbackType,
          predictedVerdict,
          predictedScore,
          actualOutcome: outcome,
        }),
      })
      
      if (response.ok) {
        setSubmitted(feedbackType)
        onFeedbackSubmitted?.()
      }
    } catch (error) {
      console.error('Feedback error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (submitted) {
    return (
      <Card className={cn('bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800', className)}>
        <CardContent className="p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-700 dark:text-green-300 font-medium">
            Danke für dein Feedback! Es hilft der KI zu lernen.
          </span>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className={cn('border-dashed', className)}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Thumbs Feedback */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              War diese Bewertung hilfreich?
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => submitFeedback('thumbs_up')}
                disabled={isSubmitting}
                className="hover:bg-green-50 hover:text-green-600 hover:border-green-300"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ThumbsUp className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => submitFeedback('thumbs_down')}
                disabled={isSubmitting}
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ThumbsDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Divider */}
          <div className="hidden sm:block h-8 w-px bg-border" />
          
          {/* Outcome Tracking */}
          <div className="flex items-center gap-2">
            {!showOutcome ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOutcome(true)}
                className="text-muted-foreground"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Deal-Outcome melden
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Select
                  value={selectedOutcome}
                  onValueChange={(value) => setSelectedOutcome(value as DealOutcome)}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Was ist passiert?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="purchased">Gekauft</SelectItem>
                    <SelectItem value="rejected">Abgelehnt</SelectItem>
                    <SelectItem value="negotiated">Nachverhandelt</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={() => {
                    if (selectedOutcome) {
                      submitFeedback('deal_outcome', selectedOutcome)
                    }
                  }}
                  disabled={!selectedOutcome || isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Speichern'
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
