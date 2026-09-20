import { useEffect, useState } from 'react'
import { Users, UserCheck, BookOpen, TrendingUp, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    completedChapters: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [user])

  const fetchStats = async () => {
    if (!user) return

    const { data: students } = await supabase
      .from('students')
      .select('id, is_active')
      .eq('teacher_id', user.id)

    const totalStudents = students?.length || 0
    const activeStudents = students?.filter(s => s.is_active).length || 0

    const studentIds = students?.map(s => s.id) || []

    let completedChapters = 0
    if (studentIds.length > 0) {
      const { data: chapters } = await supabase
        .from('student_chapters')
        .select('id')
        .in('student_id', studentIds)
        .eq('status', 'completed')

      completedChapters = chapters?.length || 0
    }

    setStats({ totalStudents, activeStudents, completedChapters })

    if (studentIds.length > 0) {
      const { data: recent } = await supabase
        .from('student_chapters')
        .select('id, completed_at, students(name), chapters(subject_name, chapter_name)')
        .in('student_id', studentIds)
        .eq('status', 'completed')
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(4)

      setRecentActivity(recent || [])
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'bg-blue-500' },
    { label: 'Active Students', value: stats.activeStudents, icon: UserCheck, color: 'bg-green-500' },
    { label: 'Completed Chapters', value: stats.completedChapters, icon: BookOpen, color: 'bg-purple-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's your teaching overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Teaching Activity</h2>
          </div>
        </div>
        <div className="p-5">
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No completed chapters yet.</p>
              <p className="text-sm text-gray-400 mt-1">Start tracking student progress.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.students?.name} — {item.chapters?.chapter_name}
                      </p>
                      <p className="text-xs text-gray-500">{item.chapters?.subject_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">Completed</span>
                    <p className="text-xs text-gray-500 mt-1">{new Date(item.completed_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
