'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { clearUserData } from '@/lib/storage'

type UserRole = 'ogretmen' | 'ogrenci' | 'veli' | 'yonetici' | 'teknik_destek'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: '' as UserRole | '',
    studentDocument: null as File | null,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'file' ? (e.target as HTMLInputElement).files?.[0] || null : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value,
    })
    // Hataları temizle
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData({
      ...formData,
      studentDocument: file,
    })
    if (errors.studentDocument) {
      setErrors({
        ...errors,
        studentDocument: '',
      })
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Ad Soyad gereklidir'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-posta gereklidir'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz'
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Kullanıcı adı gereklidir'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Kullanıcı adı en az 3 karakter olmalıdır'
    }

    if (!formData.role) {
      newErrors.role = 'Rol seçimi gereklidir'
    }

    if (!formData.password) {
      newErrors.password = 'Şifre gereklidir'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor'
    }

    // Öğrenci için belge zorunluluğu
    if (formData.role === 'ogrenci' && !formData.studentDocument) {
      newErrors.studentDocument = 'Öğrenci belgesi yüklenmesi zorunludur'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validate()) {
      // Önceki kullanıcının verilerini temizle (eğer varsa)
      try {
        const oldUser = localStorage.getItem('user')
        if (oldUser) {
          const parsed = JSON.parse(oldUser)
          if (parsed.id !== undefined) {
            clearUserData(parsed.id)
          }
        }
      } catch {}

      // Basit demo için localStorage kullanıyoruz
      // Gerçek uygulamada dosya API'ye yüklenir ve URL döner
      const documentUrl = formData.studentDocument 
        ? URL.createObjectURL(formData.studentDocument) 
        : null

      const userData = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        username: formData.username,
        role: formData.role,
        studentDocumentUrl: documentUrl,
        createdAt: new Date().toISOString(),
      }

      // Kullanıcıyı kaydet (gerçek uygulamada API'ye gönderilir)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('isAuthenticated', 'true')
      
      // Navigation'ı güncelle
      window.dispatchEvent(new Event('authChange'))

      // Profil sayfasına yönlendir
      router.push('/profile')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Hesap Oluştur
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Veya{' '}
            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
              zaten hesabınız var mı? Giriş yapın
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                Ad Soyad
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="Ad Soyad"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                E-posta
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="E-posta adresi"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="username" className="sr-only">
                Kullanıcı Adı
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.username ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="Kullanıcı adı"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>
            <div>
              <label htmlFor="role" className="sr-only">
                Rol
              </label>
              <select
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.role ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm bg-white`}
              >
                <option value="">Rol Seçiniz</option>
                <option value="ogretmen">Öğretmen</option>
                <option value="ogrenci">Öğrenci</option>
                <option value="veli">Veli</option>
                <option value="yonetici">Yönetici</option>
                <option value="teknik_destek">Teknik Destek</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>
            {formData.role === 'ogrenci' && (
              <div>
                <label htmlFor="studentDocument" className="block text-xs font-medium text-gray-700 mb-1 px-3 pt-2">
                  Öğrenci Belgesi (Zorunlu) *
                </label>
                <input
                  id="studentDocument"
                  name="studentDocument"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                    errors.studentDocument ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                />
                {errors.studentDocument && (
                  <p className="mt-1 text-sm text-red-600 px-3">{errors.studentDocument}</p>
                )}
                {formData.studentDocument && (
                  <p className="mt-1 text-xs text-green-600 px-3">
                    ✓ {formData.studentDocument.name} seçildi
                  </p>
                )}
              </div>
            )}
            <div>
              <label htmlFor="password" className="sr-only">
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="Şifre"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Şifre Tekrar
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="Şifre tekrar"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Hesap Oluştur
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

