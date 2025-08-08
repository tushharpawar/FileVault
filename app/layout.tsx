import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AnalyticsTracker } from "@/components/analytics-tracker"
import { ConnectionMonitor } from "@/components/connection-monitor"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FileVault - File Sharing Platform",
  description: "A modern file sharing platform.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AnalyticsTracker />
          <ConnectionMonitor />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
