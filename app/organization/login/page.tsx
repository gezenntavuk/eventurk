'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function OrganizationLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    // Eğer zaten giriş yapılmışsa profil sayfasına yönlendir
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('isOrganizationAuthenticated')
      if (isAuthenticated === 'true') {
        router.push('/organization/profile')
      }
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basit demo için - gerçek uygulamada API'ye gönderilir
    const storedOrgs = localStorage.getItem('organizations')
    
    if (storedOrgs) {
      const organizations = JSON.parse(storedOrgs)
      const organization = organizations.find((org: any) => org.email === formData.email)
      
      if (organization) {
        localStorage.setItem('currentOrganization', JSON.stringify(organization))
        localStorage.setItem('isOrganizationAuthenticated', 'true')
        
        // Navigation'ı güncelle
        window.dispatchEvent(new Event('authChange'))
        
        router.push('/organization/profile')
      } else {
        setError('Bu e-posta ile kayıtlı kurum bulunamadı. Lütfen önce kayıt olun.')
      }
    } else {
      setError('Kayıtlı kurum bulunamadı. Lütfen önce kayıt olun.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Kurum Girişi
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Veya{' '}
            <Link href="/organization/register" className="font-medium text-primary-600 hover:text-primary-500">
              yeni kurum hesabı oluşturun
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                E-posta
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="E-posta adresi"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Giriş Yap
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

