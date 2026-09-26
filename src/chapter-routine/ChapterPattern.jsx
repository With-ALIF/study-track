import { useRef } from 'react'

const inputClass =
  'px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent'

const chipClass = (active) =>
  `flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-colors ${
    active
      ? 'border-blue-600 bg-blue-50 text-blue-700'
      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
  }`

export default function ChapterPattern({
  subjects,
  loading,
  pattern,
  exam,
  onToggle,
  onPatternLength,
  onExamChange,
}) {
  const lenRef = useRef(null)

  const commitLength = () => {
    const input = lenRef.current
    if (!input) return
    const n = Number(input.value)
    if (Number.isInteger(n) && n >= 1 && n <= 31) onPatternLength(n)
    else input.value = String(pattern.length)
  }

  const n = pattern.length
  const cycle = n + (exam.enabled ? 1 : 0)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Weekly Subject Pattern</h3>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <label className="flex items-center gap-2">
            Days per Week
            <input
              ref={lenRef}
              type="number"
              min="1"
              max="31"
              defaultValue={n}
              onBlur={commitLength}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitLength()
              }}
              className={`${inputClass} w-20`}
            />
            days
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={exam.enabled}
              onChange={(e) => onExamChange({ enabled: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Weekly Exam (Day {n + 1})
          </label>
          {exam.enabled && (
            <input
              type="text"
              value={exam.label}
              onChange={(e) => onExamChange({ label: e.target.value })}
              placeholder="Weekly Exam"
              className={`${inputClass} w-36`}
            />
          )}
        </div>
      </div>

      <div className="space-y-3">
        {pattern.map((group, i) => (
          <div key={i} className="rounded-lg border border-gray-200 p-3">
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Day {i + 1}</div>
            <div className="flex flex-wrap gap-2">
              {loading && <span className="text-sm text-gray-400">Loading subjects...</span>}
              {!loading && subjects.length === 0 && (
                <span className="text-sm text-gray-400">No subjects found.</span>
              )}
              {subjects.map((name) => (
                <label key={name} className={chipClass(group.includes(name))}>
                  <input
                    type="checkbox"
                    checked={group.includes(name)}
                    onChange={() => onToggle(i, name)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {name}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-blue-600 mt-3">
        {exam.enabled
          ? `${n} study days + 1 exam day each cycle — repeats every ${cycle} days (Day ${cycle} = ${exam.label?.trim() || 'Weekly Exam'}).`
          : n === 1
            ? 'The same subject group repeats every day.'
            : `Weekly Pattern repeats every ${n} days — every ${n} days a new week starts from Day 1.`}
      </p>
    </div>
  )
}
