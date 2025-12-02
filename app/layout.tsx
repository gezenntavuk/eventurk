'use client'

import { useEffect } from 'react'
import './globals.css'
import Navigation from '@/components/Navigation'
import { initSampleOrganization } from '@/lib/init-sample-data'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Uygulama başladığında örnek kurum hesabını oluştur
    initSampleOrganization()
  }, [])

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

