import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WebChat Practice',
  description: 'A simple chat service practice with WebSocket',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
