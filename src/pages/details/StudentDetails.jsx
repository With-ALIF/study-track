import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import useStudentData from './useStudentData'
import StudentInfoCard from './StudentInfoCard'
import SubjectList from './SubjectList'

export default function StudentDetails() {
  const navigate = useNavigate()
  const [toast, setToast] = useState({ show: false, message: '' })

  const showToast = (message) => {
    setToast({ show: true, message })
    setTimeout(() => setToast({ show: false, message: '' }), 2000)
  }

  const {
    student, subjects, loading,
    expandedSubject, setExpandedSubject,
    initializing,
    showAddSubject, setShowAddSubject,
    allSubjects,
    confirmModal, setConfirmModal,
    chapterConfirm, setChapterConfirm,
    fetchAllSubjects, addSubject, removeSubject,
    initializeChapters, updateChapterStatus,
    getSubjectProgress, deleteStudent, handleChapterConfirm,
  } = useStudentData()

  const handleToggle = async (chapterId, newStatus) => {
    await updateChapterStatus(chapterId, newStatus)
    if (newStatus === 'completed') {
      showToast('Chapter completed!')
    }
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
    (acc, s) => acc + (s.student_chapters?.filter(c => c.status === 'completed').length || 0), 0
  )
  const overallProgress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 px-0 sm:px-0">
      <button
        onClick={() => navigate('/students')}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium ml-1"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <StudentInfoCard
        student={student}
        overallProgress={overallProgress}
        completedChapters={completedChapters}
        totalChapters={totalChapters}
        onDelete={deleteStudent}
      />

      <SubjectList
        subjects={subjects}
        expandedSubject={expandedSubject}
        setExpandedSubject={setExpandedSubject}
        initializing={initializing}
        showAddSubject={showAddSubject}
        setShowAddSubject={setShowAddSubject}
        allSubjects={allSubjects}
        addSubject={addSubject}
        removeSubject={removeSubject}
        initializeChapters={initializeChapters}
        updateChapterStatus={handleToggle}
        getSubjectProgress={getSubjectProgress}
        handleChapterConfirm={handleChapterConfirm}
        fetchAllSubjects={fetchAllSubjects}
      />

      {chapterConfirm.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Unmark Chapter?</h3>
            <p className="text-sm text-gray-500 mb-5">
              Mark <span className="font-semibold text-indigo-600">{chapterConfirm.chapterName}</span> as not completed?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setChapterConfirm({ show: false, chapterId: null, chapterName: '' })}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateChapterStatus(chapterConfirm.chapterId, 'not_started')
                  setChapterConfirm({ show: false, chapterId: null, chapterName: '' })
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600"
              >
                Unmark
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{confirmModal.title}</h3>
            <p className="text-sm text-gray-500 mb-5">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ show: false, title: '', message: '', onConfirm: null })}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {toast.show && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium">
            <Check className="w-4 h-4" />
            {toast.message}
          </div>
        </div>
      )}
    </div>
  )
}
