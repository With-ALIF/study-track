import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react'
import ChapterRow from './ChapterRow'

const SUBJECT_LOGOS = {
  Physics: 'https://github.com/With-ALIF/logo_zone/blob/main/book/Physics.png?raw=true',
  Chemistry: 'https://github.com/With-ALIF/logo_zone/blob/main/book/Chemistry.png?raw=true',
  Biology: 'https://github.com/With-ALIF/logo_zone/blob/main/book/Biology.png?raw=true',
  'Higher Math': 'https://github.com/With-ALIF/logo_zone/blob/main/book/Math.png?raw=true',
  ICT: 'https://github.com/With-ALIF/logo_zone/blob/main/book/ICT.png?raw=true',
}

function renderChapterList(chapters, updateChapterStatus, handleChapterConfirm) {
  const sorted = [...chapters].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1
    if (a.status !== 'completed' && b.status === 'completed') return -1
    return (a.chapter_number || 0) - (b.chapter_number || 0)
  })
  return (
    <div>
      {sorted.map(ch => (
        <ChapterRow key={ch.id} chapter={ch} onToggle={updateChapterStatus} onConfirm={handleChapterConfirm} />
      ))}
    </div>
  )
}

function renderPaperChapters(chapters, updateChapterStatus, handleChapterConfirm) {
  return ['1st Paper', '2nd Paper'].map(paper => {
    const paperChapters = chapters
      .filter(ch => ch.paper === paper)
      .sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1
        if (a.status !== 'completed' && b.status === 'completed') return -1
        return (a.chapter_number || 0) - (b.chapter_number || 0)
      })
    if (paperChapters.length === 0) return null
    const completedCount = paperChapters.filter(ch => ch.status === 'completed').length
    const paperProgress = Math.round((completedCount / paperChapters.length) * 100)

    return (
      <div key={paper} className="border-b border-gray-100 last:border-b-0">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
          <div>
            <p className="text-sm font-semibold text-gray-700">{paper}</p>
            <p className="text-xs text-gray-400">{completedCount}/{paperChapters.length} done</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${paperProgress}%` }} />
            </div>
            <span className="text-xs font-bold text-gray-600 w-8 text-right">{paperProgress}%</span>
          </div>
        </div>
        {renderChapterList(paperChapters, updateChapterStatus, handleChapterConfirm)}
      </div>
    )
  })
}

export default function SubjectList({
  subjects, expandedSubject, setExpandedSubject,
  initializing, showAddSubject, setShowAddSubject,
  allSubjects, addSubject, removeSubject, initializeChapters,
  updateChapterStatus, getSubjectProgress, handleChapterConfirm, fetchAllSubjects,
}) {
  return (
    <div className="space-y-3 sm:space-y-4 px-1 sm:px-0">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Subjects</h2>
        <button
          onClick={() => { setShowAddSubject(!showAddSubject); if (!showAddSubject) fetchAllSubjects() }}
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {showAddSubject && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-2">Select a subject:</p>
          <div className="flex flex-wrap gap-2">
            {allSubjects
              .filter(s => !subjects.some(sub => sub.subject_name === s))
              .map(subject => (
                <button
                  key={subject}
                  onClick={() => addSubject(subject)}
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium"
                >
                  + {subject}
                </button>
              ))}
            {allSubjects.filter(s => !subjects.some(sub => sub.subject_name === s)).length === 0 && (
              <p className="text-xs text-gray-400">All subjects assigned.</p>
            )}
          </div>
        </div>
      )}

      {subjects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <span className="text-4xl">📚</span>
          <p className="text-sm text-gray-400 mt-2">No subjects assigned yet.</p>
        </div>
      ) : (
        subjects.map((sub) => {
          const isExpanded = expandedSubject === sub.id
          const progress = getSubjectProgress(sub.student_chapters)
          const hasChapters = sub.student_chapters && sub.student_chapters.length > 0

          return (
            <div key={sub.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  setExpandedSubject(isExpanded ? null : sub.id)
                  if (!hasChapters && !initializing) initializeChapters(sub.subject_name)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setExpandedSubject(isExpanded ? null : sub.id)
                    if (!hasChapters && !initializing) initializeChapters(sub.subject_name)
                  }
                }}
                className="w-full flex items-center justify-between p-4 text-left active:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-50">
                    {SUBJECT_LOGOS[sub.subject_name] ? (
                      <img src={SUBJECT_LOGOS[sub.subject_name]} alt={sub.subject_name} className="w-9 h-9 object-contain" />
                    ) : (
                      <span className="text-lg">📚</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900">{sub.subject_name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="w-16 bg-gray-100 rounded-full h-1">
                        <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs text-gray-400">{progress}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); removeSubject(sub.subject_name) }}
                    className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100">
                  {initializing ? (
                    <div className="p-6 text-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent mx-auto"></div>
                      <p className="text-xs text-gray-400 mt-2">Loading...</p>
                    </div>
                  ) : !hasChapters ? (
                    <div className="p-6 text-center text-xs text-gray-400">No chapters available.</div>
                  ) : sub.student_chapters.some(ch => ch.paper) ? (
                    renderPaperChapters(sub.student_chapters, updateChapterStatus, handleChapterConfirm)
                  ) : (
                    renderChapterList(sub.student_chapters, updateChapterStatus, handleChapterConfirm)
                  )}
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
