'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function OrganizationRegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: '',
    description: '',
    website: '',
    phone: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [kvkkAccepted, setKvkkAccepted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // Hataları temizle
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      })
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Kurum adı gereklidir'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-posta gereklidir'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz'
    }

    if (!formData.type.trim()) {
      newErrors.type = 'Kurum tipi gereklidir'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Açıklama gereklidir'
    } else if (formData.description.length < 20) {
      newErrors.description = 'Açıklama en az 20 karakter olmalıdır'
    }

    if (!kvkkAccepted) {
      newErrors.kvkk = 'KVKK Aydınlatma Metni\'ni kabul etmelisiniz'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validate()) {
      // Basit demo için localStorage kullanıyoruz
      const organizationData = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        type: formData.type,
        description: formData.description,
        website: formData.website || '',
        phone: formData.phone || '',
        verified: false, // Başlangıçta doğrulanmamış
        createdAt: new Date().toISOString(),
        isOrganization: true, // Kurum hesabı olduğunu belirt
      }

      // Kurumları kaydet (gerçek uygulamada API'ye gönderilir)
      const existingOrgs = JSON.parse(localStorage.getItem('organizations') || '[]')
      existingOrgs.push(organizationData)
      localStorage.setItem('organizations', JSON.stringify(existingOrgs))
      
      // Giriş durumunu kaydet
      localStorage.setItem('currentOrganization', JSON.stringify(organizationData))
      localStorage.setItem('isOrganizationAuthenticated', 'true')

      // Navigation'ı güncelle
      window.dispatchEvent(new Event('authChange'))

      // Kurum profil sayfasına yönlendir
      router.push('/organization/profile')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Kurum Hesabı Oluştur
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Veya{' '}
            <Link href="/organization/login" className="font-medium text-primary-600 hover:text-primary-500">
              zaten hesabınız var mı? Giriş yapın
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Kurum Adı *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                placeholder="Örn: T.C. Sanayi ve Teknoloji Bakanlığı"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-posta *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                placeholder="kurum@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Kurum Tipi *
              </label>
              <select
                id="type"
                name="type"
                required
                value={formData.type}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  errors.type ? 'border-red-300' : 'border-gray-300'
                } text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
              >
                <option value="">Seçiniz</option>
                <option value="Resmi Kurum">Resmi Kurum</option>
                <option value="Belediye">Belediye</option>
                <option value="Üniversite">Üniversite</option>
                <option value="STK">STK</option>
                <option value="Diğer">Diğer</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type}</p>
              )}
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Kurum Açıklaması *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                placeholder="Kurumunuz hakkında bilgi verin..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Web Sitesi
              </label>
              <input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="https://www.example.com"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefon
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="+90 555 123 45 67"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={kvkkAccepted}
                onChange={(e) => {
                  setKvkkAccepted(e.target.checked)
                  if (errors.kvkk) {
                    setErrors({ ...errors, kvkk: '' })
                  }
                }}
                className="mt-1 mr-3"
                required
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">
                  KVKK Aydınlatma Metni'ni okudum ve kabul ediyorum *
                </span>
                <p className="text-xs text-gray-600 mt-1">
                  Kişisel verilerinizin işlenmesi hakkında{' '}
                  <a href="#" className="text-primary-600 hover:underline" onClick={(e) => {
                    e.preventDefault()
                    alert('KVKK Aydınlatma Metni:\n\nBu platformda toplanan kişisel verileriniz, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında işlenmektedir. Verileriniz sadece platform hizmetlerinin sunulması amacıyla kullanılacaktır.')
                  }}>
                    aydınlatma metnini
                  </a>{' '}
                  okuyunuz.
                </p>
                {errors.kvkk && (
                  <p className="mt-1 text-sm text-red-600">{errors.kvkk}</p>
                )}
              </div>
            </label>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Kurum Hesabı Oluştur
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

