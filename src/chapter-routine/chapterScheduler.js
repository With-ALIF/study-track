import { calcEndDate, dayName, listDates } from './chapterDates.js'

export function validateSetup({ pattern, startDate, subjectDuration, planDuration }) {
  if (!pattern.length) return 'Add at least one day to the pattern.'
  for (let i = 0; i < pattern.length; i++) {
    if (!pattern[i].length) return `Day ${i + 1} has no subjects.`
  }
  if (!startDate) return 'Provide a Start Date.'
  const sub = Number(subjectDuration)
  if (!Number.isInteger(sub) || sub < 1) return 'Subject Duration must be at least 1 day.'
  const plan = Number(planDuration)
  if (!Number.isInteger(plan) || plan < 1) return 'Plan Duration must be at least 1 day.'
  return ''
}

const labelChapter = (ch) => ch.chapter_name

function assignFlow(assign, day, subject, labels) {
  if (!assign.has(day)) assign.set(day, new Map())
  const dayMap = assign.get(day)
  if (!dayMap.has(subject)) dayMap.set(subject, [])
  dayMap.get(subject).push(...labels)
}

function scatterFlow(assigned, count) {
  if (count >= assigned.length) return assigned
  if (count <= 1) return assigned.slice(0, 1)
  const picked = []
  for (let i = 0; i < count; i++) {
    picked.push(assigned[Math.round((i * (assigned.length - 1)) / (count - 1))])
  }
  return picked
}

function planSubject(assign, subject, queue, flow) {
  const n = queue.length

  if (n >= flow.length) {
    const base = Math.floor(n / flow.length)
    const remainder = n % flow.length
    let idx = 0
    flow.forEach((day, i) => {
      const count = i < remainder ? base + 1 : base
      const labels = queue.slice(idx, idx + count).map(labelChapter)
      idx += count
      assignFlow(assign, day, subject, labels)
    })
    return
  }

  const span = Math.floor(flow.length / n)
  const extra = flow.length % n
  let d = 0
  for (let c = 0; c < n; c++) {
    const days = c < extra ? span + 1 : span
    const label = labelChapter(queue[c])
    for (let k = 1; k <= days; k++) {
      assignFlow(assign, flow[d], subject, [days > 1 ? `${label} (Part ${k})` : label])
      d++
    }
  }
}

export function generatePatternRoutine(
  chapters,
  pattern,
  startDate,
  subjectDuration,
  planDuration,
  exam,
) {
  const queues = new Map()
  for (const ch of chapters) {
    if (!queues.has(ch.subject_name)) queues.set(ch.subject_name, [])
    queues.get(ch.subject_name).push(ch)
  }

  const allSubjects = [...new Set(pattern.flat())]
  const missing = allSubjects.filter((s) => !queues.has(s))
  if (missing.length) return { error: `No chapters found for: ${missing.join(', ')}` }

  const totalDays = Number(planDuration)
  const cycleLen = pattern.length + (exam?.enabled ? 1 : 0)
  const examLabel = ((exam?.label || '').trim()) || 'Weekly Exam'
  const dates = listDates(startDate, calcEndDate(startDate, totalDays))
  const assign = new Map()

  for (const subject of allSubjects) {
    const assigned = []
    for (let d = 0; d < totalDays; d++) {
      const pos = d % cycleLen
      if (pos < pattern.length && pattern[pos].includes(subject)) assigned.push(d)
    }
    const flow = scatterFlow(assigned, Number(subjectDuration))
    if (flow.length) planSubject(assign, subject, queues.get(subject), flow)
  }

  const rows = []
  let examCount = 0
  for (let d = 0; d < totalDays; d++) {
    const pos = d % cycleLen
    const date = dates[d]
    if (exam?.enabled && pos === pattern.length) {
      examCount++
      const name = `${examLabel}-${String(examCount).padStart(2, '0')}`
      rows.push({ date, day: dayName(date), subject: name, chapter: name, exam: true })
      continue
    }
    const dayMap = assign.get(d)
    if (!dayMap) continue
    for (const subject of pattern[pos]) {
      for (const chapter of dayMap.get(subject) || []) {
        rows.push({ date, day: dayName(date), subject, chapter })
      }
    }
  }

  if (!rows.length) return { error: 'No chapters found for the selected subjects.' }
  return { rows }
}
