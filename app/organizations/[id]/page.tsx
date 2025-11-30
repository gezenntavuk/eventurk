'use client'

import { useState, useEffect } from 'react'
import EventCard from '@/components/EventCard'
import { 
  isOrganizationFollowed, 
  toggleOrganizationFollow, 
  getDeletedEvents,
  getOrganizationFollowerCount 
} from '@/lib/storage'

interface PageProps {
  params: {
    id: string
  }
}

const organization = {
  id: 1,
  name: 'T.C. Sanayi ve Teknoloji Bakanlığı',
  type: 'Resmi Kurum',
  description: 'Sanayi ve teknoloji alanında politika geliştirme ve uygulama faaliyetlerini yürüten resmi kurum. İnovasyon, Ar-Ge ve teknoloji transferi konularında öncü rol üstlenmektedir.',
  verified: true,
  totalEvents: 12,
  followers: 0,
  logo: '',
}

const organizationEvents = [
  {
    id: 1,
    title: 'Teknoloji ve İnovasyon Zirvesi 2024',
    description: 'Yapay zeka, blockchain ve gelecek teknolojileri hakkında uzman konuşmacıların yer alacağı kapsamlı bir etkinlik.',
    organization: {
      ...organization,
      logo: '',
    },
    date: '2024-03-15',
    time: '10:00',
    location: 'Ankara, Congresium',
    category: 'Teknoloji',
    attendees: 0,
    interested: 0,
    isUpcoming: true,
  },
  {
    id: 5,
    title: 'Startup Girişimcilik Programı',
    description: 'Yeni girişimcilere yönelik mentorluk ve eğitim programı. Başarılı girişimcilerle buluşma fırsatı!',
    organization: {
      ...organization,
      logo: '',
    },
    date: '2024-04-10',
    time: '13:00',
    location: 'İstanbul, Teknopark',
    category: 'Girişimcilik',
    attendees: 0,
    interested: 0,
    isUpcoming: true,
  },
]

export default function OrganizationPage({ params }: PageProps) {
  const [isFollowed, setIsFollowed] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [deletedIds, setDeletedIds] = useState<number[]>([])
  const [canInteract, setCanInteract] = useState(false)

  useEffect(() => {
    // localStorage'dan takip durumunu yükle
    const followed = isOrganizationFollowed(organization.id)
    setIsFollowed(followed)

    // Global takipçi sayısını yükle
    const globalCount = getOrganizationFollowerCount(organization.id)
    setFollowersCount(globalCount)

    if (typeof window !== 'undefined') {
      setDeletedIds(getDeletedEvents())
      const isUser = localStorage.getItem('isAuthenticated') === 'true'
      const isOrg = localStorage.getItem('isOrganizationAuthenticated') === 'true'
      setCanInteract(isUser || isOrg)
    }
  }, [])

  // Storage değişikliklerini dinle (diğer hesaplardan gelen güncellemeler için)
  useEffect(() => {
    const handleStorageChange = () => {
      const globalCount = getOrganizationFollowerCount(organization.id)
      setFollowersCount(globalCount)
    }

    window.addEventListener('storage', handleStorageChange)
    // Custom event için de dinle (aynı sekmede değişiklikler)
    window.addEventListener('followChange', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('followChange', handleStorageChange)
    }
  }, [])

  const handleFollow = () => {
    if (!canInteract) {
      alert('Kurumları takip etmek için önce giriş yapmalısınız.')
      return
    }

    const newState = toggleOrganizationFollow(organization.id)
    setIsFollowed(newState)
    
    // Global takipçi sayısını güncelle
    const globalCount = getOrganizationFollowerCount(organization.id)
    setFollowersCount(globalCount)
    
    // Diğer sekmeleri/sayfaları bilgilendir
    window.dispatchEvent(new Event('followChange'))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <div className="flex items-start space-x-6">
          <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <span className="text-primary-700 font-bold text-4xl">
              {organization.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
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
            <p className="text-gray-600 mb-4">{organization.type}</p>
            <p className="text-gray-700 mb-6">{organization.description}</p>
            <div className="flex space-x-6 text-sm">
              <div>
                <span className="font-semibold text-gray-900">{organization.totalEvents}</span>
                <span className="text-gray-600 ml-1">Etkinlik</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">{followersCount.toLocaleString('tr-TR')}</span>
                <span className="text-gray-600 ml-1">Takipçi</span>
              </div>
            </div>
            <button
              onClick={handleFollow}
              className={`mt-6 px-6 py-2 rounded-lg transition-colors ${
                isFollowed
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {isFollowed ? 'Takip Ediliyor ✓' : 'Takip Et'}
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Etkinlikler</h2>
      </div>

      <div className="space-y-6">
        {organizationEvents
          .filter((event) => !deletedIds.includes(event.id))
          .map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
      </div>
    </div>
  )
}
