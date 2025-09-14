import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WaifuHub',
  description: 'Create and interact with AI-generated waifus',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body>{children}</body>
    </html>
  )
}
