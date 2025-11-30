'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { allEvents } from '@/lib/data'
import { deleteEvent, getDeletedEvents } from '@/lib/storage'

interface Organization {
  id: number
  name: string
  email: string
  type: string
  description: string
  website?: string
  phone?: string
  verified: boolean
  createdAt: string
  isOrganization: boolean
}

export default function OrganizationProfilePage() {
  const router = useRouter()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: '',
    type: '',
    description: '',
    website: '',
    phone: '',
  })
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    endTime: '',
    location: '',
    address: '',
    category: '',
  })

  useEffect(() => {
    // Kurum bilgilerini yükle
    if (typeof window !== 'undefined') {
      const authStatus = localStorage.getItem('isOrganizationAuthenticated')
      const orgData = localStorage.getItem('currentOrganization')

      if (authStatus === 'true' && orgData) {
        const parsedOrg = JSON.parse(orgData)
        setOrganization(parsedOrg)
        setEditData({
          name: parsedOrg.name || '',
          type: parsedOrg.type || '',
          description: parsedOrg.description || '',
          website: parsedOrg.website || '',
          phone: parsedOrg.phone || '',
        })
        setIsAuthenticated(true)
      } else {
        // Giriş yapılmamışsa login sayfasına yönlendir
        router.push('/organization/login')
      }
    }
  }, [router])

  const handleLogout = () => {
    // Kurum çıkışında kullanıcı verileri temizlenmez (kurum hesabı farklı)
    localStorage.removeItem('isOrganizationAuthenticated')
    localStorage.removeItem('currentOrganization')
    // Navigation'ı güncelle
    window.dispatchEvent(new Event('authChange'))
    router.push('/')
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    if (organization) {
      const updatedOrg = {
        ...organization,
        name: editData.name,
        type: editData.type,
        description: editData.description,
        website: editData.website,
        phone: editData.phone,
      }
      
      // localStorage'daki kurumları güncelle
      const orgs = JSON.parse(localStorage.getItem('organizations') || '[]')
      const updatedOrgs = orgs.map((org: any) => 
        org.id === updatedOrg.id ? updatedOrg : org
      )
      localStorage.setItem('organizations', JSON.stringify(updatedOrgs))
      localStorage.setItem('currentOrganization', JSON.stringify(updatedOrg))
      
      setOrganization(updatedOrg)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    if (organization) {
      setEditData({
        name: organization.name || '',
        type: organization.type || '',
        description: organization.description || '',
        website: organization.website || '',
        phone: organization.phone || '',
      })
    }
    setIsEditing(false)
  }

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!organization) return

    const eventData = {
      id: Date.now(),
      title: newEvent.title,
      description: newEvent.description,
      organization: {
        id: organization.id,
        name: organization.name,
        type: organization.type,
        logo: '',
        verified: organization.verified,
      },
      date: newEvent.date,
      time: newEvent.time,
      endTime: newEvent.endTime || newEvent.time,
      location: newEvent.location,
      address: newEvent.address || newEvent.location,
      category: newEvent.category,
      attendees: 0,
      interested: 0,
      isUpcoming: true,
    }

    // Etkinlikleri localStorage'a kaydet
    const events = JSON.parse(localStorage.getItem('userEvents') || '[]')
    events.push(eventData)
    localStorage.setItem('userEvents', JSON.stringify(events))

    // Formu sıfırla
    setNewEvent({
      title: '',
      description: '',
      date: '',
      time: '',
      endTime: '',
      location: '',
      address: '',
      category: '',
    })
    setShowCreateEvent(false)
    alert('Etkinlik başarıyla oluşturuldu!')
  }

  // Kurumun etkinliklerini yükle
  const [organizationEvents, setOrganizationEvents] = useState<any[]>([])
  
  useEffect(() => {
    if (organization) {
      const userEvents = JSON.parse(localStorage.getItem('userEvents') || '[]')
      const deletedIds = getDeletedEvents()
      const orgEvents = userEvents
        .filter((event: any) => event.organization.id === organization.id)
        .filter((event: any) => !deletedIds.includes(event.id))
      setOrganizationEvents(orgEvents)
    }
  }, [organization, showCreateEvent])

  const handleDeleteEvent = (eventId: number) => {
    if (!window.confirm('Bu etkinliği silmek istediğinize emin misiniz?')) return

    deleteEvent(eventId)
    setOrganizationEvents((prev) => prev.filter((event) => event.id !== eventId))
    alert('Etkinlik silindi')
  }

  if (!isAuthenticated || !organization) {
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
              {organization.name.charAt(0).toUpperCase()}
            </div>
            <div>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kurum Adı
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
                      Kurum Tipi
                    </label>
                    <select
                      value={editData.type}
                      onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Resmi Kurum">Resmi Kurum</option>
                      <option value="Belediye">Belediye</option>
                      <option value="Üniversite">Üniversite</option>
                      <option value="STK">STK</option>
                      <option value="Diğer">Diğer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Açıklama
                    </label>
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  <div className="flex items-center space-x-2 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {organization.name}
                    </h1>
                    {organization.verified && (
                      <span className="text-primary-600 text-2xl" title="Doğrulanmış Kurum">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{organization.type}</p>
                  <p className="text-gray-500 text-sm mb-4">{organization.email}</p>
                  {organization.description && (
                    <p className="text-gray-700 mb-4">{organization.description}</p>
                  )}
                  {organization.website && (
                    <p className="text-gray-600 text-sm mb-1">
                      🌐 <a href={organization.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{organization.website}</a>
                    </p>
                  )}
                  {organization.phone && (
                    <p className="text-gray-600 text-sm mb-4">📞 {organization.phone}</p>
                  )}
                  <p className="text-gray-500 text-sm">
                    Üyelik: {new Date(organization.createdAt).toLocaleDateString('tr-TR')}
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
              onClick={() => setShowCreateEvent(!showCreateEvent)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {showCreateEvent ? 'İptal' : '+ Yeni Etkinlik Oluştur'}
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

      {showCreateEvent && (
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Yeni Etkinlik Oluştur</h2>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Etkinlik Başlığı *
              </label>
              <input
                type="text"
                required
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Etkinlik adı"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama *
              </label>
              <textarea
                required
                rows={4}
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Etkinlik hakkında detaylı bilgi..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tarih *
                </label>
                <input
                  type="date"
                  required
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Başlangıç Saati *
                </label>
                <input
                  type="time"
                  required
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bitiş Saati
                </label>
                <input
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori *
                </label>
                <select
                  required
                  value={newEvent.category}
                  onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="Teknoloji">Teknoloji</option>
                  <option value="Kültür & Sanat">Kültür & Sanat</option>
                  <option value="Çevre">Çevre</option>
                  <option value="Spor">Spor</option>
                  <option value="Eğitim">Eğitim</option>
                  <option value="Sağlık">Sağlık</option>
                  <option value="Girişimcilik">Girişimcilik</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Konum *
              </label>
              <input
                type="text"
                required
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Şehir, Mekan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adres
              </label>
              <input
                type="text"
                value={newEvent.address}
                onChange={(e) => setNewEvent({ ...newEvent, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Detaylı adres bilgisi"
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors"
            >
              Etkinliği Oluştur
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Etkinliklerim ({organizationEvents.length})
        </h2>
        <div className="space-y-3">
          {organizationEvents.length > 0 ? (
            organizationEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(event.date).toLocaleDateString('tr-TR')} · {event.location}
                    </p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{event.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      handleDeleteEvent(event.id)
                    }}
                    className="px-3 py-1 text-xs font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                  >
                    Sil
                  </button>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-500 text-sm">Henüz etkinlik oluşturmadınız</p>
          )}
        </div>
      </div>
    </div>
  )
}

