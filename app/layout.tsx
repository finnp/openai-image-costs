import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OpenAI Image Generation Cost Calculator",
  description: "Calculate the cost of OpenAI image generations based on token usage",
  openGraph: {
    title: "OpenAI Image Generation Cost Calculator",
    description: "Calculate the cost of OpenAI image generations based on token usage",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "OpenAI Image Generation Cost Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenAI Image Generation Cost Calculator",
    description: "Calculate the cost of OpenAI image generations based on token usage",
    images: ["/images/og-image.png"],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
