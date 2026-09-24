import { formatDate, dayName } from './routineGenerator.js'
import { PHASE_PDF } from './colors.js'

const esc = (s) =>
  String(s).replace(/[^\x20-\x7E]/g, '?').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')

const HEAD = ['Date', 'Day', 'Exam'], TEXT_X = [59, 134, 219]
const TOP_OFF = 22, BOT_OFF = 14, ROW_H = 36
const GRID = '0.796 0.835 0.882 RG 0.5 w'
const INDIGO = PHASE_PDF['Paper Final'].text

function toStream(items) {
  let out = ''
  for (const item of items) {
    if (typeof item === 'string') out += `${item}\n`
    else {
      const [x, y, size, str, bold, rgb = '0 0 0'] = item
      out += `${rgb} rg BT /${bold ? 'F2' : 'F1'} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${esc(str)}) Tj ET\n`
    }
  }
  return out
}

function headItems(routine) {
  const s = routine.stats
  return [
    [50, 805, 16, routine.title || 'Exam Routine', true, INDIGO],
    [50, 782, 10, `Start Date: ${formatDate(routine.startDate, true)}`, false],
    [50, 766, 10, `End Date: ${formatDate(routine.endDate, true)}`, false],
    [50, 750, 10, 'Total Exams:', true, INDIGO], [130, 750, 10, String(s.total), false],
    [165, 750, 10, 'Paper Finals:', true, PHASE_PDF['Paper Final'].text], [245, 750, 10, String(s.paperFinal), false],
    [275, 750, 10, 'Subject Finals:', true, PHASE_PDF['Subject Final'].text], [365, 750, 10, String(s.subjectFinal), false],
    [395, 750, 10, 'Model Tests:', true, PHASE_PDF['Final Model Test'].text], [470, 750, 10, String(s.model), false],
    '0.6 w 50 738 m 545 738 l S',
  ]
}

const grid = (top, bot) =>
  `${GRID} 50 ${top} m 545 ${top} l S 50 ${bot} m 545 ${bot} l S ` +
  [50, 125, 210, 545].map((x) => `${x} ${top} m ${x} ${bot} l S`).join(' ')

function tableHead(y) {
  return [grid(y - TOP_OFF, y + BOT_OFF), HEAD.map((h, i) => [TEXT_X[i], y, 10, h, true])].flat()
}

function rowItems(row, y, show) {
  return [
    [TEXT_X[0], y, 10, show ? formatDate(row.date) : '', false],
    [TEXT_X[1], y, 10, show ? dayName(row.date) : '', false],
    [TEXT_X[2], y, 10, row.title, false],
  ]
}

function makePages(routine) {
  const pages = []
  let items = headItems(routine).concat(tableHead(716))
  let y = 680
  let prev = ''
  for (const row of routine.rows) {
    if (y - TOP_OFF < 50) {
      pages.push(items)
      items = tableHead(800)
      y = 764
      prev = ''
    }
    items.push(grid(y - TOP_OFF, y + BOT_OFF))
    items = items.concat(rowItems(row, y, row.date !== prev))
    prev = row.date
    y -= ROW_H
  }
  pages.push(items)
  return pages.map(toStream)
}

export function buildPdf(routine) {
  const streams = makePages(routine)
  const kids = streams.map((_, i) => `${5 + i * 2} 0 R`).join(' ')
  const objs = []
  objs[1] = '<< /Type /Catalog /Pages 2 0 R >>'
  objs[2] = `<< /Type /Pages /Kids [${kids}] /Count ${streams.length} >>`
  objs[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  objs[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'
  streams.forEach((stream, i) => {
    objs[5 + i * 2] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + i * 2} 0 R >>`
    objs[6 + i * 2] = `<< /Length ${stream.length} >>\nstream\n${stream}endstream`
  })
  let pdf = '%PDF-1.4\n'
  const offsets = []
  for (let i = 1; i < objs.length; i++) {
    offsets[i] = pdf.length
    pdf += `${i} 0 obj\n${objs[i]}\nendobj\n`
  }
  const xref = pdf.length
  pdf += `xref\n0 ${objs.length}\n0000000000 65535 f \n`
  for (let i = 1; i < objs.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objs.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  return new Blob([pdf], { type: 'application/pdf' })
}
