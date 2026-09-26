import { useState } from 'react'
import { FileDown } from 'lucide-react'
import { formatDate, dayName } from './chapterDates.js'
import { exportChapterPdf } from './pdfExport.js'

const cell = 'border border-slate-300 px-3 py-3.5 text-black align-middle'
const examCell = 'border border-slate-300 px-3 py-3.5 text-blue-600 font-semibold align-middle'

function renderChapter(text) {
  const m = text.match(/^(.*)( \(Part \d+\))$/)
  if (!m) return text
  return (
    <>
      {m[1]}
      <span style={{ color: 'rgb(255, 182, 6)' }}>{m[2]}</span>
    </>
  )
}

function groupRows(rows) {
  const grouped = []
  for (const row of rows) {
    const last = grouped[grouped.length - 1]
    if (last && last.date === row.date && last.subject === row.subject) {
      last.chapters.push(row.chapter)
    } else {
      grouped.push({ ...row, chapters: [row.chapter] })
    }
  }
  return grouped
}

export default function ChapterRoutineTable({ rows }) {
  const [busy, setBusy] = useState(false)

  const handleDownload = async () => {
    setBusy(true)
    try {
      await exportChapterPdf('chapter-routine-table', 'Chapter Routine.pdf')
    } finally {
      setBusy(false)
    }
  }

  if (!rows) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <p className="text-sm text-blue-600">
          No routine yet. Build a weekly pattern, provide Start Date, Subject Duration and Plan
          Duration, then generate the routine.
        </p>
      </div>
    )
  }

  const grouped = groupRows(rows)

  return (
    <>
      <div className="flex justify-end">
        <button
          onClick={handleDownload}
          disabled={busy}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FileDown className="w-4 h-4" />
          {busy ? 'Preparing PDF...' : 'Download PDF'}
        </button>
      </div>
      <div
        id="chapter-routine-table"
        className="overflow-x-auto rounded-lg border border-slate-300 bg-white"
      >
      <table className="w-full text-sm text-black bg-white border-collapse">
        <thead>
          <tr>
            {['Date', 'Day', 'Subject', 'Chapter'].map((h) => (
              <th key={h} className={`${cell} font-semibold text-left`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grouped.map((row, i) => {
            const show = i === 0 || grouped[i - 1].date !== row.date
            const cls = row.exam ? examCell : cell
            return (
              <tr key={`${row.date}-${row.subject}-${i}`}>
                <td className={cls}>{show ? formatDate(row.date) : ''}</td>
                <td className={cls}>{show ? dayName(row.date) : ''}</td>
                <td className={cls}>{row.subject}</td>
                <td className={cls}>
                  {row.chapters.map((c, j) => (
                    <span key={j}>
                      {j > 0 && ' + '}
                      {renderChapter(c)}
                    </span>
                  ))}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      </div>
    </>
  )
}
