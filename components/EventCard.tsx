'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  isEventInterested, 
  toggleEventInterest,
  getEventInterestedCount,
  getEventAttendeesCount 
} from '@/lib/storage'

interface Organization {
  id: number
  name: string
  type: string
  logo: string
  verified: boolean
}

interface Event {
  id: number
  title: string
  description: string
  organization: Organization
  date: string
  time: string
  location: string
  category: string
  image?: string
  attendees: number
  interested: number
  isUpcoming: boolean
}

interface EventCardProps {
  event: Event
}

export default function EventCard({ event }: EventCardProps) {
  const [isInterested, setIsInterested] = useState(false)
  const [interestedCount, setInterestedCount] = useState(0)
  const [attendeesCount, setAttendeesCount] = useState(0)
  const [canInteract, setCanInteract] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Giriş kontrolü
      const isUser = localStorage.getItem('isAuthenticated') === 'true'
      const isOrg = localStorage.getItem('isOrganizationAuthenticated') === 'true'
      const allowed = isUser || isOrg
      setCanInteract(allowed)

      // Global sayıları yükle
      const globalInterested = getEventInterestedCount(event.id)
      const globalAttendees = getEventAttendeesCount(event.id)
      setInterestedCount(globalInterested)
      setAttendeesCount(globalAttendees)

      if (allowed) {
        // localStorage'dan ilgi durumunu yükle
        const interested = isEventInterested(event.id)
        setIsInterested(interested)
      } else {
        setIsInterested(false)
      }
    }
  }, [event.id])

  // Storage değişikliklerini dinle (diğer hesaplardan gelen güncellemeler için)
  useEffect(() => {
    const handleStorageChange = () => {
      const globalInterested = getEventInterestedCount(event.id)
      const globalAttendees = getEventAttendeesCount(event.id)
      setInterestedCount(globalInterested)
      setAttendeesCount(globalAttendees)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('eventCountChange', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('eventCountChange', handleStorageChange)
    }
  }, [event.id])

  const handleInterest = () => {
    if (!canInteract) {
      alert('Bu işlem için önce giriş yapmalısınız.')
      return
    }

    const newState = toggleEventInterest(event.id)
    setIsInterested(newState)
    
    // Global sayıları güncelle
    const globalInterested = getEventInterestedCount(event.id)
    setInterestedCount(globalInterested)
    
    // Diğer sekmeleri/sayfaları bilgilendir
    window.dispatchEvent(new Event('eventCountChange'))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <Link href={`/events/${event.id}`}>
        <div className="cursor-pointer">
          {event.image && (
            <div className="h-48 bg-gradient-to-r from-primary-400 to-primary-600 relative">
              <div className="absolute top-4 right-4">
                <span className="bg-white px-3 py-1 rounded-full text-xs font-semibold text-primary-700">
                  {event.category}
                </span>
              </div>
            </div>
          )}
          
          <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <Link href={`/organizations/${event.organization.id}`} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
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

            <h2 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h2>
            <p className="text-gray-700 mb-4 line-clamp-2">{event.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-gray-600">
                <span className="mr-2">📅</span>
                <span className="text-sm">{formatDate(event.date)}</span>
                <span className="mx-2">·</span>
                <span className="text-sm">{event.time}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <span className="mr-2">📍</span>
                <span className="text-sm">{event.location}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      <div className="px-6 pb-6">
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>👥 {attendeesCount} katılımcı</span>
            <span>❤️ {interestedCount} ilgilenen</span>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              handleInterest()
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              isInterested
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isInterested ? 'İlgileniyorum ✓' : 'İlgileniyorum'}
          </button>
        </div>
      </div>
    </div>
  )
}
