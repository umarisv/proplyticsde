import React from "react"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'proplytics.de',
  description: 'Immobilienbewertungen verwalten und mit KI-Agent besprechen',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
