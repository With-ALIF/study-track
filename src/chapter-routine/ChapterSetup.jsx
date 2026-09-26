import { calcEndDate, formatDate } from './chapterDates.js'

const inputClass =
  'mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent'

export default function ChapterSetup({ form, onChange, onGenerate, generating, loading }) {
  const plan = Number(form.planDuration)
  const showEnd = form.startDate && Number.isInteger(plan) && plan >= 1 && plan <= 365

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Start Date</span>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => onChange('startDate', e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Subject Duration (Days)</span>
          <input
            type="number"
            min="1"
            max="365"
            value={form.subjectDuration}
            onChange={(e) => onChange('subjectDuration', e.target.value)}
            placeholder="e.g. 18"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Plan Duration (Days)</span>
          <input
            type="number"
            min="1"
            max="365"
            value={form.planDuration}
            onChange={(e) => onChange('planDuration', e.target.value)}
            placeholder="e.g. 45"
            className={inputClass}
          />
        </label>
        <div className="flex items-end">
          <button
            onClick={onGenerate}
            disabled={generating || loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? 'Generating...' : 'Generate Routine'}
          </button>
        </div>
      </div>

      <p className="text-xs text-blue-600">
        Subject Duration spreads each subject's chapters over its study days (long chapters split
        into Part 1, Part 2...) — Plan Duration sets the total routine length.{' '}
        {showEnd && (
          <span className="font-medium">
            End Date: {formatDate(calcEndDate(form.startDate, plan))}
          </span>
        )}
      </p>
    </div>
  )
}
