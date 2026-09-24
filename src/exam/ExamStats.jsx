export default function ExamStats({ stats }) {
  if (!stats) return null

  const items = [
    ['Total Exams', stats.total, 'bg-slate-900 border-slate-900', 'text-slate-300'],
    ['Paper Finals', stats.paperFinal, 'bg-[#6366F1] border-[#6366F1]', 'text-indigo-100'],
    ['Subject Finals', stats.subjectFinal, 'bg-[#10B981] border-[#10B981]', 'text-emerald-100'],
    ['Model Tests', stats.model, 'bg-[#F59E0B] border-[#F59E0B]', 'text-amber-100'],
    ['Total Duration', `${stats.availableDays} days`, 'bg-slate-700 border-slate-700', 'text-slate-300'],
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map(([label, value, card, labelCls]) => (
        <div key={label} className={`rounded-xl border p-4 text-center ${card}`}>
          <p className={`text-xs font-medium ${labelCls}`}>{label}</p>
          <p className="text-2xl font-bold mt-1 text-white">{value}</p>
        </div>
      ))}
    </div>
  )
}
