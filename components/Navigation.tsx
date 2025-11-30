'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Navigation() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isOrgAuthenticated, setIsOrgAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [organization, setOrganization] = useState<any>(null)

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const authStatus = localStorage.getItem('isAuthenticated')
        const userData = localStorage.getItem('user')
        const orgAuthStatus = localStorage.getItem('isOrganizationAuthenticated')
        const orgData = localStorage.getItem('currentOrganization')
        
        if (authStatus === 'true' && userData) {
          setIsAuthenticated(true)
          setUser(JSON.parse(userData))
        } else {
          setIsAuthenticated(false)
          setUser(null)
        }

        if (orgAuthStatus === 'true' && orgData) {
          setIsOrgAuthenticated(true)
          setOrganization(JSON.parse(orgData))
        } else {
          setIsOrgAuthenticated(false)
          setOrganization(null)
        }
      }
    }

    checkAuth()
    // Storage değişikliklerini dinle
    window.addEventListener('storage', checkAuth)
    
    // Custom event dinle (aynı sekmede değişiklikler için)
    window.addEventListener('authChange', checkAuth)

    return () => {
      window.removeEventListener('storage', checkAuth)
      window.removeEventListener('authChange', checkAuth)
    }
  }, [])

  const mainNavItems = [
    { href: '/', label: 'Ana Sayfa', icon: '📅' },
    { href: '/explore', label: 'Keşfet', icon: '🔍' },
  ]

  const profileHref = isOrgAuthenticated
    ? '/organization/profile'
    : isAuthenticated
    ? '/profile'
    : '/login'

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-primary-600">
            EDE-SOS
          </Link>

          {/* Desktop menü */}
          <div className="hidden md:flex items-center space-x-1">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}

            {/* Profil sekmesi (desktop) */}
            <Link
              href={profileHref}
              className={`px-4 py-2 rounded-lg transition-colors ${
                pathname === '/profile' ||
                pathname === '/organization/profile' ||
                pathname === '/login'
                  ? 'bg-primary-100 text-primary-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">👤</span>
              Profil
            </Link>
          </div>

          {/* Mobil menü butonu */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Menüyü aç/kapat"
          >
            <span className="sr-only">Menüyü aç/kapat</span>
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobil menü içeriği (üstten açılan) */}
        <div className={`md:hidden pb-3 space-y-2 ${isMenuOpen ? 'block' : 'hidden'}`}>
          <div className="flex flex-col space-y-1 pt-2 border-t border-gray-100 mt-2">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>

          <div className="pt-2 border-t border-gray-100">
            <Link
              href={profileHref}
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                pathname === '/profile' ||
                pathname === '/organization/profile' ||
                pathname === '/login'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="mr-2">👤</span>
              Profil
            </Link>
          </div>
        </div>
      </div>

      {/* Alt mobil nav bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white md:hidden">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-4 py-2 text-xs">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center flex-1 px-2 py-1 rounded-lg ${
                  isActive ? 'text-primary-600' : 'text-gray-500'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="mt-0.5">{item.label}</span>
              </Link>
            )
          })}

          {/* Profil sekmesi (alt bar) */}
          <Link
            href={profileHref}
            className={`flex flex-col items-center flex-1 px-2 py-1 rounded-lg ${
              pathname === '/profile' ||
              pathname === '/organization/profile' ||
              pathname === '/login'
                ? 'text-primary-600'
                : 'text-gray-500'
            }`}
          >
            <span className="text-lg">👤</span>
            <span className="mt-0.5">Profil</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
