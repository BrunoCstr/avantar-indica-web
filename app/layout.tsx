import type React from "react"
import type { Metadata, Viewport } from "next"
import { Familjen_Grotesk  } from "next/font/google"
import "./globals.css"

const familjenGrotesk = Familjen_Grotesk({ 
  subsets: ["latin"], 
  variable: "--font-familjen-grotesk" 
})

export const metadata: Metadata = {
  title: "Avantar Indica",
  description: "App de indicações e comissões da Avantar",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Avantar Indica",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#4A04A5",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={familjenGrotesk.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${familjenGrotesk.className} antialiased`}>{children}</body>
    </html>
  )
}
