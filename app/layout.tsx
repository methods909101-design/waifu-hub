import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WaifuHub',
  description: 'Create and interact with AI-generated waifus',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
