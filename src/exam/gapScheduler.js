import { listDates, addDays } from './routineGenerator.js'

export const DEFAULT_GAPS = {
  maxPerDay: 1,
  sfPerDay: 1,
  fmtPerDay: 1,
  pfGap: 0,
  sfGap: 0,
  pfSfGap: 2,
  sfFmtGap: 3,
  fmtGap: 1,
}

export const INSUFFICIENT_DAYS =
  'Not enough available days.\nPlease reduce the gap or increase the date range.'

const toNonNegative = (value) => {
  const n = Number.parseInt(value, 10)
  return Number.isNaN(n) || n < 0 ? 0 : n
}

export function normalizeGaps(gaps) {
  return {
    maxPerDay: Math.max(1, toNonNegative(gaps.maxPerDay)),
    sfPerDay: Math.max(1, toNonNegative(gaps.sfPerDay)),
    fmtPerDay: Math.max(1, toNonNegative(gaps.fmtPerDay)),
    pfGap: toNonNegative(gaps.pfGap),
    sfGap: toNonNegative(gaps.sfGap),
    pfSfGap: toNonNegative(gaps.pfSfGap),
    sfFmtGap: toNonNegative(gaps.sfFmtGap),
    fmtGap: toNonNegative(gaps.fmtGap),
  }
}

function transitionGap(prevType, nextType, gaps) {
  if (prevType === 'Paper Final' && nextType === 'Subject Final') return gaps.pfSfGap
  if (prevType === 'Subject Final' && nextType === 'Final Model Test') return gaps.sfFmtGap
  return 0
}

const CAP_KEY = {
  'Paper Final': 'maxPerDay',
  'Subject Final': 'sfPerDay',
  'Final Model Test': 'fmtPerDay',
}

function placePhase(exams, startDay, maxPerDay, gapBetween) {
  const placed = []
  let day = startDay
  let used = 0
  for (const exam of exams) {
    placed.push({ exam, dateIndex: day })
    used += 1
    if (used >= maxPerDay) {
      day += gapBetween + 1
      used = 0
    }
  }
  return { placed, lastDay: placed[placed.length - 1].dateIndex }
}

function planPhases(exams, gaps) {
  const planned = []
  let lastDay = 0
  let prevType = null
  for (const type of ['Paper Final', 'Subject Final', 'Final Model Test']) {
    const list = exams.filter((e) => e.type === type)
    if (list.length === 0) continue
    const startDay = prevType === null ? 0 : lastDay + transitionGap(prevType, type, gaps) + 1
    const withinGap =
      type === 'Final Model Test'
        ? gaps.fmtGap
        : type === 'Paper Final'
          ? gaps.pfGap
          : gaps.sfGap
    const capacity = gaps[CAP_KEY[type]]
    const result = placePhase(list, startDay, capacity, withinGap)
    planned.push(...result.placed)
    lastDay = result.lastDay
    prevType = type
  }
  return { planned, lastDay }
}

export function scheduleRoutine(exams, startDate, endDate, gapsInput) {
  const gaps = normalizeGaps(gapsInput)
  const { planned, lastDay } = planPhases(exams, gaps)
  if (planned.length === 0 || (!startDate && !endDate)) return null
  const start = startDate || addDays(endDate, -lastDay)
  const end = endDate || addDays(startDate, lastDay)
  const days = listDates(start, end)
  if (lastDay >= days.length) return null
  return {
    rows: planned.map(({ exam, dateIndex }) => ({ ...exam, date: days[dateIndex] })),
    startDate: start,
    endDate: end,
  }
}
