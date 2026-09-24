import { FileDown } from 'lucide-react'
import PageSection from './PageSection.jsx'
import { exportMarkdown, exportTxt, exportPdf, exportDocx } from './exportUtils.js'

const EXPORTS = [
  ['Download PDF', exportPdf, true],
  ['Export DOCX', exportDocx, false],
  ['Export Markdown', exportMarkdown, false],
  ['Export TXT', exportTxt, false],
]

export default function ExportBar({ routine }) {
  return (
    <PageSection title="Export">
      <div className="flex flex-wrap gap-2">
        {EXPORTS.map(([label, fn, primary]) => (
          <button
            key={label}
            onClick={() => fn(routine)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
              primary
                ? 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-white border-slate-300 text-gray-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <FileDown className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
    </PageSection>
  )
}
