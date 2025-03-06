import type React from "react"
import type { Metadata } from "next"
import { Tinos } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const tinos = Tinos({
  weight: ['400', '700'],
  style: ['normal','italic'],
  subsets: ['greek','latin']
 // display: 'swap',
})

export const metadata: Metadata = {
  title: "Construction Site Work Log",
  description: "Digitize your construction site work logs",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={tinos.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

