import { buildExams } from './examData.js'
import { getStats, listDates, validateSetup } from './routineGenerator.js'
import { INSUFFICIENT_DAYS, scheduleRoutine } from './gapScheduler.js'

export function generate(form, gaps) {
  const parsed = Number.parseInt(form.modelCount, 10)
  const modelCount = Number.isNaN(parsed) ? 0 : parsed
  const exams = buildExams({
    paperSelected: form.paperSelected,
    subjectSelected: form.subjectSelected,
    modelCount: Math.max(modelCount, 0),
  })
  if (!form.startDate && !form.endDate && exams.length === 0) {
    return { error: '', routine: null }
  }
  const error = validateSetup({
    examCount: exams.length,
    modelCount,
    start: form.startDate,
    end: form.endDate,
  })
  if (error) return { error, routine: null }
  const scheduled = scheduleRoutine(exams, form.startDate, form.endDate, gaps)
  if (!scheduled) return { error: INSUFFICIENT_DAYS, routine: null }
  return {
    error: '',
    routine: {
      title: (form.title || '').trim() || 'Exam Routine',
      rows: scheduled.rows,
      startDate: scheduled.startDate,
      endDate: scheduled.endDate,
      stats: getStats(scheduled.rows, listDates(scheduled.startDate, scheduled.endDate).length),
    },
  }
}
