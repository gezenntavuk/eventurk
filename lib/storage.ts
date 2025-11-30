// localStorage utility fonksiyonları

export interface UserData {
  interestedEvents: number[]
  followedOrganizations: number[]
  attendingEvents: number[]
}

// Mevcut kullanıcı ID'sini al
function getCurrentUserId(): number | null {
  if (typeof window === 'undefined') return null
  
  try {
    const userStr = localStorage.getItem('user')
    if (!userStr) return null
    const user = JSON.parse(userStr)
    return user.id ?? null
  } catch {
    return null
  }
}

// Kullanıcı verilerini al (kullanıcı ID'sine göre)
export function getUserData(): UserData {
  if (typeof window === 'undefined') {
    return {
      interestedEvents: [],
      followedOrganizations: [],
      attendingEvents: [],
    }
  }

  const userId = getCurrentUserId()
  if (!userId) {
    // Giriş yapılmamışsa boş veri döndür
    return {
      interestedEvents: [],
      followedOrganizations: [],
      attendingEvents: [],
    }
  }

  // Kullanıcıya özel veri anahtarı
  const storageKey = `userData_${userId}`
  const data = localStorage.getItem(storageKey)
  
  if (data) {
    try {
      const parsed = JSON.parse(data)
      return {
        interestedEvents: parsed.interestedEvents || [],
        followedOrganizations: parsed.followedOrganizations || [],
        attendingEvents: parsed.attendingEvents || [],
      }
    } catch {
      return {
        interestedEvents: [],
        followedOrganizations: [],
        attendingEvents: [],
      }
    }
  }

  return {
    interestedEvents: [],
    followedOrganizations: [],
    attendingEvents: [],
  }
}

// Kullanıcı verilerini kaydet (kullanıcı ID'sine göre)
export function saveUserData(data: UserData): void {
  if (typeof window === 'undefined') return
  
  const userId = getCurrentUserId()
  if (!userId) {
    console.warn('Kullanıcı giriş yapmamış, veri kaydedilemiyor')
    return
  }

  // Kullanıcıya özel veri anahtarı
  const storageKey = `userData_${userId}`
  localStorage.setItem(storageKey, JSON.stringify(data))
}

// Belirli bir kullanıcının verilerini temizle (çıkış yaparken)
export function clearUserData(userId: number): void {
  if (typeof window === 'undefined') return
  const storageKey = `userData_${userId}`
  localStorage.removeItem(storageKey)
}

// Global ilgilenme sayılarını al (tüm hesaplar için geçerli)
export function getEventInterestedCounts(): Record<number, number> {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const data = localStorage.getItem('eventInterestedCounts')
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

// Belirli bir etkinliğin ilgilenme sayısını al
export function getEventInterestedCount(eventId: number): number {
  const counts = getEventInterestedCounts()
  return counts[eventId] || 0
}

// Global ilgilenme sayılarını kaydet
function saveEventInterestedCounts(counts: Record<number, number>): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('eventInterestedCounts', JSON.stringify(counts))
  }
}

// Etkinliğin ilgilenme sayısını artır (global)
function incrementEventInterested(eventId: number): void {
  const counts = getEventInterestedCounts()
  counts[eventId] = (counts[eventId] || 0) + 1
  saveEventInterestedCounts(counts)
}

// Etkinliğin ilgilenme sayısını azalt (global)
function decrementEventInterested(eventId: number): void {
  const counts = getEventInterestedCounts()
  if (counts[eventId] && counts[eventId] > 0) {
    counts[eventId] = counts[eventId] - 1
    saveEventInterestedCounts(counts)
  }
}

// Etkinliğe ilgi göster
export function toggleEventInterest(eventId: number): boolean {
  const data = getUserData()
  const index = data.interestedEvents.indexOf(eventId)
  
  if (index > -1) {
    // İlgilenmeyi kaldır
    data.interestedEvents.splice(index, 1)
    saveUserData(data)
    // Global ilgilenme sayısını azalt
    decrementEventInterested(eventId)
    return false
  } else {
    // İlgilenmeyi ekle
    data.interestedEvents.push(eventId)
    saveUserData(data)
    // Global ilgilenme sayısını artır
    incrementEventInterested(eventId)
    return true
  }
}

// Etkinliğe ilgi gösterilip gösterilmediğini kontrol et
export function isEventInterested(eventId: number): boolean {
  const data = getUserData()
  return data.interestedEvents.includes(eventId)
}

// Global takipçi sayılarını al (tüm hesaplar için geçerli)
export function getOrganizationFollowers(): Record<number, number> {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const data = localStorage.getItem('organizationFollowers')
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

// Belirli bir kurumun takipçi sayısını al
export function getOrganizationFollowerCount(orgId: number): number {
  const followers = getOrganizationFollowers()
  return followers[orgId] || 0
}

// Global takipçi sayılarını kaydet
function saveOrganizationFollowers(followers: Record<number, number>): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('organizationFollowers', JSON.stringify(followers))
  }
}

// Kurumun takipçi sayısını artır (global)
function incrementOrganizationFollower(orgId: number): void {
  const followers = getOrganizationFollowers()
  followers[orgId] = (followers[orgId] || 0) + 1
  saveOrganizationFollowers(followers)
}

// Kurumun takipçi sayısını azalt (global)
function decrementOrganizationFollower(orgId: number): void {
  const followers = getOrganizationFollowers()
  if (followers[orgId] && followers[orgId] > 0) {
    followers[orgId] = followers[orgId] - 1
    saveOrganizationFollowers(followers)
  }
}

// Kurumu takip et/takipten çık
export function toggleOrganizationFollow(orgId: number): boolean {
  const data = getUserData()
  const index = data.followedOrganizations.indexOf(orgId)
  
  if (index > -1) {
    // Takipten çık
    data.followedOrganizations.splice(index, 1)
    saveUserData(data)
    // Global takipçi sayısını azalt
    decrementOrganizationFollower(orgId)
    return false
  } else {
    // Takip et
    data.followedOrganizations.push(orgId)
    saveUserData(data)
    // Global takipçi sayısını artır
    incrementOrganizationFollower(orgId)
    return true
  }
}

// Kurum takip ediliyor mu kontrol et
export function isOrganizationFollowed(orgId: number): boolean {
  const data = getUserData()
  return data.followedOrganizations.includes(orgId)
}

// Global katılımcı sayılarını al (tüm hesaplar için geçerli)
export function getEventAttendeesCounts(): Record<number, number> {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const data = localStorage.getItem('eventAttendeesCounts')
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

// Belirli bir etkinliğin katılımcı sayısını al
export function getEventAttendeesCount(eventId: number): number {
  const counts = getEventAttendeesCounts()
  return counts[eventId] || 0
}

// Global katılımcı sayılarını kaydet
function saveEventAttendeesCounts(counts: Record<number, number>): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('eventAttendeesCounts', JSON.stringify(counts))
  }
}

// Etkinliğin katılımcı sayısını artır (global)
function incrementEventAttendees(eventId: number): void {
  const counts = getEventAttendeesCounts()
  counts[eventId] = (counts[eventId] || 0) + 1
  saveEventAttendeesCounts(counts)
}

// Etkinliğin katılımcı sayısını azalt (global)
function decrementEventAttendees(eventId: number): void {
  const counts = getEventAttendeesCounts()
  if (counts[eventId] && counts[eventId] > 0) {
    counts[eventId] = counts[eventId] - 1
    saveEventAttendeesCounts(counts)
  }
}

// Etkinliğe katılmayı planla/iptal et
export function toggleEventAttendance(eventId: number): boolean {
  const data = getUserData()
  const index = data.attendingEvents.indexOf(eventId)
  
  if (index > -1) {
    // Katılımı iptal et
    data.attendingEvents.splice(index, 1)
    saveUserData(data)
    // Global katılımcı sayısını azalt
    decrementEventAttendees(eventId)
    return false
  } else {
    // Katılmayı planla
    data.attendingEvents.push(eventId)
    // Eğer ilgilenilenlerde yoksa ekle
    if (!data.interestedEvents.includes(eventId)) {
      data.interestedEvents.push(eventId)
      // Global ilgilenme sayısını da artır
      incrementEventInterested(eventId)
    }
    saveUserData(data)
    // Global katılımcı sayısını artır
    incrementEventAttendees(eventId)
    return true
  }
}

// Etkinliğe katılmayı planlıyor mu kontrol et
export function isEventAttending(eventId: number): boolean {
  const data = getUserData()
  return data.attendingEvents.includes(eventId)
}

// --- Etkinlik silme / gizleme yardımcıları ---

// Silinmiş etkinlik ID'lerini al
export function getDeletedEvents(): number[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const data = localStorage.getItem('deletedEvents')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveDeletedEvents(ids: number[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('deletedEvents', JSON.stringify(ids))
  }
}

// Etkinliği userEvents listesinden tamamen kaldır
export function removeEventFromUserEvents(eventId: number): void {
  if (typeof window === 'undefined') return

  const events = JSON.parse(localStorage.getItem('userEvents') || '[]')
  const filtered = events.filter((event: any) => event.id !== eventId)
  localStorage.setItem('userEvents', JSON.stringify(filtered))
}

// Etkinliği silinmiş olarak işaretle (örnek veriler için)
export function markEventDeleted(eventId: number): void {
  const current = getDeletedEvents()
  if (!current.includes(eventId)) {
    current.push(eventId)
    saveDeletedEvents(current)
  }
}

// Genel silme fonksiyonu: kullanıcı etkinliklerinden kaldır + örnek verilerden gizle
export function deleteEvent(eventId: number): void {
  if (typeof window === 'undefined') return

  removeEventFromUserEvents(eventId)
  markEventDeleted(eventId)
}

