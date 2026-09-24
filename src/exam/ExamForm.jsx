import { useEffect, useRef } from 'react'

export function ExamSection({ title, children }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
      {children}
    </div>
  )
}

export function CheckItem({ label, checked, indeterminate = false, onChange }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate])
  return (
    <label className="flex items-center gap-2 py-1 cursor-pointer select-none">
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="rounded border-gray-300 accent-slate-600 focus:ring-slate-400"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}

export default function ExamForm({ title, options, selected, onToggle }) {
  return (
    <ExamSection title={title}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4">
        {options.map((option) => (
          <CheckItem
            key={option}
            label={option}
            checked={!!selected[option]}
            onChange={() => onToggle(option)}
          />
        ))}
      </div>
    </ExamSection>
  )
}
