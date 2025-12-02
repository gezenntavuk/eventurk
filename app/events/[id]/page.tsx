'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  isEventAttending,
  toggleEventAttendance,
  getDeletedEvents,
  deleteEvent,
  getEventAttendeesCount,
} from '@/lib/storage'
import { allEvents } from '@/lib/data'

interface PageProps {
  params: {
    id: string
  }
}

export default function EventDetailPage({ params }: PageProps) {
  const router = useRouter()
  const [event, setEvent] = useState<any>(null)
  const [isAttending, setIsAttending] = useState(false)
  const [attendeesCount, setAttendeesCount] = useState(0)
  const [canManageEvent, setCanManageEvent] = useState(false)
  const [canInteract, setCanInteract] = useState(false)

  useEffect(() => {
    // Etkinliği yükle
    const eventId = parseInt(params.id)

    // Silinmiş mi kontrol et
    const deletedIds = getDeletedEvents()
    if (deletedIds.includes(eventId)) {
      setEvent(null)
      return
    }
    
    // Önce örnek etkinliklerden ara
    let foundEvent = allEvents.find(e => e.id === eventId)
    
    // Bulunamazsa kullanıcı etkinliklerinden ara
    if (!foundEvent) {
      const userEvents = JSON.parse(localStorage.getItem('userEvents') || '[]')
      foundEvent = userEvents.find((e: any) => e.id === eventId)
    }

    if (foundEvent) {
      setEvent(foundEvent)
      
      // Global sayıları yükle
      const globalAttendees = getEventAttendeesCount(eventId)
      setAttendeesCount(globalAttendees)
      
      // Admin veya kurum yetkilisi mi? ve giriş durumu
      if (typeof window !== 'undefined') {
        const isUser = localStorage.getItem('isAuthenticated') === 'true'
        const isOrgAuth = localStorage.getItem('isOrganizationAuthenticated') === 'true'
        const canDoActions = isUser || isOrgAuth
        setCanInteract(canDoActions)

        if (canDoActions) {
          // localStorage'dan durumları yükle
          const attending = isEventAttending(eventId)
          setIsAttending(attending)
        } else {
          setIsAttending(false)
        }

        let canManage = false
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser)
            if (user.isAdmin) {
              canManage = true
            }
          } catch {}
        }

        const orgAuthStatus = localStorage.getItem('isOrganizationAuthenticated')
        const orgData = localStorage.getItem('currentOrganization')
        if (!canManage && orgAuthStatus === 'true' && orgData) {
          try {
            const org = JSON.parse(orgData)
            if (org.id === foundEvent.organization.id) {
              canManage = true
            }
          } catch {}
        }

        setCanManageEvent(canManage)
      }
    }
  }, [params.id])

  // Storage değişikliklerini dinle (diğer hesaplardan gelen güncellemeler için)
  useEffect(() => {
    if (!event) return

    const handleStorageChange = () => {
      const globalAttendees = getEventAttendeesCount(event.id)
      setAttendeesCount(globalAttendees)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('eventCountChange', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('eventCountChange', handleStorageChange)
    }
  }, [event])

  const handleAttendance = () => {
    if (!event) return
    if (!canInteract) {
      alert('Bu işlem için önce giriş yapmalısınız.')
      return
    }
    const newState = toggleEventAttendance(event.id)
    setIsAttending(newState)
    
    // Global sayıları güncelle
    const globalAttendees = getEventAttendeesCount(event.id)
    setAttendeesCount(globalAttendees)
    
    // Diğer sekmeleri/sayfaları bilgilendir
    window.dispatchEvent(new Event('eventCountChange'))
  }

  const handleDelete = () => {
    if (!event) return
    if (!window.confirm('Bu etkinliği silmek istediğinize emin misiniz?')) return

    deleteEvent(event.id)
    alert('Etkinlik silindi')
    router.push('/')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href,
      })
    } else {
      // Fallback: URL'yi kopyala
      navigator.clipboard.writeText(window.location.href)
      alert('Link kopyalandı!')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-gray-600">Etkinlik bulunamadı...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Geri Butonu */}
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <span className="mr-2">←</span>
        <span>Geri</span>
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="h-48 sm:h-64 bg-gradient-to-r from-primary-400 to-primary-600 relative">
          <div className="absolute top-4 right-4">
            <span className="bg-white px-4 py-2 rounded-full text-sm font-semibold text-primary-700">
              {event.category}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-8">
          <div className="mb-6">
            <Link href={`/organizations/${event.organization.id}`}>
              <div className="flex items-center space-x-3 mb-4 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-700 font-bold text-lg">
                    {event.organization.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">
                      {event.organization.name}
                    </h3>
                    {event.organization.verified && (
                      <span className="text-primary-600" title="Doğrulanmış Kurum">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{event.organization.type}</p>
                </div>
              </div>
            </Link>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {event.title}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center text-gray-700 mb-2">
                <span className="mr-2 text-xl">📅</span>
                <span className="font-semibold">Tarih</span>
              </div>
              <p className="text-gray-900">{formatDate(event.date)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center text-gray-700 mb-2">
                <span className="mr-2 text-xl">⏰</span>
                <span className="font-semibold">Saat</span>
              </div>
              <p className="text-gray-900">{event.time} - {event.endTime || event.time}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
              <div className="flex items-center text-gray-700 mb-2">
                <span className="mr-2 text-xl">📍</span>
                <span className="font-semibold">Konum</span>
              </div>
              <p className="text-gray-900">{event.location}</p>
              {event.address && (
                <p className="text-gray-600 text-sm mt-1">{event.address}</p>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Etkinlik Hakkında</h2>
            <div className="text-gray-700 whitespace-pre-line leading-relaxed">
              {event.description}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-6 text-gray-600">
              <div>
                <span className="font-semibold text-gray-900">{attendeesCount}</span>
                <span className="ml-1">katılımcı</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleShare}
                className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition-colors text-sm sm:text-base"
              >
                Paylaş
              </button>
              <button
                onClick={handleAttendance}
                className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                  isAttending
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {isAttending ? 'Katılmayı Planlıyorum ✓' : 'Katılmayı Planlıyorum'}
              </button>
              {canManageEvent && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base bg-red-50 text-red-600 hover:bg-red-100"
                >
                  Etkinliği Sil
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
