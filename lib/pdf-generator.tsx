"use client"

import React from "react"
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer"
import type { AnalyseResultData, AnalyseFormData } from "@/lib/types"

// Register fonts for professional appearance
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2",
      fontWeight: 600,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2",
      fontWeight: 700,
    },
  ],
})

// IRR calculation helper
function calculateIRR(cashflows: number[], guess = 0.1): number {
  const maxIterations = 100
  const tolerance = 0.0001
  let rate = guess

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0
    let dnpv = 0
    for (let j = 0; j < cashflows.length; j++) {
      npv += cashflows[j] / Math.pow(1 + rate, j)
      if (j > 0) {
        dnpv -= (j * cashflows[j]) / Math.pow(1 + rate, j + 1)
      }
    }
    if (Math.abs(npv) < tolerance) break
    if (dnpv === 0) break
    rate = rate - npv / dnpv
  }
  return rate * 100
}

// Professional color palette matching the design spec
const colors = {
  deepNavy: "#022b25",
  emerald: "#10b981",
  emeraldLight: "#d1fae5",
  softGray: "#f8fafc",
  mediumGray: "#64748b",
  lightGray: "#e2e8f0",
  white: "#ffffff",
  black: "#0f172a",
  success: "#16a34a",
  warning: "#f59e0b",
}

// Styles for PDF components
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Inter",
    fontSize: 10,
    color: colors.black,
    backgroundColor: colors.white,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.emerald,
  },
  logo: {
    flexDirection: "column",
  },
  logoText: {
    fontSize: 24,
    fontWeight: 700,
    color: colors.deepNavy,
  },
  logoSubtext: {
    fontSize: 10,
    color: colors.mediumGray,
    marginTop: 2,
  },
  headerInfo: {
    alignItems: "flex-end",
  },
  headerDate: {
    fontSize: 9,
    color: colors.mediumGray,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.deepNavy,
    marginTop: 4,
  },
  // Section styles
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.deepNavy,
  },
  sectionBadge: {
    fontSize: 8,
    color: colors.white,
    backgroundColor: colors.emerald,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginLeft: 10,
  },
  // Card styles
  card: {
    backgroundColor: colors.softGray,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  cardHighlight: {
    backgroundColor: colors.deepNavy,
    borderRadius: 8,
    padding: 20,
    marginBottom: 12,
  },
  // Grid layouts
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  col2: {
    width: "50%",
    paddingRight: 8,
  },
  col3: {
    width: "33.33%",
    paddingRight: 8,
  },
  col4: {
    width: "25%",
    paddingRight: 8,
  },
  // Data display
  dataItem: {
    marginBottom: 10,
  },
  dataLabel: {
    fontSize: 8,
    color: colors.mediumGray,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  dataValue: {
    fontSize: 12,
    fontWeight: 600,
    color: colors.black,
  },
  dataValueLarge: {
    fontSize: 18,
    fontWeight: 700,
    color: colors.deepNavy,
  },
  dataValueLight: {
    fontSize: 18,
    fontWeight: 700,
    color: colors.white,
  },
  // Valuation cards
  valuationCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 6,
    padding: 12,
    width: "31%",
    marginRight: "2%",
    marginBottom: 8,
  },
  valuationCardHighlight: {
    backgroundColor: colors.emeraldLight,
    borderWidth: 1,
    borderColor: colors.emerald,
    borderRadius: 6,
    padding: 12,
    width: "31%",
    marginRight: "2%",
    marginBottom: 8,
  },
  valuationLabel: {
    fontSize: 8,
    color: colors.mediumGray,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  valuationValue: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.deepNavy,
  },
  // Metrics
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  metricLabel: {
    fontSize: 10,
    color: colors.black,
  },
  metricValue: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.deepNavy,
  },
  metricValueGreen: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.success,
  },
  // Document checklist
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  checkIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.emerald,
    marginRight: 8,
  },
  pendingIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    marginRight: 8,
  },
  checklistText: {
    fontSize: 9,
    color: colors.black,
  },
  checklistCategory: {
    fontSize: 7,
    color: colors.mediumGray,
    marginLeft: 22,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  footerText: {
    fontSize: 8,
    color: colors.mediumGray,
  },
  pageNumber: {
    fontSize: 8,
    color: colors.mediumGray,
  },
  // Table styles
  table: {
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    paddingVertical: 8,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: colors.deepNavy,
    paddingBottom: 8,
    marginBottom: 4,
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    color: colors.black,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 8,
    fontWeight: 600,
    color: colors.mediumGray,
    textTransform: "uppercase",
  },
  // Notes section
  noteBox: {
    backgroundColor: colors.softGray,
    borderLeftWidth: 3,
    borderLeftColor: colors.emerald,
    padding: 12,
    marginTop: 12,
  },
  noteText: {
    fontSize: 9,
    color: colors.black,
    lineHeight: 1.5,
  },
  // Disclaimer
  disclaimer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: colors.softGray,
    borderRadius: 4,
  },
  disclaimerTitle: {
    fontSize: 9,
    fontWeight: 600,
    color: colors.mediumGray,
    marginBottom: 4,
  },
  disclaimerText: {
    fontSize: 8,
    color: colors.mediumGray,
    lineHeight: 1.4,
  },
})

// Helper functions for formatting (simplified versions for PDF)
function formatCurrencyPDF(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPercentPDF(value: number, decimals = 2): string {
  return value.toFixed(decimals).replace(".", ",") + "%"
}

function formatNumberPDF(value: number, decimals = 0): string {
  return new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: decimals,
  }).format(value)
}

interface FinanzierungsmappePDFProps {
  data: AnalyseResultData
  formData: AnalyseFormData
  address?: string
}

// Bank document checklist with categories
interface BankDocument {
  name: string
  status: "complete" | "pending" | "missing"
  category: "Rechtlich" | "Technisch" | "Wirtschaftlich"
  required: boolean
  description?: string
}

// Main PDF Document Component
export function FinanzierungsmappePDF({ data, formData, address }: FinanzierungsmappePDFProps) {
  const today = new Date().toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  // Comprehensive document checklist for banks (BelWertV compliant)
  const documents: BankDocument[] = [
    // Rechtliche Dokumente
    { name: "Grundbuchauszug (max. 3 Monate alt)", status: "complete", category: "Rechtlich", required: true },
    { name: "Flurkarte / Lageplan", status: "complete", category: "Rechtlich", required: true },
    { name: "Baulastenverzeichnis", status: "pending", category: "Rechtlich", required: true },
    { name: "Altlastenauskunft", status: "pending", category: "Rechtlich", required: false },
    { name: "Teilungserklärung (bei WEG)", status: "pending", category: "Rechtlich", required: formData.objekttyp === "etw" },
    // Technische Dokumente
    { name: "Energieausweis", status: "pending", category: "Technisch", required: true },
    { name: "Wohnflächenberechnung", status: "pending", category: "Technisch", required: true },
    { name: "Bauzeichnungen / Grundrisse", status: "pending", category: "Technisch", required: true },
    { name: "Objektfotos (Innen/Außen)", status: "complete", category: "Technisch", required: true },
    { name: "Baugenehmigung", status: "pending", category: "Technisch", required: false },
    // Wirtschaftliche Dokumente
    { name: "Mietverträge / Mietaufstellung", status: "pending", category: "Wirtschaftlich", required: true },
    { name: "Nebenkostenabrechnung", status: "pending", category: "Wirtschaftlich", required: false },
    { name: "Protokolle Eigentümerversammlung", status: "pending", category: "Wirtschaftlich", required: formData.objekttyp === "etw" },
    { name: "Wirtschaftsplan (bei WEG)", status: "pending", category: "Wirtschaftlich", required: formData.objekttyp === "etw" },
  ]

  const requiredDocs = documents.filter(d => d.required)
  const completedRequired = requiredDocs.filter((d) => d.status === "complete").length
  const totalRequired = requiredDocs.length
  const completionPercent = Math.round((completedRequired / totalRequired) * 100)

  // Calculate financial metrics
  const ltv = 80 // Default LTV
  const loanAmount = data.marktwert * (ltv / 100)
  const equityNeeded = data.marktwert - loanAmount
  const annualDebtService = data.monatsrate * 12
  const dscr = annualDebtService > 0 ? (data.jahresrohertrag / annualDebtService) : 0

  // Calculate IRR (10-year projection)
  const irrCashflows = [-equityNeeded]
  for (let i = 0; i < 10; i++) {
    irrCashflows.push(data.cashflowJahr * Math.pow(1.015, i))
  }
  // Exit value at year 10 (assuming 2% annual appreciation, less remaining loan)
  const exitValue = data.marktwert * Math.pow(1.02, 10)
  const remainingLoan = loanAmount * 0.7 // ~30% paid off after 10 years
  irrCashflows[10] += exitValue - remainingLoan
  const irr = calculateIRR(irrCashflows)

  return (
    <Document>
      {/* Page 1: Executive Summary & Property Profile */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>PROPLYTICS</Text>
            <Text style={styles.logoSubtext}>Immobilien-Finanzierungsmappe</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerDate}>Erstellt am {today}</Text>
            <Text style={styles.headerTitle}>Banken-Exposé</Text>
          </View>
        </View>

        {/* Executive Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            <Text style={styles.sectionBadge}>INVESTMENT HIGHLIGHT</Text>
          </View>

          <View style={styles.cardHighlight}>
            <View style={styles.row}>
              <View style={styles.col4}>
                <View style={styles.dataItem}>
                  <Text style={{ ...styles.dataLabel, color: colors.emeraldLight }}>GUTACHTERLICHER MARKTWERT</Text>
                  <Text style={styles.dataValueLight}>{formatCurrencyPDF(data.marktwert)}</Text>
                </View>
              </View>
              <View style={styles.col4}>
                <View style={styles.dataItem}>
                  <Text style={{ ...styles.dataLabel, color: colors.emeraldLight }}>BELEIHUNGSWERT (80% LTV)</Text>
                  <Text style={styles.dataValueLight}>{formatCurrencyPDF(loanAmount)}</Text>
                </View>
              </View>
              <View style={styles.col4}>
                <View style={styles.dataItem}>
                  <Text style={{ ...styles.dataLabel, color: colors.emeraldLight }}>NETTO-RENDITE</Text>
                  <Text style={styles.dataValueLight}>{formatPercentPDF(data.nettoRendite)}</Text>
                </View>
              </View>
              <View style={styles.col4}>
                <View style={styles.dataItem}>
                  <Text style={{ ...styles.dataLabel, color: colors.emeraldLight }}>CASHFLOW P.A.</Text>
                  <Text style={{ ...styles.dataValueLight, color: data.cashflowJahr >= 0 ? colors.emerald : "#f87171" }}>
                    {formatCurrencyPDF(data.cashflowJahr)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Key Investment Metrics Strip */}
          <View style={{ ...styles.card, marginTop: 8 }}>
            <View style={styles.row}>
              <View style={styles.col4}>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>IRR (10 JAHRE)</Text>
                  <Text style={{ ...styles.dataValue, color: colors.success }}>{formatPercentPDF(irr, 1)}</Text>
                </View>
              </View>
              <View style={styles.col4}>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>EIGENKAPITALRENDITE</Text>
                  <Text style={styles.dataValue}>{formatPercentPDF(data.eigenkapitalrendite)}</Text>
                </View>
              </View>
              <View style={styles.col4}>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>DSCR</Text>
                  <Text style={{ ...styles.dataValue, color: dscr >= 1.2 ? colors.success : colors.warning }}>
                    {dscr.toFixed(2)}x
                  </Text>
                </View>
              </View>
              <View style={styles.col4}>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>KAUFPREISFAKTOR</Text>
                  <Text style={styles.dataValue}>{data.faktor.toFixed(1)}x</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Property Profile */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Objektprofil</Text>
            <Text style={styles.sectionBadge}>{formData.objekttyp.toUpperCase()}</Text>
          </View>

          <View style={styles.card}>
            {address && (
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.dataLabel}>STANDORT</Text>
                <Text style={{ fontSize: 12, fontWeight: 600 }}>
                  {formData.plz} {formData.stadt}
                </Text>
                {address && <Text style={{ fontSize: 10, color: colors.mediumGray }}>{address}</Text>}
              </View>
            )}

            <View style={styles.row}>
              <View style={styles.col3}>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>WOHNFLÄCHE</Text>
                  <Text style={styles.dataValue}>{formData.wohnflaeche} m²</Text>
                </View>
              </View>
              <View style={styles.col3}>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>GRUNDSTÜCK</Text>
                  <Text style={styles.dataValue}>{formData.grundstueck} m²</Text>
                </View>
              </View>
              <View style={styles.col3}>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>BAUJAHR</Text>
                  <Text style={styles.dataValue}>{formData.baujahr}</Text>
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col3}>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>ZUSTAND</Text>
                  <Text style={styles.dataValue}>{formData.zustand}</Text>
                </View>
              </View>
              <View style={styles.col3}>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>ENERGIEEFFIZIENZ</Text>
                  <Text style={styles.dataValue}>{formData.energieeffizienz || "N/A"}</Text>
                </View>
              </View>
              <View style={styles.col3}>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>WOHNEINHEITEN</Text>
                  <Text style={styles.dataValue}>{formData.anzahlWohnungen || "1"}</Text>
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col3}>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>AUSSTATTUNG</Text>
                  <Text style={styles.dataValue}>{formData.ausstattung}</Text>
                </View>
              </View>
              <View style={styles.col3}>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>LAGE</Text>
                  <Text style={styles.dataValue}>{formData.lage}</Text>
                </View>
              </View>
              <View style={styles.col3}>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>STELLPLÄTZE</Text>
                  <Text style={styles.dataValue}>{formData.stellplaetze || "0"}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Valuation Methods */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Wertermittlung (BelWertV-konform)</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.valuationCardHighlight}>
              <Text style={styles.valuationLabel}>ERTRAGSWERT</Text>
              <Text style={styles.valuationValue}>{formatCurrencyPDF(data.ertragswert)}</Text>
              <Text style={{ fontSize: 8, color: colors.mediumGray, marginTop: 4 }}>
                Kapitalisierungszins: {formatPercentPDF(data.liegenschaftszins, 1)}
              </Text>
            </View>
            <View style={styles.valuationCard}>
              <Text style={styles.valuationLabel}>SACHWERT</Text>
              <Text style={styles.valuationValue}>{formatCurrencyPDF(data.sachwert)}</Text>
              <Text style={{ fontSize: 8, color: colors.mediumGray, marginTop: 4 }}>
                Marktanpassung: {formatPercentPDF((data.sachwertfaktor - 1) * 100, 0)}
              </Text>
            </View>
            <View style={styles.valuationCard}>
              <Text style={styles.valuationLabel}>VERGLEICHSWERT</Text>
              <Text style={styles.valuationValue}>{formatCurrencyPDF(data.marktwertMin)}</Text>
              <Text style={{ fontSize: 8, color: colors.mediumGray, marginTop: 4 }}>
                Spanne bis {formatCurrencyPDF(data.marktwertMax)}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Proplytics GmbH | Finanzierungsmappe | Vertraulich</Text>
          <Text style={styles.pageNumber}>Seite 1 von 3</Text>
        </View>
      </Page>

      {/* Page 2: Investment Metrics & Documents */}
      <Page size="A4" style={styles.page}>
        {/* Header on second page */}
        <View style={{ ...styles.header, marginBottom: 20 }}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>PROPLYTICS</Text>
            <Text style={styles.logoSubtext}>Investment Analytics</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerDate}>Seite 2</Text>
          </View>
        </View>

        {/* Investment Metrics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Investment-Kennzahlen</Text>
            <Text style={styles.sectionBadge}>BelWertV KONFORM</Text>
          </View>

          <View style={styles.row}>
            <View style={{ ...styles.col2, paddingRight: 16 }}>
              <View style={styles.card}>
                <Text style={{ fontSize: 10, fontWeight: 600, marginBottom: 12, color: colors.deepNavy }}>
                  Rendite & Performance
                </Text>
                
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Internal Rate of Return (IRR, 10J)</Text>
                  <Text style={styles.metricValueGreen}>{formatPercentPDF(irr, 1)}</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Brutto-Mietrendite</Text>
                  <Text style={styles.metricValue}>{formatPercentPDF(data.bruttoRendite)}</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Netto-Mietrendite</Text>
                  <Text style={styles.metricValueGreen}>{formatPercentPDF(data.nettoRendite)}</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Eigenkapitalrendite (EKR)</Text>
                  <Text style={styles.metricValue}>{formatPercentPDF(data.eigenkapitalrendite)}</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Kaufpreisfaktor</Text>
                  <Text style={styles.metricValue}>{data.faktor.toFixed(1)}x</Text>
                </View>
                <View style={{ ...styles.metricRow, borderBottomWidth: 0 }}>
                  <Text style={styles.metricLabel}>Mietmultiplikator</Text>
                  <Text style={styles.metricValue}>{data.mietmultiplikator.toFixed(1)}x</Text>
                </View>
              </View>
            </View>

            <View style={styles.col2}>
              <View style={styles.card}>
                <Text style={{ fontSize: 10, fontWeight: 600, marginBottom: 12, color: colors.deepNavy }}>
                  Finanzierungsstruktur
                </Text>
                
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Beleihungsauslauf (LTV)</Text>
                  <Text style={styles.metricValue}>{ltv}%</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Fremdkapital</Text>
                  <Text style={styles.metricValue}>{formatCurrencyPDF(loanAmount)}</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Eigenkapitalbedarf</Text>
                  <Text style={styles.metricValue}>{formatCurrencyPDF(equityNeeded)}</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Schuldendienstdeckung (DSCR)</Text>
                  <Text style={{ ...styles.metricValue, color: dscr >= 1.2 ? colors.success : colors.warning }}>
                    {dscr.toFixed(2)}x {dscr >= 1.2 ? "✓" : "⚠"}
                  </Text>
                </View>
                <View style={{ ...styles.metricRow, borderBottomWidth: 0 }}>
                  <Text style={styles.metricLabel}>Monatliche Annuität</Text>
                  <Text style={styles.metricValue}>{formatCurrencyPDF(data.monatsrate)}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Cashflow Table */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cashflow-Prognose</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>Position</Text>
                <Text style={styles.tableHeaderCell}>Monatlich</Text>
                <Text style={styles.tableHeaderCell}>Jährlich</Text>
              </View>
              
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Mieteinnahmen (Ist)</Text>
                <Text style={styles.tableCell}>{formatCurrencyPDF(data.istMiete)}</Text>
                <Text style={styles.tableCell}>{formatCurrencyPDF(data.istMiete * 12)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>./. Bewirtschaftungskosten</Text>
                <Text style={styles.tableCell}>{formatCurrencyPDF(data.bewirtschaftungskosten / 12)}</Text>
                <Text style={styles.tableCell}>{formatCurrencyPDF(data.bewirtschaftungskosten)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>./. Kapitaldienst</Text>
                <Text style={styles.tableCell}>{formatCurrencyPDF(data.monatsrate)}</Text>
                <Text style={styles.tableCell}>{formatCurrencyPDF(data.monatsrate * 12)}</Text>
              </View>
              <View style={{ ...styles.tableRow, borderBottomWidth: 2, borderBottomColor: colors.deepNavy }}>
                <Text style={{ ...styles.tableCell, fontWeight: 700 }}>= Cashflow</Text>
                <Text style={{ ...styles.tableCell, fontWeight: 700, color: data.cashflowMonat >= 0 ? colors.success : "#dc2626" }}>
                  {formatCurrencyPDF(data.cashflowMonat)}
                </Text>
                <Text style={{ ...styles.tableCell, fontWeight: 700, color: data.cashflowJahr >= 0 ? colors.success : "#dc2626" }}>
                  {formatCurrencyPDF(data.cashflowJahr)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Document Vault - Bank Checklist */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bank-Checkliste (Pflichtdokumente)</Text>
            <Text style={styles.sectionBadge}>{completionPercent}% VOLLSTÄNDIG</Text>
          </View>

          <View style={styles.card}>
            {/* Rechtliche Dokumente */}
            <Text style={{ fontSize: 9, fontWeight: 600, color: colors.deepNavy, marginBottom: 8 }}>
              📋 Rechtliche Dokumente
            </Text>
            <View style={styles.row}>
              {documents.filter(d => d.category === "Rechtlich" && d.required).map((doc, idx) => (
                <View key={idx} style={{ width: "50%", marginBottom: 4 }}>
                  <View style={styles.checklistItem}>
                    <View style={doc.status === "complete" ? styles.checkIcon : styles.pendingIcon} />
                    <Text style={{ ...styles.checklistText, color: doc.status === "complete" ? colors.black : colors.mediumGray }}>
                      {doc.name}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Technische Dokumente */}
            <Text style={{ fontSize: 9, fontWeight: 600, color: colors.deepNavy, marginBottom: 8, marginTop: 12 }}>
              🏗️ Technische Dokumente
            </Text>
            <View style={styles.row}>
              {documents.filter(d => d.category === "Technisch" && d.required).map((doc, idx) => (
                <View key={idx} style={{ width: "50%", marginBottom: 4 }}>
                  <View style={styles.checklistItem}>
                    <View style={doc.status === "complete" ? styles.checkIcon : styles.pendingIcon} />
                    <Text style={{ ...styles.checklistText, color: doc.status === "complete" ? colors.black : colors.mediumGray }}>
                      {doc.name}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Wirtschaftliche Dokumente */}
            <Text style={{ fontSize: 9, fontWeight: 600, color: colors.deepNavy, marginBottom: 8, marginTop: 12 }}>
              💰 Wirtschaftliche Dokumente
            </Text>
            <View style={styles.row}>
              {documents.filter(d => d.category === "Wirtschaftlich" && d.required).map((doc, idx) => (
                <View key={idx} style={{ width: "50%", marginBottom: 4 }}>
                  <View style={styles.checklistItem}>
                    <View style={doc.status === "complete" ? styles.checkIcon : styles.pendingIcon} />
                    <Text style={{ ...styles.checklistText, color: doc.status === "complete" ? colors.black : colors.mediumGray }}>
                      {doc.name}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Bank Requirements Note */}
          <View style={styles.noteBox}>
            <Text style={{ fontSize: 9, fontWeight: 600, color: colors.deepNavy, marginBottom: 4 }}>
              Was die Bank noch benötigt:
            </Text>
            <Text style={styles.noteText}>
              {completionPercent < 100 
                ? `Es fehlen noch ${totalRequired - completedRequired} Pflichtdokumente für eine vollständige Kreditprüfung. 
                   Bitte laden Sie die fehlenden Unterlagen hoch, um den Finanzierungsprozess zu beschleunigen.`
                : "Alle erforderlichen Dokumente sind vollständig vorhanden. Die Finanzierungsmappe ist bereit zur Einreichung bei der Bank."}
            </Text>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>Hinweis</Text>
          <Text style={styles.disclaimerText}>
            Diese Finanzierungsmappe dient ausschließlich Informationszwecken und stellt kein verbindliches 
            Wertgutachten dar. Die Berechnungen basieren auf den bereitgestellten Daten und allgemeinen 
            Marktparametern. Für eine verbindliche Kreditentscheidung empfehlen wir die Beauftragung eines 
            zertifizierten Gutachters gemäß BelWertV.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Proplytics GmbH | Finanzierungsmappe | Vertraulich</Text>
          <Text style={styles.pageNumber}>Seite 2 von 3</Text>
        </View>
      </Page>

      {/* Page 3: Valuation Analytics & Appendix */}
      <Page size="A4" style={styles.page}>
        {/* Header on third page */}
        <View style={{ ...styles.header, marginBottom: 20 }}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>PROPLYTICS</Text>
            <Text style={styles.logoSubtext}>Valuation Analytics</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerDate}>Seite 3</Text>
          </View>
        </View>

        {/* Valuation Comparison */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Wertermittlung nach BelWertV</Text>
            <Text style={styles.sectionBadge}>DREI-SÄULEN-BEWERTUNG</Text>
          </View>

          <View style={styles.row}>
            {/* Ertragswert */}
            <View style={{ ...styles.valuationCardHighlight, width: "31%" }}>
              <Text style={{ ...styles.valuationLabel, color: colors.success }}>ERTRAGSWERT (PRIMÄR)</Text>
              <Text style={{ ...styles.valuationValue, fontSize: 16 }}>{formatCurrencyPDF(data.ertragswert)}</Text>
              <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.emerald }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                  <Text style={{ fontSize: 7, color: colors.mediumGray }}>Liegenschaftszins</Text>
                  <Text style={{ fontSize: 7, fontWeight: 600 }}>{formatPercentPDF(data.liegenschaftszins, 1)}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                  <Text style={{ fontSize: 7, color: colors.mediumGray }}>Vervielfältiger</Text>
                  <Text style={{ fontSize: 7, fontWeight: 600 }}>{data.vervielfaeltiger.toFixed(2)}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 7, color: colors.mediumGray }}>Restnutzungsdauer</Text>
                  <Text style={{ fontSize: 7, fontWeight: 600 }}>{data.restnutzungsdauer} Jahre</Text>
                </View>
              </View>
            </View>

            {/* Sachwert */}
            <View style={{ ...styles.valuationCard, width: "31%" }}>
              <Text style={styles.valuationLabel}>SACHWERT</Text>
              <Text style={{ ...styles.valuationValue, fontSize: 16 }}>{formatCurrencyPDF(data.sachwert)}</Text>
              <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.lightGray }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                  <Text style={{ fontSize: 7, color: colors.mediumGray }}>NHK-Basiswert</Text>
                  <Text style={{ fontSize: 7, fontWeight: 600 }}>{formatCurrencyPDF(data.nhkBasiswert)}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                  <Text style={{ fontSize: 7, color: colors.mediumGray }}>Alterswertminderung</Text>
                  <Text style={{ fontSize: 7, fontWeight: 600 }}>{formatPercentPDF(data.alterswertminderung * 100, 0)}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 7, color: colors.mediumGray }}>Marktanpassung</Text>
                  <Text style={{ fontSize: 7, fontWeight: 600 }}>{formatPercentPDF((data.sachwertfaktor - 1) * 100, 0)}</Text>
                </View>
              </View>
            </View>

            {/* Vergleichswert */}
            <View style={{ ...styles.valuationCard, width: "31%" }}>
              <Text style={styles.valuationLabel}>VERGLEICHSWERT</Text>
              <Text style={{ ...styles.valuationValue, fontSize: 16 }}>{formatCurrencyPDF(data.marktwertMin)}</Text>
              <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.lightGray }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                  <Text style={{ fontSize: 7, color: colors.mediumGray }}>Spanne bis</Text>
                  <Text style={{ fontSize: 7, fontWeight: 600 }}>{formatCurrencyPDF(data.marktwertMax)}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                  <Text style={{ fontSize: 7, color: colors.mediumGray }}>qm-Preis</Text>
                  <Text style={{ fontSize: 7, fontWeight: 600 }}>{formatCurrencyPDF(data.qmPreis)}/m²</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 7, color: colors.mediumGray }}>Lage</Text>
                  <Text style={{ fontSize: 7, fontWeight: 600 }}>{formData.lage}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Final Market Value */}
          <View style={{ ...styles.cardHighlight, marginTop: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View>
                <Text style={{ ...styles.dataLabel, color: colors.emeraldLight }}>GUTACHTERLICHER MARKTWERT</Text>
                <Text style={{ fontSize: 8, color: colors.emeraldLight, marginTop: 2 }}>
                  Gewichteter Mittelwert aus Ertrags-, Sach- und Vergleichswert
                </Text>
              </View>
              <Text style={{ fontSize: 28, fontWeight: 700, color: colors.white }}>{formatCurrencyPDF(data.marktwert)}</Text>
            </View>
          </View>
        </View>

        {/* Cashflow 10-Year Projection Table */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>10-Jahres Cashflow-Projektion</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={{ ...styles.tableHeaderCell, width: "12%" }}>Jahr</Text>
                <Text style={{ ...styles.tableHeaderCell, width: "22%" }}>Mieteinnahmen</Text>
                <Text style={{ ...styles.tableHeaderCell, width: "22%" }}>Kosten</Text>
                <Text style={{ ...styles.tableHeaderCell, width: "22%" }}>Kapitaldienst</Text>
                <Text style={{ ...styles.tableHeaderCell, width: "22%" }}>Cashflow</Text>
              </View>
              
              {[1, 2, 3, 5, 10].map((year) => {
                const mieteinnahmen = data.istMiete * 12 * Math.pow(1.02, year - 1)
                const kosten = data.bewirtschaftungskosten * Math.pow(1.01, year - 1)
                const kapitaldienst = data.monatsrate * 12
                const cashflow = mieteinnahmen - kosten - kapitaldienst
                return (
                  <View key={year} style={styles.tableRow}>
                    <Text style={{ ...styles.tableCell, width: "12%", fontWeight: 600 }}>Jahr {year}</Text>
                    <Text style={{ ...styles.tableCell, width: "22%" }}>{formatCurrencyPDF(mieteinnahmen)}</Text>
                    <Text style={{ ...styles.tableCell, width: "22%" }}>{formatCurrencyPDF(kosten)}</Text>
                    <Text style={{ ...styles.tableCell, width: "22%" }}>{formatCurrencyPDF(kapitaldienst)}</Text>
                    <Text style={{ 
                      ...styles.tableCell, 
                      width: "22%", 
                      fontWeight: 600,
                      color: cashflow >= 0 ? colors.success : "#dc2626" 
                    }}>
                      {formatCurrencyPDF(cashflow)}
                    </Text>
                  </View>
                )
              })}
            </View>

            <View style={{ marginTop: 12, padding: 8, backgroundColor: colors.emeraldLight, borderRadius: 4 }}>
              <Text style={{ fontSize: 8, color: colors.deepNavy }}>
                Annahmen: 2% jährliche Mietsteigerung, 1% Kostenindex, konstanter Kapitaldienst
              </Text>
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>Rechtlicher Hinweis</Text>
          <Text style={styles.disclaimerText}>
            Diese Finanzierungsmappe dient ausschließlich Informationszwecken und stellt kein verbindliches 
            Wertgutachten gemäß § 194 BauGB dar. Die Berechnungen basieren auf den bereitgestellten Daten und 
            allgemeinen Marktparametern nach BelWertV. Für eine verbindliche Kreditentscheidung empfehlen wir 
            die Beauftragung eines zertifizierten Gutachters. Proplytics GmbH übernimmt keine Haftung für 
            Investitionsentscheidungen, die auf Basis dieser Analyse getroffen werden.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Proplytics GmbH | Finanzierungsmappe | Vertraulich | {today}</Text>
          <Text style={styles.pageNumber}>Seite 3 von 3</Text>
        </View>
      </Page>
    </Document>
  )
}

export default FinanzierungsmappePDF
