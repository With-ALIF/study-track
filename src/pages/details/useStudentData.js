import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

export default function useStudentData() {
  const { name } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedSubject, setExpandedSubject] = useState(null)
  const [initializing, setInitializing] = useState(false)
  const [showAddSubject, setShowAddSubject] = useState(false)
  const [allSubjects, setAllSubjects] = useState([])
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null })
  const [chapterConfirm, setChapterConfirm] = useState({ show: false, chapterId: null, chapterName: '' })

  useEffect(() => {
    fetchStudent()
    fetchAllSubjects()
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
      .select('id, chapter_id, status, completed_at, chapters(id, subject_name, chapter_number, chapter_name, paper)')
      .eq('student_id', studentData.id)

    const subjectsWithChapters = (subjectData || []).map(sub => ({
      ...sub,
      student_chapters: (chapterData || [])
        .filter(ch => ch.chapters?.subject_name === sub.subject_name)
        .map(ch => ({
          id: ch.id,
          chapter_id: ch.chapter_id,
          status: ch.status,
          completed_at: ch.completed_at,
          subject_name: ch.chapters.subject_name,
          chapter_number: ch.chapters.chapter_number,
          chapter_name: ch.chapters.chapter_name,
          paper: ch.chapters.paper,
        }))
    }))

    setSubjects(subjectsWithChapters)
    setLoading(false)
  }

  const fetchAllSubjects = async () => {
    const { data } = await supabase.from('subjects').select('name')
    setAllSubjects(data?.map(s => s.name) || [])
  }

  const addSubject = async (subjectName) => {
    await supabase.from('student_subjects').insert({
      student_id: student.id,
      subject_name: subjectName,
    })
    setShowAddSubject(false)
    fetchStudent()
  }

  const removeSubject = async (subjectName) => {
    setConfirmModal({
      show: true,
      title: 'Remove Subject',
      message: `Remove ${subjectName}? All chapter tracking for this subject will be deleted.`,
      onConfirm: async () => {
        const { data: subjectChapters } = await supabase
          .from('chapters')
          .select('id')
          .eq('subject_name', subjectName)

        const chapterIds = subjectChapters?.map(c => c.id) || []
        if (chapterIds.length > 0) {
          await supabase.from('student_chapters').delete()
            .eq('student_id', student.id)
            .in('chapter_id', chapterIds)
        }
        await supabase.from('student_subjects').delete()
          .eq('student_id', student.id)
          .eq('subject_name', subjectName)
        setConfirmModal({ show: false, title: '', message: '', onConfirm: null })
        fetchStudent()
      }
    })
  }

  const initializeChapters = async (subjectName) => {
    setInitializing(true)

    const { data: allChapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('id')
      .eq('subject_name', subjectName)
      .order('chapter_number')

    if (chaptersError || !allChapters || allChapters.length === 0) {
      setInitializing(false)
      return
    }

    const { data: existingChapters } = await supabase
      .from('student_chapters')
      .select('chapter_id')
      .eq('student_id', student.id)
      .in('chapter_id', allChapters.map(c => c.id))

    const existingIds = existingChapters?.map(c => c.chapter_id) || []
    const newChapters = allChapters
      .filter(ch => !existingIds.includes(ch.id))
      .map(ch => ({
        student_id: student.id,
        chapter_id: ch.id,
        status: 'not_started',
      }))

    if (newChapters.length > 0) {
      const { error: insertError } = await supabase.from('student_chapters').insert(newChapters)
      if (insertError) console.error('Error inserting student_chapters:', insertError)
    }

    await fetchStudent()
    setInitializing(false)
  }

  const updateChapterStatus = async (chapterId, newStatus) => {
    const update = { status: newStatus }
    update.completed_at = newStatus === 'completed' ? new Date().toISOString() : null

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
    setConfirmModal({
      show: true,
      title: 'Delete Student',
      message: `Delete ${student.name}? This cannot be undone.`,
      onConfirm: async () => {
        await supabase.from('student_chapters').delete().eq('student_id', student.id)
        await supabase.from('student_subjects').delete().eq('student_id', student.id)
        await supabase.from('students').delete().eq('id', student.id)
        setConfirmModal({ show: false, title: '', message: '', onConfirm: null })
        navigate('/students')
      }
    })
  }

  const handleChapterConfirm = (chapterId, chapterName) => {
    setChapterConfirm({ show: true, chapterId, chapterName })
  }

  return {
    student, subjects, loading,
    expandedSubject, setExpandedSubject,
    initializing,
    showAddSubject, setShowAddSubject,
    allSubjects,
    confirmModal, setConfirmModal,
    chapterConfirm, setChapterConfirm,
    fetchStudent, fetchAllSubjects,
    addSubject, removeSubject,
    initializeChapters, updateChapterStatus,
    getSubjectProgress, deleteStudent,
    handleChapterConfirm,
  }
}
