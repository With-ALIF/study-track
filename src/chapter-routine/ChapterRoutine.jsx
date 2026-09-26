import { useEffect, useState } from 'react'
import ChapterPattern from './ChapterPattern'
import ChapterSetup from './ChapterSetup'
import ChapterRoutineTable from './ChapterRoutineTable'
import { fetchChapters, fetchSubjects } from './chapterData'
import { generatePatternRoutine, validateSetup } from './chapterScheduler'

const emptyForm = {
  pattern: Array.from({ length: 4 }, () => []),
  startDate: '',
  subjectDuration: '',
  planDuration: '',
  exam: { enabled: false, label: 'Weekly Exam' },
}

export default function ChapterRoutine() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [rows, setRows] = useState(null)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchSubjects()
      .then(setSubjects)
      .catch(() => setError('Failed to load subjects.'))
      .finally(() => setLoading(false))
  }, [])

  const onChange = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setError('')
  }

  const onToggle = (dayIndex, name) => {
    setForm((f) => ({
      ...f,
      pattern: f.pattern.map((group, i) =>
        i === dayIndex
          ? group.includes(name)
            ? group.filter((s) => s !== name)
            : [...group, name]
          : group,
      ),
    }))
    setError('')
  }

  const onPatternLength = (n) => {
    setForm((f) => {
      if (n === f.pattern.length) return f
      if (n > f.pattern.length) {
        const added = Array.from({ length: n - f.pattern.length }, () => [])
        return { ...f, pattern: [...f.pattern, ...added] }
      }
      return { ...f, pattern: f.pattern.slice(0, n) }
    })
    setError('')
  }

  const onExamChange = (patch) => {
    setForm((f) => ({ ...f, exam: { ...f.exam, ...patch } }))
    setError('')
  }

  const handleGenerate = async () => {
    const setupError = validateSetup(form)
    if (setupError) {
      setError(setupError)
      setRows(null)
      return
    }

    setGenerating(true)
    setError('')
    setRows(null)

    try {
      const patternSubjects = [...new Set(form.pattern.flat())]
      const chapters = await fetchChapters(patternSubjects)
      const result = generatePatternRoutine(
        chapters,
        form.pattern,
        form.startDate,
        form.subjectDuration,
        form.planDuration,
        form.exam,
      )
      if (result.error) setError(result.error)
      else setRows(result.rows)
    } catch {
      setError('Failed to load chapters for the selected subjects.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-blue-600">Chapter Routine</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Set Days per Week and a Weekly Subject Pattern — it repeats every week across the
          whole duration.
        </p>
      </div>

      <ChapterPattern
        subjects={subjects}
        loading={loading}
        pattern={form.pattern}
        exam={form.exam}
        onToggle={onToggle}
        onPatternLength={onPatternLength}
        onExamChange={onExamChange}
      />

      <ChapterSetup
        form={form}
        onChange={onChange}
        onGenerate={handleGenerate}
        generating={generating}
        loading={loading}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <ChapterRoutineTable rows={rows} />
    </div>
  )
}
