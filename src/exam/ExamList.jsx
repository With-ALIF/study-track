import { SUBJECTS } from './examData.js'
import ExamForm from './ExamForm.jsx'
import PaperFinalList from './PaperFinalList.jsx'

export default function ExamList({
  paperSelected,
  subjectSelected,
  onPaperToggle,
  onSubjectToggle,
  onSubjectAll,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <PaperFinalList
        selected={paperSelected}
        onPaperToggle={onPaperToggle}
        onSubjectAll={onSubjectAll}
      />
      <ExamForm
        title="Subject Final"
        options={SUBJECTS}
        selected={subjectSelected}
        onToggle={onSubjectToggle}
      />
    </div>
  )
}
