import { formatDate, dayName } from './routineGenerator.js'

const cell = 'border border-slate-300 px-3 py-3.5 text-black align-middle'

export default function ScheduleList({ routine }) {
  if (!routine) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <p className="text-sm text-slate-500">
          No routine yet. Select exams and provide a Start Date or End Date — the schedule updates
          automatically.
        </p>
      </div>
    )
  }

  const rows = routine.rows
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white">
      <table className="w-full text-sm text-black bg-white border-collapse">
        <thead>
          <tr>
            {['Date', 'Day', 'Exam'].map((h) => (
              <th key={h} className={`${cell} font-semibold text-left`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const show = i === 0 || rows[i - 1].date !== row.date
            return (
              <tr key={`${row.date}-${i}`}>
                <td className={cell}>{show ? formatDate(row.date) : ''}</td>
                <td className={cell}>{show ? dayName(row.date) : ''}</td>
                <td className={cell}>{row.title}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
