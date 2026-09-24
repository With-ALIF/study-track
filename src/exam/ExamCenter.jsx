import { useExamCenter } from './useExamCenter.js'
import ExamSetup from './ExamSetup.jsx'
import ExamList from './ExamList.jsx'
import GapSettings from './GapSettings.jsx'
import ExamStats from './ExamStats.jsx'
import ScheduleList from './ScheduleList.jsx'
import ExportBar from './ExportBar.jsx'
import PageSection from './PageSection.jsx'

export default function ExamCenter() {
  const exam = useExamCenter()
  const { form, gaps, error, routine, setField, setGap, toggleIn, togglePaperSubject, reset } =
    exam

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Exam Center</h1>
          <p className="text-sm text-green-600 dark:text-green-400 mt-0.5">
            Build, track and export your exam routine.
          </p>
        </div>
        <button
          onClick={reset}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          Reset
        </button>
      </div>

      <ExamSetup {...form} onChange={setField} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ExamList
            paperSelected={form.paperSelected}
            subjectSelected={form.subjectSelected}
            onPaperToggle={(s, p) => toggleIn('paperSelected', `${s}::${p}`)}
            onSubjectToggle={(s) => toggleIn('subjectSelected', s)}
            onSubjectAll={togglePaperSubject}
          />
        </div>
        <GapSettings values={gaps} onChange={setGap} />
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {routine && (
        <>
          <PageSection title={routine.title} />
          <PageSection title="Statistics">
            <ExamStats stats={routine.stats} />
          </PageSection>
          <ExportBar routine={routine} />
        </>
      )}

      <PageSection title="Schedule">
        <ScheduleList routine={routine} />
      </PageSection>
    </div>
  )
}
