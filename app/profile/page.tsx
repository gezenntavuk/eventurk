'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUserData, clearUserData } from '@/lib/storage'
import { allEvents, allOrganizations } from '@/lib/data'

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
  const [interestedEvents, setInterestedEvents] = useState<any[]>([])
  const [followedOrganizations, setFollowedOrganizations] = useState<any[]>([])

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

        // localStorage'dan ilgilenilen etkinlikleri ve takip edilen kurumları yükle
        const userActivityData = getUserData()
        
        // İlgilenilen etkinlikleri filtrele
        const interested = allEvents.filter(event => 
          userActivityData.interestedEvents.includes(event.id)
        )
        setInterestedEvents(interested)

        // Takip edilen kurumları filtrele
        const followed = allOrganizations.filter(org => 
          userActivityData.followedOrganizations.includes(org.id)
        )
        setFollowedOrganizations(followed)
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
          <div className="flex space-x-3">
            <button
              onClick={handleEdit}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Profili Düzenle
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Çıkış Yap
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            İlgilendiğim Etkinlikler ({interestedEvents.length})
          </h2>
          <div className="space-y-3">
            {interestedEvents.length > 0 ? (
              interestedEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(event.date).toLocaleDateString('tr-TR')} · {event.location}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Henüz ilgilendiğiniz etkinlik yok</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
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
      </div>
    </div>
  )
}
