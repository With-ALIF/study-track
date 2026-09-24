export const SUBJECTS = ['Physics', 'Chemistry', 'Math', 'Biology', 'Bangla', 'English', 'ICT']
export const PAPERLESS = ['ICT']
export const PAPERS = ['1st Paper', '2nd Paper']

export const paperKey = (subject, paper) => `${subject}::${paper}`

export function buildExams({ paperSelected, subjectSelected, modelCount }) {
  const exams = []
  for (const subject of SUBJECTS) {
    if (PAPERLESS.includes(subject)) {
      if (paperSelected[paperKey(subject, '')]) {
        exams.push({ type: 'Paper Final', subject, paper: '', title: `${subject} Final` })
      }
    } else {
      for (const paper of PAPERS) {
        if (paperSelected[paperKey(subject, paper)]) {
          exams.push({ type: 'Paper Final', subject, paper, title: `${subject} ${paper} Final` })
        }
      }
    }
  }
  for (const subject of SUBJECTS) {
    if (subjectSelected[subject]) {
      exams.push({ type: 'Subject Final', subject, paper: '', title: `${subject} Subject Final` })
    }
  }
  for (let i = 1; i <= modelCount; i++) {
    exams.push({
      type: 'Final Model Test',
      subject: '',
      paper: '',
      title: `Final Model Test ${String(i).padStart(2, '0')}`,
    })
  }
  return exams
}
