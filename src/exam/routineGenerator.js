const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const pad = (n) => String(n).padStart(2, '0')

const parse = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const toISO = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export function formatDate(iso, long = false) {
  const [y, m, d] = iso.split('-').map(Number)
  const month = long ? MONTHS[m - 1] : SHORT_MONTHS[m - 1]
  return long ? `${pad(d)} ${month} ${y}` : `${pad(d)} ${month}`
}

export function listDates(start, end) {
  const dates = []
  const cur = parse(start)
  const last = parse(end)
  while (cur <= last) {
    dates.push(toISO(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return dates
}

export function addDays(iso, n) {
  const date = parse(iso)
  date.setDate(date.getDate() + n)
  return toISO(date)
}

export function todayISO() {
  return toISO(new Date())
}

export function diffDays(from, to) {
  return Math.round((parse(to) - parse(from)) / 86400000)
}

export function dayName(iso) {
  return DAY_NAMES[parse(iso).getDay()]
}

export function validateSetup({ examCount, modelCount, start, end }) {
  if (modelCount < 0) return 'Model Test count cannot be negative.'
  if (!start && !end) return 'Please provide at least a Start Date or End Date.'
  if (start && end && parse(end) < parse(start)) return 'Start Date must be before End Date.'
  if (examCount < 1) return 'Select at least one exam before generating.'
  return null
}

export function getStats(rows, availableDays) {
  const count = (type) => rows.filter((r) => r.type === type).length
  return {
    total: rows.length,
    paperFinal: count('Paper Final'),
    subjectFinal: count('Subject Final'),
    model: count('Final Model Test'),
    availableDays,
  }
}
