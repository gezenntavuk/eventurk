'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { clearUserData } from '@/lib/storage'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    // Eğer zaten giriş yapılmışsa profil sayfasına yönlendir
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('isAuthenticated')
      if (isAuthenticated === 'true') {
        router.push('/profile')
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

    // Özel admin hesabı (demo)
    if (formData.identifier === 'admin123' && formData.password === 'admin123123') {
      // Önceki kullanıcının verilerini temizle
      try {
        const oldUser = localStorage.getItem('user')
        if (oldUser) {
          const parsed = JSON.parse(oldUser)
          if (parsed.id !== undefined) {
            clearUserData(parsed.id)
          }
        }
      } catch {}
      
      const adminUser = {
        id: 0,
        name: 'Admin Kullanıcı',
        email: 'admin@example.com',
        username: 'admin123',
        role: 'yonetici' as const,
        createdAt: new Date().toISOString(),
        isAdmin: true,
      }
      localStorage.setItem('user', JSON.stringify(adminUser))
      localStorage.setItem('isAuthenticated', 'true')
      window.dispatchEvent(new Event('authChange'))
      router.push('/profile')
      return
    }

    // Örnek hesaplar (demo)
    const exampleAccounts = [
      {
        identifier: 'ogretmen1',
        password: 'ogretmen123',
        user: {
          id: 1001,
          name: 'Ahmet Öğretmen',
          email: 'ogretmen1@example.com',
          username: 'ogretmen1',
          role: 'ogretmen' as const,
          createdAt: new Date().toISOString(),
        },
      },
      {
        identifier: 'ogrenci1',
        password: 'ogrenci123',
        user: {
          id: 1002,
          name: 'Ayşe Öğrenci',
          email: 'ogrenci1@example.com',
          username: 'ogrenci1',
          role: 'ogrenci' as const,
          studentDocumentUrl: '/documents/ogrenci1.pdf',
          createdAt: new Date().toISOString(),
        },
      },
      {
        identifier: 'veli1',
        password: 'veli123',
        user: {
          id: 1003,
          name: 'Mehmet Veli',
          email: 'veli1@example.com',
          username: 'veli1',
          role: 'veli' as const,
          createdAt: new Date().toISOString(),
        },
      },
      {
        identifier: 'yonetici1',
        password: 'yonetici123',
        user: {
          id: 1004,
          name: 'Fatma Yönetici',
          email: 'yonetici1@example.com',
          username: 'yonetici1',
          role: 'yonetici' as const,
          createdAt: new Date().toISOString(),
        },
      },
      {
        identifier: 'teknik1',
        password: 'teknik123',
        user: {
          id: 1005,
          name: 'Ali Teknik Destek',
          email: 'teknik1@example.com',
          username: 'teknik1',
          role: 'teknik_destek' as const,
          createdAt: new Date().toISOString(),
        },
      },
    ]

    // Örnek hesapları kontrol et
    const exampleAccount = exampleAccounts.find(
      (acc) => acc.identifier === formData.identifier && acc.password === formData.password
    )

    if (exampleAccount) {
      // Önceki kullanıcının verilerini temizle
      try {
        const oldUser = localStorage.getItem('user')
        if (oldUser) {
          const parsed = JSON.parse(oldUser)
          if (parsed.id !== undefined && parsed.id !== exampleAccount.user.id) {
            clearUserData(parsed.id)
          }
        }
      } catch {}
      
      localStorage.setItem('user', JSON.stringify(exampleAccount.user))
      localStorage.setItem('isAuthenticated', 'true')
      window.dispatchEvent(new Event('authChange'))
      router.push('/profile')
      return
    }

    // Basit demo için - gerçek uygulamada API'ye gönderilir
    const storedUser = localStorage.getItem('user')
    
    if (storedUser) {
      const user = JSON.parse(storedUser)
      // Demo için e-posta veya kullanıcı adına göre kontrol ediyoruz
      // Şifre kontrolü yapılmıyor (demo için)
      if (user.email === formData.identifier || user.username === formData.identifier) {
        // Aynı kullanıcı giriş yapıyorsa verileri temizleme
        // Farklı kullanıcı giriş yapıyorsa önceki kullanıcının verilerini temizle
        // (Bu durumda zaten aynı user objesi olduğu için temizleme gerekmez)
        localStorage.setItem('isAuthenticated', 'true')
        // Navigation'ı güncelle
        window.dispatchEvent(new Event('authChange'))
        router.push('/profile')
      } else {
        setError('Bilgiler hatalı')
      }
    } else {
      setError('Kayıtlı kullanıcı bulunamadı. Lütfen önce kayıt olun.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Giriş Yap
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Veya{' '}
            <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
              yeni hesap oluşturun
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
              <label htmlFor="identifier" className="sr-only">
                E-posta veya kullanıcı adı
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                required
                value={formData.identifier}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="E-posta veya kullanıcı adı (örn. admin123)"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Şifre"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Beni hatırla
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                Şifremi unuttum
              </a>
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

