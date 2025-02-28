import type React from "react"
import type { Metadata } from "next"
import { Ysabeau } from "next/font/google"
import "./globals.css"

const roboto = Ysabeau({
  weight: ['400', '500', '700'],
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
    <html lang="en">
      <body className={roboto.className}>{children}</body>
    </html>
  )
}

