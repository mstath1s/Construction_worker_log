import "./globals.css"
import { Tinos } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "../components/session-provider"

const tinos = Tinos({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-tinos",
})

export const metadata = {
  title: 'Construction Log',
  description: 'Track and manage construction projects and daily work logs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={tinos.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

