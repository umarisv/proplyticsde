"use client"

import { PDFDownloadLink } from "@react-pdf/renderer"
import { FinanzierungsmappePDF } from "./pdf-generator"
import { Loader2, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AnalyseResultData, AnalyseFormData } from "@/lib/types"

interface PDFComponentsProps {
  data: AnalyseResultData
  formData: AnalyseFormData
  address?: string
}

export function PDFComponents({ data, formData, address }: PDFComponentsProps) {
  return (
    <PDFDownloadLink
      document={<FinanzierungsmappePDF data={data} formData={formData} address={address} />}
      fileName={`Finanzierungsmappe_${formData.plz}_${formData.stadt}_${new Date().toISOString().split('T')[0]}.pdf`}
    >
      {({ loading }) => (
        <Button
          size="lg"
          className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 w-full"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileDown className="w-4 h-4" />
          )}
          PDF Herunterladen
        </Button>
      )}
    </PDFDownloadLink>
  )
}