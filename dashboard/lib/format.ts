/**
 * Centralized formatting utilities for consistent data display
 */

export function formatCurrency(value: number, options?: { compact?: boolean }): string {
  if (options?.compact && Math.abs(value) >= 1000000) {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value)
  }
  
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value: number, decimals = 2): string {
  return value.toFixed(decimals).replace(".", ",") + "%"
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatArea(value: number): string {
  return `${formatNumber(value)} m²`
}

export function formatFactor(value: number): string {
  return `${value.toFixed(1)}x`
}

export function formatYears(value: number): string {
  return `${Math.round(value)} Jahre`
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}
