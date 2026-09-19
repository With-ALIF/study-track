# StudyTrack

A personal tuition/student teaching tracker for teachers. Track students, assign subjects, monitor chapter progress, and manage your teaching workflow.

## Tech Stack

- React + JSX
- Vite
- React Router
- Tailwind CSS
- Lucide React
- Supabase (Auth + Database)
- PostgreSQL
- Row Level Security (RLS)

## Features

- **Authentication** — Email/password login & signup with Supabase Auth
- **Dashboard** — Total students, active students, completed chapters, recent activity
- **Students** — Add, view, search, and delete students
- **Subject Assignment** — Assign only the subjects you teach to each student
- **Chapter Tracking** — Auto-loads chapters per subject, track status (Not Started / Running / Completed)
- **Progress Tracking** — Overall and per-subject progress percentages
- **Dynamic Subjects** — Each student only sees assigned subjects
- **Responsive** — Mobile-friendly sidebar with hamburger menu
- **Protected Routes** — Unauthenticated users redirect to login
- **RLS Security** — Teachers can only access their own students and data

## Default Subjects

| Subject      | Chapters |
|--------------|----------|
| Physics      | 20       |
| Chemistry    | 10       |
| Biology      | 24       |
| Higher Math  | 20       |
| ICT          | 6        |

**Total: 80 pre-loaded chapters**

## Routes

| Path               | Page              |
|---------------------|-------------------|
| `/`                 | Redirect to login |
| `/login`            | Login             |
| `/signup`           | Signup            |
| `/dashboard`        | Dashboard         |
| `/students`         | Students list     |
| `/students/new`     | Add student       |
| `/students/:name`   | Student details   |
| `/settings`         | Settings          |

## Setup

```yaml
git clone https://github.com/With-ALIF/study-track.git
cd study-track
npm install
```

### Environment Variables

Create `.env` file:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

Go to **Supabase SQL Editor** and run the contents of `supabase/schema.sql`.

This will:
- Create all tables (profiles, students, subjects, student_subjects, chapters, student_chapters)
- Insert default subjects and chapters
- Enable RLS with proper policies
- Create auto-profile trigger on signup

### Run

```bash
npm run dev
```

## Database Tables

- **profiles** — Teacher accounts (extends Supabase auth)
- **students** — Student records per teacher
- **subjects** — Reference table (Physics, Chemistry, Biology, Higher Math, ICT)
- **student_subjects** — Which subjects are assigned to each student
- **chapters** — Chapter list per subject (80 total)
- **student_chapters** — Chapter progress tracking per student

## Security

- Uses only the Supabase **anon/public** key in frontend
- **RLS policies** ensure teachers only access their own students
- Never expose service_role key in frontend code
