'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  getPublicSharedPosts,
  getAllAssignments,
  toggleLike,
  isLiked,
  addComment,
  deleteComment,
  getTeacherClasses,
  getAllClasses,
} from '@/lib/storage'

export default function Explore() {
  const [user, setUser] = useState<any>(null)
  const [sharedPosts, setSharedPosts] = useState<any[]>([])
  const [publicAssignments, setPublicAssignments] = useState<any[]>([])
  const [commentTexts, setCommentTexts] = useState<Record<number, string>>({})
  const [showComments, setShowComments] = useState<Record<number, boolean>>({})

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authStatus = localStorage.getItem('isAuthenticated')
      const userData = localStorage.getItem('user')
      
      if (authStatus === 'true' && userData) {
        setUser(JSON.parse(userData))
      }

      // Public paylaşımları yükle
      const posts = getPublicSharedPosts()
      setSharedPosts(posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))

      // Herkese açık ödevleri yükle
      const assignments = getAllAssignments().filter(a => a.isPublic)
      // Öğretmen bilgilerini ekle
      const assignmentsWithTeacher = assignments.map(assignment => {
        const classes = getAllClasses()
        const assignmentClass = classes.find(c => c.id === assignment.classId)
        const teacherClasses = assignmentClass ? getTeacherClasses(assignment.teacherId) : []
        const teacherClass = teacherClasses.find(tc => tc.id === assignment.classId)
        
        return {
          ...assignment,
          teacherName: 'Öğretmen', // Gerçek uygulamada öğretmen bilgisi alınmalı
          className: assignmentClass?.name || 'Bilinmeyen Sınıf',
        }
      })
      setPublicAssignments(assignmentsWithTeacher.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    }
  }, [])

  const handleLike = (postId: number) => {
    if (!user) {
      alert('Beğenmek için giriş yapmalısınız')
      return
    }
    toggleLike(postId, user.id)
    // Paylaşımları yeniden yükle
    const posts = getPublicSharedPosts()
    setSharedPosts(posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
  }

  const handleAddComment = (postId: number) => {
    if (!user) {
      alert('Yorum yapmak için giriş yapmalısınız')
      return
    }
    const commentText = commentTexts[postId] || ''
    if (!commentText.trim()) return

    try {
      addComment(postId, user.id, user.name, user.role || 'kullanici', commentText)
      setCommentTexts({ ...commentTexts, [postId]: '' })
      // Paylaşımları yeniden yükle
      const posts = getPublicSharedPosts()
      setSharedPosts(posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    } catch (error) {
      alert('Yorum eklenirken bir hata oluştu')
    }
  }

  const handleDeleteComment = (postId: number, commentId: number) => {
    if (!user) return
    deleteComment(postId, commentId, user.id)
    // Paylaşımları yeniden yükle
    const posts = getPublicSharedPosts()
    setSharedPosts(posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Keşfet</h1>
        <p className="text-gray-600">
          Paylaşılan ödevleri ve herkese açık ödevleri keşfedin, beğenin ve yorum yapın
        </p>
      </div>

      {/* Herkese Açık Ödevler */}
      {publicAssignments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Herkese Açık Ödevler</h2>
          <div className="space-y-4">
            {publicAssignments.map((assignment) => (
              <Link
                key={assignment.id}
                href={`/assignments/${assignment.id}`}
                className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{assignment.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{assignment.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>📅 Teslim: {new Date(assignment.dueDate).toLocaleDateString('tr-TR')}</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        Herkese Açık
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Paylaşılan Ödevler */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Paylaşılan Ödevler</h2>
        <div className="space-y-6">
          {sharedPosts.length > 0 ? (
            sharedPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <Link
                      href={`/assignments/${post.assignmentId}`}
                      className="text-xl font-bold text-gray-900 hover:text-primary-600"
                    >
                      {post.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      {post.userName} ({post.userRole}) tarafından paylaşıldı ·{' '}
                      {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Herkese Açık
                  </span>
                </div>
                <p className="text-gray-700 mt-3">{post.description}</p>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    user && isLiked(post.id, user.id)
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>❤️</span>
                  <span>{post.likes.length}</span>
                </button>
                <button
                  onClick={() => setShowComments({ ...showComments, [post.id]: !showComments[post.id] })}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <span>💬</span>
                  <span>{post.comments.length}</span>
                </button>
              </div>

              {showComments[post.id] && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Yorumlar</h3>
                    <div className="space-y-3 mb-4">
                      {post.comments.length > 0 ? (
                        post.comments.map((comment: any) => (
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
                              {user && comment.userId === user.id && (
                                <button
                                  onClick={() => handleDeleteComment(post.id, comment.id)}
                                  className="text-red-600 hover:text-red-700 text-sm"
                                >
                                  Sil
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">Henüz yorum yok</p>
                      )}
                    </div>
                    {user ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentTexts[post.id] || ''}
                          onChange={(e) => setCommentTexts({ ...commentTexts, [post.id]: e.target.value })}
                          placeholder="Yorum yazın..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddComment(post.id)
                            }
                          }}
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          Gönder
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Yorum yapmak için{' '}
                        <Link href="/login" className="text-primary-600 hover:underline">
                          giriş yapın
                        </Link>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500">Henüz paylaşılan ödev bulunmuyor</p>
              <p className="text-sm text-gray-400 mt-2">
                Ödev detay sayfasından ödevlerinizi paylaşabilirsiniz
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hiçbir şey yoksa */}
      {sharedPosts.length === 0 && publicAssignments.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">Henüz keşfedilecek içerik bulunmuyor</p>
          <p className="text-sm text-gray-400 mt-2">
            Herkese açık ödevler ve paylaşımlar burada görünecek
          </p>
        </div>
      )}
    </div>
  )
}
