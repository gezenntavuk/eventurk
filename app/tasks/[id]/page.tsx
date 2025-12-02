'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  getAllTasks,
  getTaskSubmission,
  submitTask,
  getStudentClass,
} from '@/lib/storage'

interface PageProps {
  params: {
    id: string
  }
}

export default function TaskDetailPage({ params }: PageProps) {
  const router = useRouter()
  const taskId = parseInt(params.id)
  const [task, setTask] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [submission, setSubmission] = useState<any>(null)
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const [submitContent, setSubmitContent] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Kullanıcı bilgilerini yükle
      const authStatus = localStorage.getItem('isAuthenticated')
      const userData = localStorage.getItem('user')
      
      if (authStatus === 'true' && userData) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setUserRole(parsedUser.role || null)
      } else {
        router.push('/login')
        return
      }

      // Görevi yükle
      const tasks = getAllTasks()
      const foundTask = tasks.find(t => t.id === taskId)
      
      if (!foundTask) {
        alert('Görev bulunamadı')
        router.push('/')
        return
      }

      setTask(foundTask)

      // Öğrenci için teslim durumunu kontrol et
      if (parsedUser.role === 'ogrenci') {
        const existingSubmission = getTaskSubmission(taskId, parsedUser.id)
        setSubmission(existingSubmission)
        if (existingSubmission) {
          setSubmitContent(existingSubmission.content)
        }
      }
    }
  }, [taskId, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !task) return

    try {
      submitTask({
        taskId: task.id,
        studentId: user.id,
        content: submitContent,
        attachments: [],
      })

      alert('Görev başarıyla teslim edildi!')
      setShowSubmitForm(false)
      
      // Teslim durumunu güncelle
      const updatedSubmission = getTaskSubmission(taskId, user.id)
      setSubmission(updatedSubmission)
    } catch (error) {
      alert('Görev teslim edilirken bir hata oluştu')
    }
  }

  if (!task || !user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-gray-600">Yükleniyor...</p>
      </div>
    )
  }

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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{task.title}</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Açıklama</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <span className="text-sm font-medium text-gray-500">Teslim Tarihi:</span>
            <p className="text-gray-900 font-semibold">
              {new Date(task.dueDate).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          {task.materials && task.materials.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-500">Gerekli Materyaller:</span>
              <ul className="list-disc list-inside text-gray-700">
                {task.materials.map((material: string, index: number) => (
                  <li key={index}>{material}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {task.steps && task.steps.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Görev Adımları</h3>
            <ol className="list-decimal list-inside text-gray-700 space-y-2">
              {task.steps.map((step: string, index: number) => (
                <li key={index} className="pl-2">{step}</li>
              ))}
            </ol>
          </div>
        )}

        {task.objectives && task.objectives.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Öğrenme Hedefleri</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {task.objectives.map((objective: string, index: number) => (
                <li key={index}>{objective}</li>
              ))}
            </ul>
          </div>
        )}

        {task.isPublic && (
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
                  submission.status === 'completed' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {submission.status === 'completed' ? 'Tamamlandı' : 'Teslim Edildi'}
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
              <h2 className="text-xl font-bold text-gray-900 mb-4">Görev Teslim Et</h2>
              {!showSubmitForm ? (
                <button
                  onClick={() => setShowSubmitForm(true)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
                >
                  Görevi Teslim Et
                </button>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Görev İçeriği *
                    </label>
                    <textarea
                      required
                      rows={10}
                      value={submitContent}
                      onChange={(e) => setSubmitContent(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Görev içeriğinizi buraya yazın..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
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
    </div>
  )
}

