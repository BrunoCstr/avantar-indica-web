import type React from "react"
import type { Metadata, Viewport } from "next"
import { Familjen_Grotesk  } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/context/Auth"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import InstallBanner from "@/components/InstallBanner"

const familjenGrotesk = Familjen_Grotesk({ 
  subsets: ["latin"], 
  variable: "--font-familjen-grotesk" 
})

export const metadata: Metadata = {
  title: "Avantar Indica",
  description: "O Avantar Indica é o aplicativo oficial da Rede Avantar, desenvolvido para que você possa transformar suas indicações em recompensas reais! Indique amigos, familiares ou contatos para fechar seguros, consórcios ou planos de saúde e receba cashback em produtos ou comissão em dinheiro, de forma rápida, simples e segura.",
  manifest: "/manifest.json",
  other: {
    // Smart Banner iOS
    'apple-itunes-app': 'app-id=6749894670',
    
    // PWA configs
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Avantar'
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Avantar Indica",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: [
      { url: "/appLogo-192.png", sizes: "192x192", type: "image/jpeg" },
      { url: "/appLogo-512.png", sizes: "512x512", type: "image/jpeg" },
    ],
  },
  verification: {
    google: "XQHW184VT4ZVRjL613khndcZn02xEiPKgdcoDlCZVjQ",
  },
};

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
    <html lang="pt-BR" className={familjenGrotesk.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/appLogo-192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/appLogo-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/appLogo-512.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Avantar Indica" />
      </head>
      <body className={`${familjenGrotesk.className} antialiased`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <InstallBanner/>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
