const inputClass =
  'mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent'

const FIELDS = [
  { key: 'maxPerDay', label: 'Paper Finals Per Day' },
  { key: 'sfPerDay', label: 'Subject Finals Per Day' },
  { key: 'fmtPerDay', label: 'Final Model Tests Per Day' },
  { key: 'pfGap', label: 'Between Paper Finals', unit: 'days' },
  { key: 'sfGap', label: 'Between Subject Finals', unit: 'days' },
  { key: 'fmtGap', label: 'Between Final Model Tests', unit: 'days' },
  { key: 'pfSfGap', label: 'Paper Final → Subject Final Gap', unit: 'days' },
  { key: 'sfFmtGap', label: 'Subject Final → Final Model Test Gap', unit: 'days' },
]

export default function GapSettings({ values, onChange }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FIELDS.map((field) => (
          <label key={field.key} className="block">
            <span className="text-sm font-medium text-gray-700">
              {field.label}
              {field.unit && (
                <span className="text-xs text-gray-400 font-normal ml-1">{field.unit}</span>
              )}
            </span>
            <input
              type="number"
              min={field.key.endsWith('PerDay') ? 1 : 0}
              value={values[field.key]}
              onChange={(e) => onChange(field.key, e.target.value)}
              className={inputClass}
            />
          </label>
        ))}
      </div>
      <p className="text-xs text-emerald-600 mt-3">
        Higher values leave more free days between exams. All values allow 0 or greater.
      </p>
    </div>
  )
}
