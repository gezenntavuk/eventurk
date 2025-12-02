'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUserData, clearUserData, createClass, getTeacherClasses, getStudentClass, createStudentParentRelation, getParentStudents, addStudentToClass } from '@/lib/storage'
import { allOrganizations } from '@/lib/data'

type UserRole = 'ogretmen' | 'ogrenci' | 'veli' | 'yonetici' | 'teknik_destek'

interface User {
  id: number
  name: string
  email: string
  username: string
  bio?: string
  role?: UserRole
  studentDocumentUrl?: string
  createdAt: string
  isAdmin?: boolean
}

const roleLabels: Record<UserRole, string> = {
  ogretmen: 'Öğretmen',
  ogrenci: 'Öğrenci',
  veli: 'Veli',
  yonetici: 'Yönetici',
  teknik_destek: 'Teknik Destek',
}

const roleColors: Record<UserRole, string> = {
  ogretmen: 'bg-blue-100 text-blue-700',
  ogrenci: 'bg-green-100 text-green-700',
  veli: 'bg-purple-100 text-purple-700',
  yonetici: 'bg-red-100 text-red-700',
  teknik_destek: 'bg-yellow-100 text-yellow-700',
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: '',
    username: '',
    bio: '',
  })
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [followedOrganizations, setFollowedOrganizations] = useState<any[]>([])
  const [showCreateClass, setShowCreateClass] = useState(false)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [showAddParentRelation, setShowAddParentRelation] = useState(false)
  const [classes, setClasses] = useState<any[]>([])
  const [newClass, setNewClass] = useState({ name: '', grade: '' })
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedParent, setSelectedParent] = useState('')
  const [relationType, setRelationType] = useState<'anne' | 'baba' | 'vası' | 'diğer'>('anne')

  const loadUserData = () => {
    if (typeof window !== 'undefined') {
      const authStatus = localStorage.getItem('isAuthenticated')
      const userData = localStorage.getItem('user')

      if (authStatus === 'true' && userData) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setEditData({
          name: parsedUser.name || '',
          username: parsedUser.username || '',
          bio: parsedUser.bio || '',
        })
        setIsAuthenticated(true)

        // localStorage'dan takip edilen kurumları yükle
        const userActivityData = getUserData()

        // Takip edilen kurumları filtrele
        const followed = allOrganizations.filter(org => 
          userActivityData.followedOrganizations.includes(org.id)
        )
        setFollowedOrganizations(followed)

        // Öğretmen için sınıfları yükle
        if (parsedUser.role === 'ogretmen') {
          const teacherClasses = getTeacherClasses(parsedUser.id)
          setClasses(teacherClasses)
        }
      } else {
        // Giriş yapılmamışsa login sayfasına yönlendir
        router.push('/login')
      }
    }
  }

  useEffect(() => {
    loadUserData()
    
    // Sayfa görünür olduğunda verileri yenile (başka sayfadan dönüldüğünde)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadUserData()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [router])

  const handleLogout = () => {
    // Kullanıcı ID'sini al ve verilerini temizle
    if (user?.id !== undefined) {
      clearUserData(user.id)
    }
    
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('user')
    // Navigation'ı güncelle
    window.dispatchEvent(new Event('authChange'))
    router.push('/')
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    if (user) {
      const updatedUser = {
        ...user,
        name: editData.name,
        username: editData.username,
        bio: editData.bio,
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setEditData({
        name: user.name || '',
        username: user.username || '',
        bio: user.bio || '',
      })
    }
    setIsEditing(false)
  }

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || user.role !== 'ogretmen') return

    try {
      const newClassObj = createClass(newClass.name, parseInt(newClass.grade), user.id)
      setClasses([...classes, newClassObj])
      setNewClass({ name: '', grade: '' })
      setShowCreateClass(false)
      alert('Sınıf başarıyla oluşturuldu!')
    } catch (error) {
      alert('Sınıf oluşturulurken bir hata oluştu')
    }
  }

  const handleAddStudentToClass = () => {
    if (!selectedClass || !selectedStudent) {
      alert('Lütfen sınıf ve öğrenci seçiniz')
      return
    }

    addStudentToClass(parseInt(selectedClass), parseInt(selectedStudent))
    alert('Öğrenci sınıfa eklendi!')
    setShowAddStudent(false)
    setSelectedClass('')
    setSelectedStudent('')
  }

  const handleCreateParentRelation = () => {
    if (!user || user.role !== 'veli' || !selectedStudent) {
      alert('Lütfen öğrenci seçiniz')
      return
    }

    try {
      createStudentParentRelation(parseInt(selectedStudent), user.id, relationType)
      alert('Öğrenci-veli ilişkisi oluşturuldu!')
      setShowAddParentRelation(false)
      setSelectedStudent('')
    } catch (error) {
      alert('İlişki oluşturulurken bir hata oluştu')
    }
  }


  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-gray-600">Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 text-4xl font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ad Soyad
                    </label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kullanıcı Adı
                    </label>
                    <input
                      type="text"
                      value={editData.username}
                      onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hakkımda
                    </label>
                    <textarea
                      value={editData.bio}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Kendiniz hakkında bir şeyler yazın..."
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      Kaydet
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {user.name}
                  </h1>
                  <div className="flex items-center space-x-2 mb-2 flex-wrap">
                    <p className="text-gray-600">@{user.username}</p>
                    {user.role && (
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${roleColors[user.role]}`}>
                        {roleLabels[user.role]}
                      </span>
                    )}
                    {user.isAdmin && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                        Admin
                      </span>
                    )}
                  </div>
                  {user.role === 'ogrenci' && user.studentDocumentUrl && (
                    <div className="mb-2">
                      <a
                        href={user.studentDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-800 underline"
                      >
                        📄 Öğrenci Belgesi
                      </a>
                    </div>
                  )}
                  {user.role === 'ogretmen' && (user as any).teacherDocumentUrl && (
                    <div className="mb-2">
                      <a
                        href={(user as any).teacherDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-800 underline"
                      >
                        📄 Öğretmen Belgesi
                      </a>
                    </div>
                  )}
                  <p className="text-gray-500 text-sm mb-4">{user.email}</p>
                  {user.bio && (
                    <p className="text-gray-700 mb-4">{user.bio}</p>
                  )}
                  <p className="text-gray-500 text-sm">
                    Üyelik: {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {!isEditing && (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleEdit}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Profili Düzenle
            </button>
            {user.role === 'ogretmen' && (
              <>
                <button
                  onClick={() => setShowCreateClass(true)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  + Sınıf Oluştur
                </button>
                <button
                  onClick={() => setShowAddStudent(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Öğrenci Ekle
                </button>
              </>
            )}
            {user.role === 'veli' && (
              <button
                onClick={() => setShowAddParentRelation(true)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Öğrenci Bağla
              </button>
            )}
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Çıkış Yap
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Takip Ettiğim Kurumlar ({followedOrganizations.length})
        </h2>
        <div className="space-y-3">
          {followedOrganizations.length > 0 ? (
            followedOrganizations.map((org) => (
              <Link
                key={org.id}
                href={`/organizations/${org.id}`}
                className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-900">{org.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{org.type}</p>
              </Link>
            ))
          ) : (
            <p className="text-gray-500 text-sm">Henüz takip ettiğiniz kurum yok</p>
          )}
        </div>
      </div>

      {/* Öğretmen için sınıf oluşturma */}
      {user.role === 'ogretmen' && showCreateClass && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Yeni Sınıf Oluştur</h2>
          <form onSubmit={handleCreateClass} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sınıf Adı *
              </label>
              <input
                type="text"
                required
                value={newClass.name}
                onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Örn: 3-A, 5-B"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sınıf Seviyesi *
              </label>
              <select
                required
                value={newClass.grade}
                onChange={(e) => setNewClass({ ...newClass, grade: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Seçiniz</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}. Sınıf
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Oluştur
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateClass(false)
                  setNewClass({ name: '', grade: '' })
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Öğretmen için öğrenci ekleme */}
      {user.role === 'ogretmen' && showAddStudent && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sınıfa Öğrenci Ekle</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sınıf *
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Sınıf seçiniz</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} (Sınıf {cls.grade})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Öğrenci ID *
              </label>
              <input
                type="number"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Öğrenci ID'si"
              />
              <p className="mt-1 text-sm text-gray-500">
                Öğrencinin profil sayfasından ID'sini öğrenebilirsiniz
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddStudentToClass}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Ekle
              </button>
              <button
                onClick={() => {
                  setShowAddStudent(false)
                  setSelectedClass('')
                  setSelectedStudent('')
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Veli için öğrenci bağlama */}
      {user.role === 'veli' && showAddParentRelation && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Öğrenci Bağla</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Öğrenci ID *
              </label>
              <input
                type="number"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Öğrenci ID'si"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                İlişki Tipi *
              </label>
              <select
                value={relationType}
                onChange={(e) => setRelationType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="anne">Anne</option>
                <option value="baba">Baba</option>
                <option value="vası">Vası</option>
                <option value="diğer">Diğer</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreateParentRelation}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Bağla
              </button>
              <button
                onClick={() => {
                  setShowAddParentRelation(false)
                  setSelectedStudent('')
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Öğretmen için sınıf listesi */}
      {user.role === 'ogretmen' && classes.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Sınıflarım ({classes.length})
          </h2>
          <div className="space-y-3">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                <p className="text-sm text-gray-500">
                  Sınıf {cls.grade} · {cls.studentIds.length} öğrenci
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
