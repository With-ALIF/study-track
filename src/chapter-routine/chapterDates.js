const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const pad = (n) => String(n).padStart(2, '0')

const toISO = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

const parseISO = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(iso, n) {
  const date = parseISO(iso)
  date.setDate(date.getDate() + n)
  return toISO(date)
}

export function calcEndDate(startDate, duration) {
  return addDays(startDate, Number(duration) - 1)
}

export function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return `${pad(d)} ${MONTHS[m - 1]} ${y}`
}

export function dayName(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return DAY_NAMES[new Date(y, m - 1, d).getDay()]
}

export function listDates(start, end) {
  const cur = parseISO(start)
  const last = parseISO(end)
  const dates = []
  while (cur <= last) {
    dates.push(toISO(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return dates
}
