import { useDeferredValue, useMemo, useState } from 'react'
import { paperKey, PAPERS, PAPERLESS } from './examData.js'
import { DEFAULT_GAPS } from './gapScheduler.js'
import { generate } from './generate.js'

const emptyForm = () => ({
  title: '',
  paperSelected: {},
  subjectSelected: {},
  modelCount: '',
  startDate: '',
  endDate: '',
})

export function useExamCenter() {
  const [form, setForm] = useState(emptyForm)
  const [gaps, setGaps] = useState({ ...DEFAULT_GAPS })
  const deferredForm = useDeferredValue(form)
  const deferredGaps = useDeferredValue(gaps)

  const { error, routine } = useMemo(
    () => generate(deferredForm, deferredGaps),
    [deferredForm, deferredGaps],
  )

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const setGap = (key, value) => setGaps((g) => ({ ...g, [key]: value }))

  const toggleIn = (group, key) =>
    setForm((f) => {
      const next = { ...f[group] }
      if (next[key]) delete next[key]
      else next[key] = true
      return { ...f, [group]: next }
    })

  const togglePaperSubject = (subject, select) =>
    setForm((f) => {
      const next = { ...f.paperSelected }
      if (PAPERLESS.includes(subject)) {
        const key = paperKey(subject, '')
        if (select) next[key] = true
        else delete next[key]
        return { ...f, paperSelected: next }
      }
      PAPERS.forEach((paper) => {
        const key = paperKey(subject, paper)
        if (select) next[key] = true
        else delete next[key]
      })
      return { ...f, paperSelected: next }
    })

  const reset = () => {
    setForm(emptyForm())
    setGaps({ ...DEFAULT_GAPS })
  }

  return {
    form,
    gaps,
    routine,
    error,
    setField,
    setGap,
    toggleIn,
    togglePaperSubject,
    reset,
  }
}
