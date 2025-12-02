'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  getTeacherClasses,
  createAssignment,
  getAllTemplates,
  getOrganizationTemplates,
} from '@/lib/storage'

export default function CreateAssignmentPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [classes, setClasses] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [useTemplate, setUseTemplate] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classId: '',
    dueDate: '',
    materials: '',
    objectives: '',
    isPublic: false,
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authStatus = localStorage.getItem('isAuthenticated')
      const userData = localStorage.getItem('user')
      
      if (authStatus === 'true' && userData) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        
        if (parsedUser.role !== 'ogretmen') {
          alert('Bu sayfaya sadece öğretmenler erişebilir')
          router.push('/')
          return
        }

        // Öğretmenin sınıflarını yükle
        const teacherClasses = getTeacherClasses(parsedUser.id)
        setClasses(teacherClasses)

        // Template'leri yükle
        const allTemplates = getAllTemplates()
        setTemplates(allTemplates)
      } else {
        router.push('/login')
      }
    }
  }, [router])

  const handleTemplateSelect = (templateId: number) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(templateId)
      setFormData({
        ...formData,
        title: template.title,
        description: template.description,
        materials: template.materials?.join('\n') || '',
        objectives: template.objectives?.join('\n') || '',
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !formData.classId) {
      alert('Lütfen tüm gerekli alanları doldurun')
      return
    }

    try {
      createAssignment({
        title: formData.title,
        description: formData.description,
        classId: parseInt(formData.classId),
        teacherId: user.id,
        templateId: selectedTemplate || undefined,
        dueDate: formData.dueDate,
        materials: formData.materials.split('\n').filter(m => m.trim()),
        objectives: formData.objectives.split('\n').filter(o => o.trim()),
        isPublic: formData.isPublic,
      })

      alert('Ödev başarıyla oluşturuldu!')
      router.push('/')
    } catch (error) {
      alert('Ödev oluşturulurken bir hata oluştu')
    }
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-gray-600">Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/"
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          ← Geri Dön
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Yeni Ödev Oluştur</h1>

        {/* Template seçimi */}
        {templates.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <label className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={useTemplate}
                onChange={(e) => {
                  setUseTemplate(e.target.checked)
                  if (!e.target.checked) {
                    setSelectedTemplate(null)
                    setFormData({
                      ...formData,
                      title: '',
                      description: '',
                      materials: '',
                      objectives: '',
                    })
                  }
                }}
                className="mr-2"
              />
              <span className="font-medium text-gray-700">Template kullan</span>
            </label>
            {useTemplate && (
              <select
                value={selectedTemplate || ''}
                onChange={(e) => handleTemplateSelect(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Template seçiniz</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.title} - {template.targetAudience}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sınıf *
            </label>
            <select
              required
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Sınıf seçiniz</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} (Sınıf {cls.grade})
                </option>
              ))}
            </select>
            {classes.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                Henüz sınıfınız yok. Önce bir sınıf oluşturmalısınız.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Başlık *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ödev başlığı"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama *
            </label>
            <textarea
              required
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ödev açıklaması"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teslim Tarihi *
            </label>
            <input
              type="date"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gerekli Materyaller (Her satıra bir tane)
            </label>
            <textarea
              rows={4}
              value={formData.materials}
              onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Materyal 1&#10;Materyal 2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Öğrenme Hedefleri (Her satıra bir tane) *
            </label>
            <textarea
              required
              rows={4}
              value={formData.objectives}
              onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Hedef 1&#10;Hedef 2"
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Herkese açık (herkes görebilir)</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={classes.length === 0}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Ödev Oluştur
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

