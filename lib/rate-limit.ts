const STORAGE_KEY = 'proplytics_anonymous_usage'
const MAX_DAILY_EVALUATIONS = 2

interface UsageData {
  date: string
  count: number
}

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

function getUsageData(): UsageData {
  if (typeof window === 'undefined') {
    return { date: getToday(), count: 0 }
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return { date: getToday(), count: 0 }
    }
    
    const data: UsageData = JSON.parse(stored)
    
    // Reset if it's a new day
    if (data.date !== getToday()) {
      return { date: getToday(), count: 0 }
    }
    
    return data
  } catch {
    return { date: getToday(), count: 0 }
  }
}

function setUsageData(data: UsageData): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // localStorage might be full or disabled
  }
}

export function getRemainingEvaluations(): number {
  const usage = getUsageData()
  return Math.max(0, MAX_DAILY_EVALUATIONS - usage.count)
}

export function canPerformEvaluation(): boolean {
  return getRemainingEvaluations() > 0
}

export function recordEvaluation(): void {
  const usage = getUsageData()
  usage.count += 1
  setUsageData(usage)
}

export function getEvaluationCount(): number {
  return getUsageData().count
}

export function resetEvaluations(): void {
  setUsageData({ date: getToday(), count: 0 })
}

export const MAX_EVALUATIONS = MAX_DAILY_EVALUATIONS
