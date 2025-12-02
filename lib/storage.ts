// localStorage utility fonksiyonları

export interface UserData {
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
      followedOrganizations: [],
      attendingEvents: [],
    }
  }

  const userId = getCurrentUserId()
  if (!userId) {
    // Giriş yapılmamışsa boş veri döndür
    return {
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
        followedOrganizations: parsed.followedOrganizations || [],
        attendingEvents: parsed.attendingEvents || [],
      }
    } catch {
      return {
        followedOrganizations: [],
        attendingEvents: [],
      }
    }
  }

  return {
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

// --- Template Yönetimi (Maarif Modeli için) ---

export interface EventTemplate {
  id: number
  organizationId: number
  title: string
  description: string
  category: string
  targetAudience: string // Hedef kitle (örn: "İlkokul 3. Sınıf", "Lise Öğrencileri")
  duration: string // Süre (örn: "2 saat", "1 gün")
  materials: string[] // Gerekli materyaller
  objectives: string[] // Öğrenme hedefleri
  activities: string[] // Etkinlik adımları
  evaluation: string // Değerlendirme kriterleri
  createdAt: string
  isTemplate: true
}

export interface TaskTemplate {
  id: number
  organizationId: number
  title: string
  description: string
  category: string
  targetAudience: string
  duration: string
  materials: string[]
  objectives: string[]
  steps: string[] // Görev adımları
  evaluation: string
  createdAt: string
  isTemplate: true
}

// Mevcut kurum ID'sini al
function getCurrentOrganizationId(): number | null {
  if (typeof window === 'undefined') return null
  
  try {
    const orgStr = localStorage.getItem('currentOrganization')
    if (!orgStr) return null
    const org = JSON.parse(orgStr)
    return org.id ?? null
  } catch {
    return null
  }
}

// Tüm template'leri al
export function getAllTemplates(): (EventTemplate | TaskTemplate)[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const data = localStorage.getItem('contentTemplates')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

// Kurumun template'lerini al
export function getOrganizationTemplates(orgId: number): (EventTemplate | TaskTemplate)[] {
  const allTemplates = getAllTemplates()
  return allTemplates.filter((template) => template.organizationId === orgId)
}

// Template kaydet
export function saveTemplate(template: Omit<EventTemplate | TaskTemplate, 'id' | 'createdAt'>): void {
  if (typeof window === 'undefined') return

  const orgId = getCurrentOrganizationId()
  if (!orgId) {
    console.warn('Kurum giriş yapmamış, template kaydedilemiyor')
    return
  }

  const templates = getAllTemplates()
  const newTemplate = {
    ...template,
    id: Date.now(),
    organizationId: orgId,
    createdAt: new Date().toISOString(),
    isTemplate: true as const,
  }

  templates.push(newTemplate)
  localStorage.setItem('contentTemplates', JSON.stringify(templates))
}

// Template sil
export function deleteTemplate(templateId: number): void {
  if (typeof window === 'undefined') return

  const templates = getAllTemplates()
  const filtered = templates.filter((template) => template.id !== templateId)
  localStorage.setItem('contentTemplates', JSON.stringify(filtered))
}

// --- Ödev ve Görev Sistemi (Maarif Modeli) ---

export interface Class {
  id: number
  name: string // Örn: "3-A", "5-B"
  grade: number // Sınıf seviyesi (1-12)
  teacherId: number // Öğretmen ID
  studentIds: number[] // Öğrenci ID'leri
  createdAt: string
}

export interface StudentParentRelation {
  id: number
  studentId: number
  parentId: number
  relationType: 'anne' | 'baba' | 'vası' | 'diğer'
  createdAt: string
}

export interface Assignment {
  id: number
  title: string
  description: string
  classId: number
  teacherId: number
  templateId?: number // Kurum template'inden oluşturulduysa
  dueDate: string // Teslim tarihi
  createdAt: string
  materials?: string[] // Gerekli materyaller
  objectives?: string[] // Öğrenme hedefleri
  isPublic: boolean // Herkes görebilir mi
}

export interface Task {
  id: number
  title: string
  description: string
  classId: number
  teacherId: number
  templateId?: number
  dueDate: string
  createdAt: string
  materials?: string[]
  objectives?: string[]
  steps?: string[] // Görev adımları
  isPublic: boolean
}

export interface AssignmentSubmission {
  id: number
  assignmentId: number
  studentId: number
  content: string // Ödev içeriği
  attachments?: string[] // Ek dosyalar (URL'ler)
  submittedAt: string
  status: 'submitted' | 'graded'
  grade?: number
  feedback?: string
}

export interface TaskSubmission {
  id: number
  taskId: number
  studentId: number
  content: string
  attachments?: string[]
  submittedAt: string
  status: 'submitted' | 'completed'
  feedback?: string
}

// Sınıf oluştur
export function createClass(name: string, grade: number, teacherId: number): Class {
  if (typeof window === 'undefined') {
    throw new Error('Sınıf oluşturulamıyor')
  }

  const classes = getAllClasses()
  const newClass: Class = {
    id: Date.now(),
    name,
    grade,
    teacherId,
    studentIds: [],
    createdAt: new Date().toISOString(),
  }

  classes.push(newClass)
  localStorage.setItem('classes', JSON.stringify(classes))
  return newClass
}

// Tüm sınıfları al
export function getAllClasses(): Class[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const data = localStorage.getItem('classes')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

// Öğretmenin sınıflarını al
export function getTeacherClasses(teacherId: number): Class[] {
  return getAllClasses().filter((cls) => cls.teacherId === teacherId)
}

// Öğrencinin sınıfını al
export function getStudentClass(studentId: number): Class | null {
  const classes = getAllClasses()
  return classes.find((cls) => cls.studentIds.includes(studentId)) || null
}

// Sınıfa öğrenci ekle
export function addStudentToClass(classId: number, studentId: number): void {
  if (typeof window === 'undefined') return

  const classes = getAllClasses()
  const classIndex = classes.findIndex((cls) => cls.id === classId)
  
  if (classIndex !== -1 && !classes[classIndex].studentIds.includes(studentId)) {
    classes[classIndex].studentIds.push(studentId)
    localStorage.setItem('classes', JSON.stringify(classes))
  }
}

// Öğrenci-veli ilişkisi oluştur
export function createStudentParentRelation(
  studentId: number,
  parentId: number,
  relationType: 'anne' | 'baba' | 'vası' | 'diğer'
): StudentParentRelation {
  if (typeof window === 'undefined') {
    throw new Error('İlişki oluşturulamıyor')
  }

  const relations = getAllStudentParentRelations()
  const newRelation: StudentParentRelation = {
    id: Date.now(),
    studentId,
    parentId,
    relationType,
    createdAt: new Date().toISOString(),
  }

  relations.push(newRelation)
  localStorage.setItem('studentParentRelations', JSON.stringify(relations))
  return newRelation
}

// Tüm öğrenci-veli ilişkilerini al
export function getAllStudentParentRelations(): StudentParentRelation[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const data = localStorage.getItem('studentParentRelations')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

// Velinin öğrencilerini al
export function getParentStudents(parentId: number): number[] {
  const relations = getAllStudentParentRelations()
  return relations
    .filter((rel) => rel.parentId === parentId)
    .map((rel) => rel.studentId)
}

// Öğrencinin velilerini al
export function getStudentParents(studentId: number): number[] {
  const relations = getAllStudentParentRelations()
  return relations
    .filter((rel) => rel.studentId === studentId)
    .map((rel) => rel.parentId)
}

// Ödev oluştur
export function createAssignment(assignment: Omit<Assignment, 'id' | 'createdAt'>): Assignment {
  if (typeof window === 'undefined') {
    throw new Error('Ödev oluşturulamıyor')
  }

  const assignments = getAllAssignments()
  const newAssignment: Assignment = {
    ...assignment,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  }

  assignments.push(newAssignment)
  localStorage.setItem('assignments', JSON.stringify(assignments))
  return newAssignment
}

// Tüm ödevleri al
export function getAllAssignments(): Assignment[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const data = localStorage.getItem('assignments')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

// Sınıfın ödevlerini al
export function getClassAssignments(classId: number): Assignment[] {
  return getAllAssignments().filter((assignment) => assignment.classId === classId)
}

// Öğrencinin ödevlerini al
export function getStudentAssignments(studentId: number): Assignment[] {
  const studentClass = getStudentClass(studentId)
  if (!studentClass) return []
  
  return getAllAssignments().filter((assignment) => assignment.classId === studentClass.id)
}

// Görev oluştur
export function createTask(task: Omit<Task, 'id' | 'createdAt'>): Task {
  if (typeof window === 'undefined') {
    throw new Error('Görev oluşturulamıyor')
  }

  const tasks = getAllTasks()
  const newTask: Task = {
    ...task,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  }

  tasks.push(newTask)
  localStorage.setItem('tasks', JSON.stringify(tasks))
  return newTask
}

// Tüm görevleri al
export function getAllTasks(): Task[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const data = localStorage.getItem('tasks')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

// Sınıfın görevlerini al
export function getClassTasks(classId: number): Task[] {
  return getAllTasks().filter((task) => task.classId === classId)
}

// Öğrencinin görevlerini al
export function getStudentTasks(studentId: number): Task[] {
  const studentClass = getStudentClass(studentId)
  if (!studentClass) return []
  
  return getAllTasks().filter((task) => task.classId === studentClass.id)
}

// Ödev teslimi yap
export function submitAssignment(submission: Omit<AssignmentSubmission, 'id' | 'submittedAt'>): AssignmentSubmission {
  if (typeof window === 'undefined') {
    throw new Error('Ödev teslim edilemiyor')
  }

  const submissions = getAllAssignmentSubmissions()
  const newSubmission: AssignmentSubmission = {
    ...submission,
    id: Date.now(),
    submittedAt: new Date().toISOString(),
    status: 'submitted',
  }

  submissions.push(newSubmission)
  localStorage.setItem('assignmentSubmissions', JSON.stringify(submissions))
  return newSubmission
}

// Tüm ödev teslimlerini al
export function getAllAssignmentSubmissions(): AssignmentSubmission[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const data = localStorage.getItem('assignmentSubmissions')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

// Öğrencinin ödev teslimlerini al
export function getStudentAssignmentSubmissions(studentId: number): AssignmentSubmission[] {
  return getAllAssignmentSubmissions().filter((sub) => sub.studentId === studentId)
}

// Ödev teslimini al
export function getAssignmentSubmission(assignmentId: number, studentId: number): AssignmentSubmission | null {
  const submissions = getAllAssignmentSubmissions()
  return submissions.find((sub) => sub.assignmentId === assignmentId && sub.studentId === studentId) || null
}

// Görev teslimi yap
export function submitTask(submission: Omit<TaskSubmission, 'id' | 'submittedAt'>): TaskSubmission {
  if (typeof window === 'undefined') {
    throw new Error('Görev teslim edilemiyor')
  }

  const submissions = getAllTaskSubmissions()
  const newSubmission: TaskSubmission = {
    ...submission,
    id: Date.now(),
    submittedAt: new Date().toISOString(),
    status: 'submitted',
  }

  submissions.push(newSubmission)
  localStorage.setItem('taskSubmissions', JSON.stringify(submissions))
  return newSubmission
}

// Tüm görev teslimlerini al
export function getAllTaskSubmissions(): TaskSubmission[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const data = localStorage.getItem('taskSubmissions')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

// Öğrencinin görev teslimlerini al
export function getStudentTaskSubmissions(studentId: number): TaskSubmission[] {
  return getAllTaskSubmissions().filter((sub) => sub.studentId === studentId)
}

// Görev teslimini al
export function getTaskSubmission(taskId: number, studentId: number): TaskSubmission | null {
  const submissions = getAllTaskSubmissions()
  return submissions.find((sub) => sub.taskId === taskId && sub.studentId === studentId) || null
}

// --- Paylaşım, Like ve Yorum Sistemi ---

export interface SharedPost {
  id: number
  assignmentId: number
  userId: number
  userName: string
  userRole: string
  title: string
  description: string
  isPublic: boolean // Herkes görebilir mi
  likes: number[]
  comments: Comment[]
  createdAt: string
}

export interface Comment {
  id: number
  userId: number
  userName: string
  userRole: string
  content: string
  createdAt: string
}

// Paylaşım oluştur
export function createSharedPost(post: Omit<SharedPost, 'id' | 'createdAt' | 'likes' | 'comments'>): SharedPost {
  if (typeof window === 'undefined') {
    throw new Error('Paylaşım oluşturulamıyor')
  }

  const posts = getAllSharedPosts()
  const newPost: SharedPost = {
    ...post,
    id: Date.now(),
    likes: [],
    comments: [],
    createdAt: new Date().toISOString(),
  }

  posts.push(newPost)
  localStorage.setItem('sharedPosts', JSON.stringify(posts))
  return newPost
}

// Tüm paylaşımları al
export function getAllSharedPosts(): SharedPost[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const data = localStorage.getItem('sharedPosts')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

// Public paylaşımları al
export function getPublicSharedPosts(): SharedPost[] {
  return getAllSharedPosts().filter((post) => post.isPublic)
}

// Paylaşıma like ekle/kaldır
export function toggleLike(postId: number, userId: number): boolean {
  if (typeof window === 'undefined') return false

  const posts = getAllSharedPosts()
  const postIndex = posts.findIndex((p) => p.id === postId)
  
  if (postIndex === -1) return false

  const likeIndex = posts[postIndex].likes.indexOf(userId)
  
  if (likeIndex > -1) {
    // Like'ı kaldır
    posts[postIndex].likes.splice(likeIndex, 1)
  } else {
    // Like ekle
    posts[postIndex].likes.push(userId)
  }

  localStorage.setItem('sharedPosts', JSON.stringify(posts))
  return likeIndex === -1
}

// Kullanıcı beğenmiş mi kontrol et
export function isLiked(postId: number, userId: number): boolean {
  const posts = getAllSharedPosts()
  const post = posts.find((p) => p.id === postId)
  return post ? post.likes.includes(userId) : false
}

// Yorum ekle
export function addComment(postId: number, userId: number, userName: string, userRole: string, content: string): Comment {
  if (typeof window === 'undefined') {
    throw new Error('Yorum eklenemiyor')
  }

  const posts = getAllSharedPosts()
  const postIndex = posts.findIndex((p) => p.id === postId)
  
  if (postIndex === -1) {
    throw new Error('Paylaşım bulunamadı')
  }

  const newComment: Comment = {
    id: Date.now(),
    userId,
    userName,
    userRole,
    content,
    createdAt: new Date().toISOString(),
  }

  posts[postIndex].comments.push(newComment)
  localStorage.setItem('sharedPosts', JSON.stringify(posts))
  return newComment
}

// Yorum sil
export function deleteComment(postId: number, commentId: number, userId: number): boolean {
  if (typeof window === 'undefined') return false

  const posts = getAllSharedPosts()
  const postIndex = posts.findIndex((p) => p.id === postId)
  
  if (postIndex === -1) return false

  const commentIndex = posts[postIndex].comments.findIndex(
    (c) => c.id === commentId && c.userId === userId
  )
  
  if (commentIndex === -1) return false

  posts[postIndex].comments.splice(commentIndex, 1)
  localStorage.setItem('sharedPosts', JSON.stringify(posts))
  return true
}

