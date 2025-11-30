import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'Eventurk - Sosyal Medya',
  description: 'Basit ve modern sosyal medya platformu',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body
        className="min-h-screen bg-gray-50 antialiased"
        suppressHydrationWarning={true}
      >
        <Navigation />
        <main className="pt-4 pb-8 px-4 sm:px-6">
          {children}
        </main>
      </body>
    </html>
  )
}

