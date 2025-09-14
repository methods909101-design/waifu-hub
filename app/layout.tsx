import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WaifuHub',
  description: 'A sleek retro-style landing page for WaifuHub',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicoon.ico" sizes="any" />
        <link rel="icon" href="/favicoon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicoon.ico" />
      </head>
      <body>{children}</body>
    </html>
  )
}
