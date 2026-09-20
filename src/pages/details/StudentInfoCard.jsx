import { Phone, School, StickyNote, Trash2 } from 'lucide-react'

export default function StudentInfoCard({ student, overallProgress, completedChapters, totalChapters, onDelete }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mx-1 sm:mx-0">
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{student.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Class {student.class} • {student.student_group}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${student.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {student.is_active ? 'Active' : 'Inactive'}
          </span>
          <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {(student.school || student.phone || student.notes) && (
        <div className="flex flex-wrap gap-3 mb-3">
          {student.school && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <School className="w-3.5 h-3.5" /> {student.school}
            </span>
          )}
          {student.phone && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Phone className="w-3.5 h-3.5" /> {student.phone}
            </span>
          )}
          {student.notes && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <StickyNote className="w-3.5 h-3.5" /> {student.notes}
            </span>
          )}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-500">Overall Progress</span>
          <span className="text-xs font-bold text-gray-700">{overallProgress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-1">{completedChapters}/{totalChapters} chapters</p>
      </div>
    </div>
  )
}
