// 'use client'; // Removed directive: Layout is now a Server Component

import "./globals.css"
// import { Tinos } from "next/font/google" // Remove unused import
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "../components/session-provider"
import { Inter as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"
// import React, { useEffect, useState } from 'react' // Removed hooks
// import { initDB } from "@/lib/indexedDBHelper"; // Moved to SyncManager
// import { syncPendingWorkLogs } from "@/lib/syncService"; // Moved to SyncManager
import { SyncManager } from "@/components/SyncManager"; // Import the new component

/* // Remove unused font definition
const tinos = Tinos({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-tinos",
})
*/

const fontSans = FontSans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-sans",
})

// Metadata export is allowed again
export const metadata = {
  title: 'Construction Log',
  description: 'Track and manage construction projects and daily work logs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Removed useState and useEffect logic

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {/* Render the SyncManager component here */}
            <SyncManager />
            {/* Removed the syncMessage div display */}
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

