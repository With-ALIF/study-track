import { supabase } from '../lib/supabase'

export async function fetchSubjects() {
  const [subjectsRes, chaptersRes] = await Promise.all([
    supabase.from('subjects').select('name'),
    supabase.from('chapters').select('subject_name'),
  ])
  if (subjectsRes.error) throw subjectsRes.error
  if (chaptersRes.error) throw chaptersRes.error

  const names = new Set()
  for (const s of subjectsRes.data || []) if (s.name) names.add(s.name)
  for (const c of chaptersRes.data || []) if (c.subject_name) names.add(c.subject_name)
  return [...names].sort((a, b) => a.localeCompare(b))
}

export async function fetchChapters(subjects) {
  const { data, error } = await supabase
    .from('chapters')
    .select('id, subject_name, chapter_number, chapter_name')
    .in('subject_name', subjects)
    .order('subject_name')
    .order('chapter_number')
  if (error) throw error
  return data || []
}
