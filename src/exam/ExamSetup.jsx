const inputClass =
  'mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent'

export default function ExamSetup({ title, modelCount, startDate, endDate, onChange }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Routine Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="e.g. Class 8 Final Exam Routine"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Final Model Test Count</span>
          <input
            type="number"
            min="0"
            value={modelCount}
            onChange={(e) => onChange('modelCount', e.target.value)}
            placeholder="e.g. 5"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Start Date</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onChange('startDate', e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">End Date</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onChange('endDate', e.target.value)}
            className={inputClass}
          />
        </label>
      </div>
      <p className="text-xs text-gray-400 mt-3">
        Provide Start Date, End Date, or both — the missing date is calculated automatically.
      </p>
    </div>
  )
}
