'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  getAllAssignments, 
  getStudentAssignments,
  getParentStudents,
  getStudentClass,
  getTeacherClasses,
  saveTemplate,
  EventTemplate,
  TaskTemplate,
  Assignment,
} from '@/lib/storage'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isOrgAuthenticated, setIsOrgAuthenticated] = useState(false)
  const [currentOrganization, setCurrentOrganization] = useState<any>(null)
  const [showCreateContent, setShowCreateContent] = useState(false)
  const [contentType, setContentType] = useState<'event' | 'task'>('event')
  
  // Etkinlik template formu
  const [eventTemplate, setEventTemplate] = useState({
    title: '',
    description: '',
    category: '',
    targetAudience: '',
    duration: '',
    materials: '',
    objectives: '',
    activities: '',
    evaluation: '',
  })

  // Görev template formu
  const [taskTemplate, setTaskTemplate] = useState({
    title: '',
    description: '',
    category: '',
    targetAudience: '',
    duration: '',
    materials: '',
    objectives: '',
    steps: '',
    evaluation: '',
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Kullanıcı bilgilerini yükle
      const authStatus = localStorage.getItem('isAuthenticated')
      const userData = localStorage.getItem('user')
      
      if (authStatus === 'true' && userData) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setUserRole(parsedUser.role || null)
      }

      // Kurum bilgilerini yükle
      const orgAuthStatus = localStorage.getItem('isOrganizationAuthenticated')
      const orgData = localStorage.getItem('currentOrganization')
      
      if (orgAuthStatus === 'true' && orgData) {
        setIsOrgAuthenticated(true)
        setCurrentOrganization(JSON.parse(orgData))
      }

      // Ödevleri yükle
      loadAssignments()
    }
  }, [])

  useEffect(() => {
    if (user) {
      loadAssignments()
    }
  }, [user, userRole])

  const loadAssignments = () => {
    if (!user) {
      // Giriş yapılmamışsa public ödevleri göster
      const allAssignments = getAllAssignments().filter(a => a.isPublic)
      setAssignments(allAssignments)
      return
    }

    if (userRole === 'ogrenci') {
      // Öğrenci için kendi ödevlerini göster
      const studentAssignments = getStudentAssignments(user.id)
      setAssignments(studentAssignments)
    } else if (userRole === 'veli') {
      // Veli için öğrencisinin ödevlerini göster
      const studentIds = getParentStudents(user.id)
      const allAssignments: Assignment[] = []
      
      studentIds.forEach((studentId) => {
        allAssignments.push(...getStudentAssignments(studentId))
      })
      
      setAssignments(allAssignments)
    } else if (userRole === 'ogretmen') {
      // Öğretmen için sınıflarının ödevlerini göster
      const teacherClasses = getTeacherClasses(user.id)
      const allAssignments: Assignment[] = []
      
      teacherClasses.forEach((cls) => {
        allAssignments.push(...getAllAssignments().filter(a => a.classId === cls.id))
      })
      
      setAssignments(allAssignments)
    } else {
      // Herkes için public ödevleri göster
      const allAssignments = getAllAssignments().filter(a => a.isPublic)
      setAssignments(allAssignments)
    }
  }

  const handleCreateEventTemplate = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentOrganization) return

    const template: Omit<EventTemplate, 'id' | 'createdAt' | 'organizationId' | 'isTemplate'> = {
      title: eventTemplate.title,
      description: eventTemplate.description,
      category: eventTemplate.category,
      targetAudience: eventTemplate.targetAudience,
      duration: eventTemplate.duration,
      materials: eventTemplate.materials.split('\n').filter(m => m.trim()),
      objectives: eventTemplate.objectives.split('\n').filter(o => o.trim()),
      activities: eventTemplate.activities.split('\n').filter(a => a.trim()),
      evaluation: eventTemplate.evaluation,
    }

    saveTemplate(template as any)
    
    setEventTemplate({
      title: '',
      description: '',
      category: '',
      targetAudience: '',
      duration: '',
      materials: '',
      objectives: '',
      activities: '',
      evaluation: '',
    })
    
    setShowCreateContent(false)
    alert('Etkinlik template\'i başarıyla oluşturuldu!')
  }

  const handleCreateTaskTemplate = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentOrganization) return

    const template: Omit<TaskTemplate, 'id' | 'createdAt' | 'organizationId' | 'isTemplate'> = {
      title: taskTemplate.title,
      description: taskTemplate.description,
      category: taskTemplate.category,
      targetAudience: taskTemplate.targetAudience,
      duration: taskTemplate.duration,
      materials: taskTemplate.materials.split('\n').filter(m => m.trim()),
      objectives: taskTemplate.objectives.split('\n').filter(o => o.trim()),
      steps: taskTemplate.steps.split('\n').filter(s => s.trim()),
      evaluation: taskTemplate.evaluation,
    }

    saveTemplate(template as any)
    
    setTaskTemplate({
      title: '',
      description: '',
      category: '',
      targetAudience: '',
      duration: '',
      materials: '',
      objectives: '',
      steps: '',
      evaluation: '',
    })
    
    setShowCreateContent(false)
    alert('Görev template\'i başarıyla oluşturuldu!')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Ödevler
        </h1>
        <p className="text-gray-600">
          Ödevlerinizi buradan takip edebilirsiniz
        </p>
      </div>

      {/* Kurum hesabı için içerik oluşturma */}
      {isOrgAuthenticated && currentOrganization && (
        <div className="mb-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                İçerik Oluştur (Maarif Modeli)
          </h2>
              <p className="text-sm text-gray-600 mt-1">
                Etkinlik ve görev template'leri oluşturun
              </p>
            </div>
            <button
              onClick={() => setShowCreateContent(!showCreateContent)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {showCreateContent ? '✕ Kapat' : '+ Yeni İçerik'}
            </button>
        </div>

          {showCreateContent && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setContentType('event')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    contentType === 'event'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Etkinlik Template
        </button>
                <button
                  onClick={() => setContentType('task')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    contentType === 'task'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Görev Template
        </button>
      </div>

              {contentType === 'event' ? (
                <form onSubmit={handleCreateEventTemplate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Başlık *
                    </label>
                    <input
                      type="text"
                      required
                      value={eventTemplate.title}
                      onChange={(e) => setEventTemplate({ ...eventTemplate, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Etkinlik başlığı"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Açıklama *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={eventTemplate.description}
                      onChange={(e) => setEventTemplate({ ...eventTemplate, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Etkinlik açıklaması"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kategori *
                      </label>
                      <select
                        required
                        value={eventTemplate.category}
                        onChange={(e) => setEventTemplate({ ...eventTemplate, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Seçiniz</option>
                        <option value="Eğitim">Eğitim</option>
                        <option value="Teknoloji">Teknoloji</option>
                        <option value="Kültür & Sanat">Kültür & Sanat</option>
                        <option value="Çevre">Çevre</option>
                        <option value="Spor">Spor</option>
                        <option value="Sağlık">Sağlık</option>
                        <option value="Girişimcilik">Girişimcilik</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hedef Kitle *
                      </label>
                      <input
                        type="text"
                        required
                        value={eventTemplate.targetAudience}
                        onChange={(e) => setEventTemplate({ ...eventTemplate, targetAudience: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Örn: İlkokul 3. Sınıf, Lise Öğrencileri"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Süre *
                      </label>
                      <input
                        type="text"
                        required
                        value={eventTemplate.duration}
                        onChange={(e) => setEventTemplate({ ...eventTemplate, duration: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Örn: 2 saat, 1 gün"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gerekli Materyaller (Her satıra bir tane)
                    </label>
                    <textarea
                      rows={3}
                      value={eventTemplate.materials}
                      onChange={(e) => setEventTemplate({ ...eventTemplate, materials: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Materyal 1&#10;Materyal 2&#10;Materyal 3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Öğrenme Hedefleri (Her satıra bir tane) *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={eventTemplate.objectives}
                      onChange={(e) => setEventTemplate({ ...eventTemplate, objectives: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Hedef 1&#10;Hedef 2&#10;Hedef 3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Etkinlik Adımları (Her satıra bir adım) *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={eventTemplate.activities}
                      onChange={(e) => setEventTemplate({ ...eventTemplate, activities: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Adım 1&#10;Adım 2&#10;Adım 3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Değerlendirme Kriterleri *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={eventTemplate.evaluation}
                      onChange={(e) => setEventTemplate({ ...eventTemplate, evaluation: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Değerlendirme kriterleri..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors"
                  >
                    Template Oluştur
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCreateTaskTemplate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Başlık *
                    </label>
                    <input
                      type="text"
                      required
                      value={taskTemplate.title}
                      onChange={(e) => setTaskTemplate({ ...taskTemplate, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Görev başlığı"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Açıklama *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={taskTemplate.description}
                      onChange={(e) => setTaskTemplate({ ...taskTemplate, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Görev açıklaması"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kategori *
                      </label>
                      <select
                        required
                        value={taskTemplate.category}
                        onChange={(e) => setTaskTemplate({ ...taskTemplate, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Seçiniz</option>
                        <option value="Eğitim">Eğitim</option>
                        <option value="Teknoloji">Teknoloji</option>
                        <option value="Kültür & Sanat">Kültür & Sanat</option>
                        <option value="Çevre">Çevre</option>
                        <option value="Spor">Spor</option>
                        <option value="Sağlık">Sağlık</option>
                        <option value="Girişimcilik">Girişimcilik</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hedef Kitle *
                      </label>
                      <input
                        type="text"
                        required
                        value={taskTemplate.targetAudience}
                        onChange={(e) => setTaskTemplate({ ...taskTemplate, targetAudience: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Örn: İlkokul 3. Sınıf, Lise Öğrencileri"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Süre *
                      </label>
                      <input
                        type="text"
                        required
                        value={taskTemplate.duration}
                        onChange={(e) => setTaskTemplate({ ...taskTemplate, duration: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Örn: 2 saat, 1 hafta"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gerekli Materyaller (Her satıra bir tane)
                    </label>
                    <textarea
                      rows={3}
                      value={taskTemplate.materials}
                      onChange={(e) => setTaskTemplate({ ...taskTemplate, materials: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Materyal 1&#10;Materyal 2&#10;Materyal 3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Öğrenme Hedefleri (Her satıra bir tane) *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={taskTemplate.objectives}
                      onChange={(e) => setTaskTemplate({ ...taskTemplate, objectives: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Hedef 1&#10;Hedef 2&#10;Hedef 3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Görev Adımları (Her satıra bir adım) *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={taskTemplate.steps}
                      onChange={(e) => setTaskTemplate({ ...taskTemplate, steps: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Adım 1&#10;Adım 2&#10;Adım 3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Değerlendirme Kriterleri *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={taskTemplate.evaluation}
                      onChange={(e) => setTaskTemplate({ ...taskTemplate, evaluation: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Değerlendirme kriterleri..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors"
                  >
                    Template Oluştur
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* Öğretmen için ödev oluşturma butonu */}
      {userRole === 'ogretmen' && (
        <div className="mb-6">
          <Link
            href="/assignments/create"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors"
          >
            + Yeni Ödev Oluştur
          </Link>
        </div>
      )}

      {/* Ödevler */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ödevler ({assignments.length})</h2>
        <div className="space-y-4">
          {assignments.length > 0 ? (
            assignments.map((assignment) => (
              <Link
                key={assignment.id}
                href={`/assignments/${assignment.id}`}
                className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{assignment.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{assignment.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>📅 Teslim: {new Date(assignment.dueDate).toLocaleDateString('tr-TR')}</span>
                      {assignment.isPublic && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          Herkese Açık
                        </span>
                      )}
                    </div>
                  </div>
                  {userRole === 'ogrenci' && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                      Yap
                    </span>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500">Henüz ödev bulunmuyor</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

