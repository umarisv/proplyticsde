import type { Metadata, Viewport } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import "./globals.css"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const inter = Inter({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "proplytics.de - KI-Immobilienbewertung",
    template: "%s | proplytics.de",
  },
  description:
    "Professionelle Immobilienbewertung mit KI-Technologie. Detaillierte Marktanalyse, Wirtschaftlichkeitsberechnung und Bewertung nach ImmoWertV 2024.",
  keywords: [
    "Immobilienbewertung",
    "KI",
    "Marktanalyse",
    "Immobilien",
    "Bewertung",
    "ImmoWertV",
    "Rendite",
  ],
  openGraph: {
    title: "proplytics.de - KI-Immobilienbewertung",
    description:
      "Professionelle Immobilienbewertung mit KI-Technologie in unter 60 Sekunden.",
    siteName: "proplytics.de",
    locale: "de_DE",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: "#34d399",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
