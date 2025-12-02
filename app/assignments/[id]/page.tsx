'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  getAllAssignments,
  getAssignmentSubmission,
  submitAssignment,
  getStudentClass,
  getAllClasses,
  getTeacherClasses,
  createSharedPost,
  toggleLike,
  isLiked,
  addComment,
  deleteComment,
  getPublicSharedPosts,
} from '@/lib/storage'

interface PageProps {
  params: {
    id: string
  }
}

export default function AssignmentDetailPage({ params }: PageProps) {
  const router = useRouter()
  const assignmentId = parseInt(params.id)
  const [assignment, setAssignment] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [submission, setSubmission] = useState<any>(null)
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const [submitContent, setSubmitContent] = useState('')
  const [classes, setClasses] = useState<any[]>([])
  const [showShareForm, setShowShareForm] = useState(false)
  const [shareIsPublic, setShareIsPublic] = useState(false)
  const [sharedPost, setSharedPost] = useState<any>(null)
  const [commentText, setCommentText] = useState('')
  const [showComments, setShowComments] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Kullanıcı bilgilerini yükle
      const authStatus = localStorage.getItem('isAuthenticated')
      const userData = localStorage.getItem('user')
      
      let parsedUser: any = null
      
      if (authStatus === 'true' && userData) {
        parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setUserRole(parsedUser.role || null)
      } else {
        router.push('/login')
        return
      }

      // Ödevi yükle
      const assignments = getAllAssignments()
      const foundAssignment = assignments.find(a => a.id === assignmentId)
      
      if (!foundAssignment) {
        alert('Ödev bulunamadı')
        router.push('/')
        return
      }

      setAssignment(foundAssignment)

      // Öğrenci için teslim durumunu kontrol et
      if (parsedUser && parsedUser.role === 'ogrenci') {
        const existingSubmission = getAssignmentSubmission(assignmentId, parsedUser.id)
        setSubmission(existingSubmission)
        if (existingSubmission) {
          setSubmitContent(existingSubmission.content)
        }
      }

      // Öğretmen için sınıfları yükle
      if (parsedUser && parsedUser.role === 'ogretmen') {
        const teacherClasses = getTeacherClasses(parsedUser.id)
        setClasses(teacherClasses)
      }

      // Paylaşım kontrolü
      const publicPosts = getPublicSharedPosts()
      const existingPost = publicPosts.find(p => p.assignmentId === assignmentId)
      if (existingPost) {
        setSharedPost(existingPost)
      }
    }
  }, [assignmentId, router])

  const handleShare = () => {
    if (!user || !assignment) return

    try {
      const newPost = createSharedPost({
        assignmentId: assignment.id,
        userId: user.id,
        userName: user.name,
        userRole: user.role || 'kullanici',
        title: assignment.title,
        description: assignment.description,
        isPublic: shareIsPublic,
      })
      setSharedPost(newPost)
      setShowShareForm(false)
      alert('Ödev başarıyla paylaşıldı!')
    } catch (error) {
      alert('Paylaşım yapılırken bir hata oluştu')
    }
  }

  const handleLike = () => {
    if (!user || !sharedPost) return
    toggleLike(sharedPost.id, user.id)
    // Paylaşımı yeniden yükle
    const publicPosts = getPublicSharedPosts()
    const updatedPost = publicPosts.find(p => p.id === sharedPost.id)
    if (updatedPost) {
      setSharedPost(updatedPost)
    }
  }

  const handleAddComment = () => {
    if (!user || !sharedPost || !commentText.trim()) return

    try {
      addComment(sharedPost.id, user.id, user.name, user.role || 'kullanici', commentText)
      setCommentText('')
      // Paylaşımı yeniden yükle
      const publicPosts = getPublicSharedPosts()
      const updatedPost = publicPosts.find(p => p.id === sharedPost.id)
      if (updatedPost) {
        setSharedPost(updatedPost)
      }
    } catch (error) {
      alert('Yorum eklenirken bir hata oluştu')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !assignment) return

    try {
      submitAssignment({
        assignmentId: assignment.id,
        studentId: user.id,
        content: submitContent,
        attachments: [],
      })

      alert('Ödev başarıyla teslim edildi!')
      setShowSubmitForm(false)
      
      // Teslim durumunu güncelle
      const updatedSubmission = getAssignmentSubmission(assignmentId, user.id)
      setSubmission(updatedSubmission)
    } catch (error) {
      alert('Ödev teslim edilirken bir hata oluştu')
    }
  }

  if (!assignment || !user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-gray-600">Yükleniyor...</p>
      </div>
    )
  }

  const studentClass = userRole === 'ogrenci' ? getStudentClass(user.id) : null

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/"
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          ← Geri Dön
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{assignment.title}</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Açıklama</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{assignment.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <span className="text-sm font-medium text-gray-500">Teslim Tarihi:</span>
            <p className="text-gray-900 font-semibold">
              {new Date(assignment.dueDate).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          {assignment.materials && assignment.materials.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-500">Gerekli Materyaller:</span>
              <ul className="list-disc list-inside text-gray-700">
                {assignment.materials.map((material: string, index: number) => (
                  <li key={index}>{material}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {assignment.objectives && assignment.objectives.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Öğrenme Hedefleri</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {assignment.objectives.map((objective: string, index: number) => (
                <li key={index}>{objective}</li>
              ))}
            </ul>
          </div>
        )}

        {assignment.isPublic && (
          <div className="mb-4">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              Herkese Açık
            </span>
          </div>
        )}
      </div>

      {/* Öğrenci için teslim formu */}
      {userRole === 'ogrenci' && (
        <div className="bg-white rounded-lg shadow-md p-8">
          {submission ? (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Teslim Durumu</h2>
              <div className="mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  submission.status === 'graded' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {submission.status === 'graded' ? 'Değerlendirildi' : 'Teslim Edildi'}
                </span>
              </div>
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Teslim Tarihi:</h3>
                <p className="text-gray-900">
                  {new Date(submission.submittedAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Teslim Edilen İçerik:</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{submission.content}</p>
                </div>
              </div>
              {submission.grade !== undefined && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Not:</h3>
                  <p className="text-2xl font-bold text-primary-600">{submission.grade}</p>
                </div>
              )}
              {submission.feedback && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Geri Bildirim:</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{submission.feedback}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ödev Teslim Et</h2>
              {!showSubmitForm ? (
                <button
                  onClick={() => setShowSubmitForm(true)}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors"
                >
                  Ödevi Teslim Et
                </button>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ödev İçeriği *
                    </label>
                    <textarea
                      required
                      rows={10}
                      value={submitContent}
                      onChange={(e) => setSubmitContent(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Ödev içeriğinizi buraya yazın..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors"
                    >
                      Teslim Et
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSubmitForm(false)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* Öğretmen için öğrenci teslimlerini görüntüleme */}
      {userRole === 'ogretmen' && assignment.teacherId === user.id && (
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Öğrenci Teslimleri</h2>
          <p className="text-gray-600">Öğrenci teslimlerini görüntülemek için öğrenci listesi sayfasına gidin.</p>
        </div>
      )}

      {/* Paylaşım ve Sosyal Özellikler */}
      {user && (
        <div className="bg-white rounded-lg shadow-md p-8">
          {!sharedPost ? (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Paylaş</h2>
              {!showShareForm ? (
                <button
                  onClick={() => setShowShareForm(true)}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors"
                >
                  Ödevi Paylaş
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={shareIsPublic}
                        onChange={(e) => setShareIsPublic(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Herkese açık (herkes görebilir)</span>
                    </label>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleShare}
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors"
                    >
                      Paylaş
                    </button>
                    <button
                      onClick={() => setShowShareForm(false)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Paylaşım</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  sharedPost.isPublic 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {sharedPost.isPublic ? 'Herkese Açık' : 'Özel'}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">
                  {sharedPost.userName} ({sharedPost.userRole}) tarafından paylaşıldı
                </p>
                <p className="text-gray-700">{sharedPost.description}</p>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isLiked(sharedPost.id, user.id)
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>❤️</span>
                  <span>{sharedPost.likes.length}</span>
                </button>
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <span>💬</span>
                  <span>{sharedPost.comments.length}</span>
                </button>
              </div>

              {showComments && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Yorumlar</h3>
                    <div className="space-y-3 mb-4">
                      {sharedPost.comments.map((comment: any) => (
                        <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {comment.userName} ({comment.userRole})
                              </p>
                              <p className="text-gray-700 mt-1">{comment.content}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(comment.createdAt).toLocaleDateString('tr-TR')}
                              </p>
                            </div>
                            {comment.userId === user.id && (
                              <button
                                onClick={() => {
                                  deleteComment(sharedPost.id, comment.id, user.id)
                                  const publicPosts = getPublicSharedPosts()
                                  const updatedPost = publicPosts.find(p => p.id === sharedPost.id)
                                  if (updatedPost) {
                                    setSharedPost(updatedPost)
                                  }
                                }}
                                className="text-red-600 hover:text-red-700 text-sm"
                              >
                                Sil
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Yorum yazın..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddComment()
                          }
                        }}
                      />
                      <button
                        onClick={handleAddComment}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Gönder
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

