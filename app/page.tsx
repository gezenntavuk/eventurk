'use client'

import { useState, useEffect } from 'react'
import EventCard from '@/components/EventCard'
import { allEvents, allOrganizations } from '@/lib/data'
import { getUserData, getDeletedEvents } from '@/lib/storage'

// Örnek etkinlik verileri
const sampleEvents = [
  {
    id: 1,
    title: 'Teknoloji ve İnovasyon Zirvesi 2024',
    description: 'Yapay zeka, blockchain ve gelecek teknolojileri hakkında uzman konuşmacıların yer alacağı kapsamlı bir etkinlik. Sektörün önde gelen isimleriyle buluşma fırsatı!',
    organization: {
      id: 1,
      name: 'T.C. Sanayi ve Teknoloji Bakanlığı',
      type: 'Resmi Kurum',
      logo: '',
      verified: true,
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
    id: 2,
    title: 'Kültür ve Sanat Festivali',
    description: 'Geleneksel Türk sanatları, müzik performansları ve sergilerle dolu bir hafta sonu. Tüm sanatseverler davetlidir!',
    organization: {
      id: 2,
      name: 'T.C. Kültür ve Turizm Bakanlığı',
      type: 'Resmi Kurum',
      logo: '',
      verified: true,
    },
    date: '2024-03-20',
    time: '14:00',
    location: 'İstanbul, Taksim Meydanı',
    category: 'Kültür & Sanat',
    attendees: 0,
    interested: 0,
    isUpcoming: true,
  },
  {
    id: 3,
    title: 'Çevre ve Sürdürülebilirlik Sempozyumu',
    description: 'İklim değişikliği, yenilenebilir enerji ve çevre koruma konularında farkındalık yaratmak için düzenlenen önemli bir etkinlik.',
    organization: {
      id: 3,
      name: 'T.C. Çevre, Şehircilik ve İklim Değişikliği Bakanlığı',
      type: 'Resmi Kurum',
      logo: '',
      verified: true,
    },
    date: '2024-03-25',
    time: '09:30',
    location: 'İzmir, Fuar İzmir',
    category: 'Çevre',
    attendees: 0,
    interested: 0,
    isUpcoming: true,
  },
  {
    id: 4,
    title: 'Gençlik ve Spor Festivali',
    description: 'Gençlerin katılabileceği çeşitli spor aktiviteleri, turnuvalar ve eğlenceli yarışmalar. Sağlıklı yaşam ve spor kültürünü yaygınlaştırmak için!',
    organization: {
      id: 4,
      name: 'T.C. Gençlik ve Spor Bakanlığı',
      type: 'Resmi Kurum',
      logo: '',
      verified: true,
    },
    date: '2024-04-01',
    time: '08:00',
    location: 'Bursa, Merinos Park',
    category: 'Spor',
    attendees: 0,
    interested: 0,
    isUpcoming: true,
  },
]

export default function Home() {
  const [events, setEvents] = useState(sampleEvents)
  const [followedOrgs, setFollowedOrgs] = useState<any[]>([])

  useEffect(() => {
    // Kurumların oluşturduğu etkinlikleri yükle
    const userEvents = JSON.parse(localStorage.getItem('userEvents') || '[]')
    const deletedIds = getDeletedEvents()
    // Tüm etkinlikleri birleştir
    const allEventsList = [...sampleEvents, ...userEvents].filter(
      (event) => !deletedIds.includes(event.id)
    )
    setEvents(allEventsList)

    // Takip edilen kurumları yükle
    const userData = getUserData()
    const orgsMap = new Map<number, any>()

    // Sabit kurumlar
    allOrganizations.forEach((org) => {
      orgsMap.set(org.id, org)
    })

    // localStorage'daki kurumlar
    if (typeof window !== 'undefined') {
      const storedOrgs = JSON.parse(localStorage.getItem('organizations') || '[]')
      storedOrgs.forEach((org: any) => {
        orgsMap.set(org.id, org)
      })
    }

    const followed = userData.followedOrganizations
      .map((id) => orgsMap.get(id))
      .filter(Boolean)

    setFollowedOrgs(followed)
  }, [])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Etkinlikler
        </h1>
        <p className="text-gray-600">
          Resmi kurumların düzenlediği etkinlikleri keşfedin ve katılın
        </p>
      </div>

      {followedOrgs.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            Takip Ettiklerin
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-2 px-2">
            {followedOrgs.map((org) => (
              <a
                key={org.id}
                href={`/organizations/${org.id}`}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-white shadow-sm border border-gray-200 flex-shrink-0 hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-700">
                  {org.name.charAt(0)}
                </div>
                <span className="text-sm text-gray-800 line-clamp-1 max-w-[140px]">
                  {org.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-3">
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold text-sm sm:text-base">
          Tümü
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm sm:text-base">
          Yaklaşan
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm sm:text-base">
          Geçmiş
        </button>
      </div>

      <div className="space-y-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}
