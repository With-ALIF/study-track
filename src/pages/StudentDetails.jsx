import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Phone, School, StickyNote, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function StudentDetails() {
  const { name } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedSubject, setExpandedSubject] = useState(null)
  const [initializing, setInitializing] = useState(false)

  useEffect(() => {
    fetchStudent()
  }, [name, user])

  const fetchStudent = async () => {
    if (!user) return

    const decodedName = decodeURIComponent(name)

    const { data: studentData } = await supabase
      .from('students')
      .select('*')
      .eq('name', decodedName)
      .eq('teacher_id', user.id)
      .single()

    if (!studentData) {
      navigate('/students')
      return
    }

    setStudent(studentData)

    const { data: subjectData } = await supabase
      .from('student_subjects')
      .select('id, subject_name')
      .eq('student_id', studentData.id)

    const { data: chapterData } = await supabase
      .from('student_chapters')
      .select('id, subject_name, chapter_name, status, completed_at')
      .eq('student_id', studentData.id)

    const subjectsWithChapters = (subjectData || []).map(sub => ({
      ...sub,
      student_chapters: (chapterData || []).filter(ch => ch.subject_name === sub.subject_name)
    }))

    setSubjects(subjectsWithChapters)
    setLoading(false)
  }

  const initializeChapters = async (subjectName) => {
    setInitializing(true)

    const { data: allChapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('*')
      .eq('subject_name', subjectName)
      .order('chapter_number')

    if (chaptersError) {
      console.error('Error fetching chapters:', chaptersError)
      setInitializing(false)
      return
    }

    if (!allChapters || allChapters.length === 0) {
      setInitializing(false)
      return
    }

    const { data: existingChapters } = await supabase
      .from('student_chapters')
      .select('chapter_name')
      .eq('student_id', student.id)
      .eq('subject_name', subjectName)

    const existingNames = existingChapters?.map(c => c.chapter_name) || []
    const newChapters = allChapters
      .filter(ch => !existingNames.includes(ch.chapter_name))
      .map(ch => ({
        student_id: student.id,
        subject_name: subjectName,
        chapter_name: ch.chapter_name,
        status: 'not_started',
      }))

    if (newChapters.length > 0) {
      const { error: insertError } = await supabase.from('student_chapters').insert(newChapters)
      if (insertError) {
        console.error('Error inserting student_chapters:', insertError)
      }
    }

    await fetchStudent()
    setInitializing(false)
  }

  const updateChapterStatus = async (chapterId, newStatus) => {
    const update = { status: newStatus }
    if (newStatus === 'completed') {
      update.completed_at = new Date().toISOString()
    } else {
      update.completed_at = null
    }

    await supabase
      .from('student_chapters')
      .update(update)
      .eq('id', chapterId)

    fetchStudent()
  }

  const getSubjectProgress = (chapters) => {
    if (!chapters || chapters.length === 0) return 0
    const completed = chapters.filter(c => c.status === 'completed').length
    return Math.round((completed / chapters.length) * 100)
  }

  const deleteStudent = async () => {
    if (!confirm(`Delete ${student.name}? This cannot be undone.`)) return

    await supabase.from('student_chapters').delete().eq('student_id', student.id)
    await supabase.from('student_subjects').delete().eq('student_id', student.id)
    await supabase.from('students').delete().eq('id', student.id)
    navigate('/students')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!student) return null

  const totalChapters = subjects.reduce((acc, s) => acc + (s.student_chapters?.length || 0), 0)
  const completedChapters = subjects.reduce(
    (acc, s) => acc + (s.student_chapters?.filter(c => c.status === 'completed').length || 0),
    0
  )
  const overallProgress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/students')}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Students
      </button>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
            <p className="text-gray-500 mt-1">
              Class {student.class} • Group {student.student_group}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${student.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {student.is_active ? 'Active' : 'Inactive'}
            </span>
            <button
              onClick={deleteStudent}
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              title="Delete student"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {student.school && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <School className="w-4 h-4 text-gray-400" />
              {student.school}
            </div>
          )}
          {student.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4 text-gray-400" />
              {student.phone}
            </div>
          )}
          {student.notes && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <StickyNote className="w-4 h-4 text-gray-400" />
              {student.notes}
            </div>
          )}
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-500">{overallProgress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className="bg-blue-500 h-2.5 rounded-full transition-all" style={{ width: `${overallProgress}%` }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{completedChapters} of {totalChapters} chapters completed</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-gray-400" />
          Assigned Subjects
        </h2>

        {subjects.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No subjects assigned to this student.</p>
          </div>
        ) : (
          subjects.map((sub) => {
            const isExpanded = expandedSubject === sub.id
            const progress = getSubjectProgress(sub.student_chapters)
            const hasChapters = sub.student_chapters && sub.student_chapters.length > 0

            return (
              <div key={sub.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => {
                    setExpandedSubject(isExpanded ? null : sub.id)
                    if (!hasChapters && !initializing) {
                      initializeChapters(sub.subject_name)
                    }
                  }}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{sub.subject_name}</h3>
                      <p className="text-sm text-gray-500">{sub.student_chapters?.length || 0} chapters • {progress}% complete</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 bg-gray-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-200">
                    {initializing ? (
                      <div className="p-5 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Loading chapters...</p>
                      </div>
                    ) : !hasChapters ? (
                      <div className="p-5 text-center text-sm text-gray-500">
                        No chapters available for this subject.
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {[...sub.student_chapters].sort((a, b) => {
                          if (a.status === 'completed' && b.status !== 'completed') return 1
                          if (a.status !== 'completed' && b.status === 'completed') return -1
                          const numA = parseInt(a.chapter_name.match(/\d+/)?.[0] || '0')
                          const numB = parseInt(b.chapter_name.match(/\d+/)?.[0] || '0')
                          return numA - numB
                        }).map((chapter) => (
                          <div key={chapter.id} className="px-5 py-3 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{chapter.chapter_name}</p>
                              {chapter.completed_at && (
                                <p className="text-xs text-gray-500">
                                  Completed: {new Date(chapter.completed_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <select
                              value={chapter.status}
                              onChange={(e) => updateChapterStatus(chapter.id, e.target.value)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                chapter.status === 'completed'
                                  ? 'bg-green-50 border-green-200 text-green-700'
                                  : 'bg-gray-50 border-gray-200 text-gray-600'
                              }`}
                            >
                              <option value="not_started">Not Started</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
