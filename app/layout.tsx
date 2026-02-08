import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "proplytics.de - KI-Immobilienbewertung",
  description: "Professionelle Immobilienbewertung mit KI-Technologie",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
