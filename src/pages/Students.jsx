import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Users, BookOpen } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Students() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchStudents()
  }, [user])

  const fetchStudents = async () => {
    if (!user) return

    const { data } = await supabase
      .from('students')
      .select(`
        *,
        student_subjects(subject_name)
      `)
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false })

    setStudents(data || [])
    setLoading(false)
  }

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  const getProgress = (student) => {
    if (!student.student_subjects || student.student_subjects.length === 0) return 0
    return 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 mt-1">{students.length} total students</p>
        </div>
        <Link
          to="/students/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Student
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">
            {search ? 'No students match your search.' : 'No students yet.'}
          </p>
          {!search && (
            <Link
              to="/students/new"
              className="inline-flex items-center gap-2 mt-3 text-blue-600 text-sm font-medium hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add your first student
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((student) => (
            <Link
              key={student.id}
              to={`/students/${encodeURIComponent(student.name)}`}
              className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{student.name}</h3>
                  <p className="text-sm text-gray-500">
                    Class {student.class} • Group {student.student_group}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${student.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {student.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {student.school && (
                <p className="text-sm text-gray-500 mb-3">{student.school}</p>
              )}

              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <div className="flex flex-wrap gap-1">
                  {student.student_subjects?.length > 0 ? (
                    student.student_subjects.map((ss, i) => (
                      <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                        {ss.subject_name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">No subjects assigned</span>
                  )}
                </div>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${getProgress(student)}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{getProgress(student)}% complete</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
