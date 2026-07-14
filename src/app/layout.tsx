import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nexa AI',
  description: 'AI Chat for Minecraft Nexa DLC',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-black text-white">{children}</body>
    </html>
  )
}
