import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { SUBJECTS, PAPERS, PAPERLESS, paperKey } from './examData.js'
import { ExamSection, CheckItem } from './ExamForm.jsx'

function PaperSubject({ subject, selected, onPaperToggle, onSubjectAll }) {
  const [open, setOpen] = useState(false)

  if (PAPERLESS.includes(subject)) {
    const checked = !!selected[paperKey(subject, '')]
    return <CheckItem label={subject} checked={checked} onChange={() => onSubjectAll(subject, !checked)} />
  }

  const count = PAPERS.filter((p) => selected[paperKey(subject, p)]).length
  const allSelected = count === PAPERS.length

  return (
    <div>
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={`${open ? 'Hide' : 'Show'} ${subject} papers`}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <CheckItem
          label={subject}
          checked={allSelected}
          indeterminate={count > 0 && !allSelected}
          onChange={() => onSubjectAll(subject, !allSelected)}
        />
        {count > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded-full">
            {count}/{PAPERS.length}
          </span>
        )}
      </div>
      {open && (
        <div className="ml-7 flex flex-wrap gap-x-5">
          {PAPERS.map((paper) => (
            <CheckItem
              key={paper}
              label={paper}
              checked={!!selected[paperKey(subject, paper)]}
              onChange={() => onPaperToggle(subject, paper)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function PaperFinalList({ selected, onPaperToggle, onSubjectAll }) {
  return (
    <ExamSection title="Paper Final">
      <div className="space-y-1">
        {SUBJECTS.map((subject) => (
          <PaperSubject
            key={subject}
            subject={subject}
            selected={selected}
            onPaperToggle={onPaperToggle}
            onSubjectAll={onSubjectAll}
          />
        ))}
      </div>
    </ExamSection>
  )
}
