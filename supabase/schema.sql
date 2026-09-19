-- StudyTrack Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  created_at timestamp with time zone default now()
);

-- Students table
create table students (
  id uuid default uuid_generate_v4() primary key,
  teacher_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  class text not null,
  student_group text not null,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Subjects table
create table subjects (
  id uuid default uuid_generate_v4() primary key,
  name text unique not null,
  created_at timestamp with time zone default now()
);

-- Student-Subjects junction table (which subjects each student is assigned)
create table student_subjects (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references students(id) on delete cascade not null,
  subject_name text not null,
  created_at timestamp with time zone default now(),
  unique(student_id, subject_name)
);

-- Chapters table
create table chapters (
  id uuid default uuid_generate_v4() primary key,
  subject_name text not null,
  chapter_number integer not null,
  chapter_name text not null,
  created_at timestamp with time zone default now()
);

-- Student-Chapters tracking table
create table student_chapters (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references students(id) on delete cascade not null,
  subject_name text not null,
  chapter_name text not null,
  status text default 'not_started' check (status in ('not_started', 'running', 'completed')),
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Class Sessions table
create table class_sessions (
  id uuid default uuid_generate_v4() primary key,
  teacher_id uuid references profiles(id) on delete cascade not null,
  student_id uuid references students(id) on delete cascade not null,
  subject_id uuid,
  chapter_name text,
  topic text not null,
  date date not null,
  duration integer,
  notes text,
  created_at timestamp with time zone default now()
);

-- Insert default subjects
insert into subjects (name) values
  ('Physics'),
  ('Chemistry'),
  ('Higher Math'),
  ('ICT');

-- Insert Physics chapters
insert into chapters (subject_name, chapter_number, chapter_name) values
  ('Physics', 1, 'P-01: ভৌত জগৎ ও পরিমাপ'),
  ('Physics', 2, 'P-01: ভেক্টর'),
  ('Physics', 3, 'P-01: নিউটনিয়ান বলবিদ্যা'),
  ('Physics', 4, 'P-01: কাজ, শক্তি ও ক্ষমতা'),
  ('Physics', 5, 'P-01: মহাকর্ষ ও অভিকর্ষ'),
  ('Physics', 6, 'P-01: পদার্থের গাঠনিক ধর্ম'),
  ('Physics', 7, 'P-01: পর্যায়বৃত্ত গতি'),
  ('Physics', 8, 'P-01: তরঙ্গ'),
  ('Physics', 9, 'P-01: গতিবিদ্যা'),
  ('Physics', 10, 'P-01: আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব'),
  ('Physics', 11, 'P-02: তাপগতিবিদ্যা'),
  ('Physics', 12, 'P-02: স্থির তড়িৎ'),
  ('Physics', 13, 'P-02: চল তড়িৎ'),
  ('Physics', 14, 'P-02: তড়িৎ প্রবাহের চৌম্বক ক্রিয়া ও চৌম্বকত্ব'),
  ('Physics', 15, 'P-02: তড়িতচৌম্বকীয় আবেশ ও পরিবর্তী প্রবাহ'),
  ('Physics', 16, 'P-02: জ্যামিতিক আলোকবিজ্ঞান'),
  ('Physics', 17, 'P-02: ভৌত আলোকবিজ্ঞান'),
  ('Physics', 18, 'P-02: আধুনিক পদার্থবিজ্ঞান'),
  ('Physics', 19, 'P-02: পরমাণুর মডেল এবং নিউক্লিয়ার পদার্থবিজ্ঞান'),
  ('Physics', 20, 'P-02: সেমিকন্ডাক্টর ও ইলেক্ট্রনিক্স'),
  ('Physics', 21, 'P-02: জ্যোতির্বিজ্ঞান');

-- Insert Chemistry chapters
insert into chapters (subject_name, chapter_number, chapter_name) values
  ('Chemistry', 1, 'C-01: ল্যাবরেটরির নিরাপদ ব্যবহার'),
  ('Chemistry', 2, 'C-01: গুণগত রসায়ন'),
  ('Chemistry', 3, 'C-01: মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন'),
  ('Chemistry', 4, 'C-01: রাসায়নিক পরিবর্তন'),
  ('Chemistry', 5, 'C-01: কর্মমুখী রসায়ন'),
  ('Chemistry', 6, 'C-02: পরিবেশ রসায়ন'),
  ('Chemistry', 7, 'C-02: জৈব রসায়ন'),
  ('Chemistry', 8, 'C-02: পরিমাণগত রসায়ন'),
  ('Chemistry', 9, 'C-02: তড়িৎ রসায়ন'),
  ('Chemistry', 10, 'C-02: অর্থনৈতিক রসায়ন');

-- RLS Policies

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table students enable row level security;
alter table subjects enable row level security;
alter table student_subjects enable row level security;
alter table chapters enable row level security;
alter table student_chapters enable row level security;
alter table class_sessions enable row level security;

-- Profiles: Users can only read/update their own profile
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Profiles: Auto-create profile on signup
create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- Students: Teachers can only access their own students
create policy "Teachers can view own students" on students
  for select using (auth.uid() = teacher_id);

create policy "Teachers can insert own students" on students
  for insert with check (auth.uid() = teacher_id);

create policy "Teachers can update own students" on students
  for update using (auth.uid() = teacher_id);

create policy "Teachers can delete own students" on students
  for delete using (auth.uid() = teacher_id);

-- Subjects: Everyone can read (shared reference data)
create policy "Anyone can view subjects" on subjects
  for select using (true);

-- Student-Subjects: Teachers can only manage their own student's subjects
create policy "Teachers can view own student subjects" on student_subjects
  for select using (
    exists (
      select 1 from students
      where students.id = student_subjects.student_id
      and students.teacher_id = auth.uid()
    )
  );

create policy "Teachers can insert own student subjects" on student_subjects
  for insert with check (
    exists (
      select 1 from students
      where students.id = student_subjects.student_id
      and students.teacher_id = auth.uid()
    )
  );

create policy "Teachers can delete own student subjects" on student_subjects
  for delete using (
    exists (
      select 1 from students
      where students.id = student_subjects.student_id
      and students.teacher_id = auth.uid()
    )
  );

-- Chapters: Everyone can read (reference data)
create policy "Anyone can view chapters" on chapters
  for select using (true);

-- Student-Chapters: Teachers can manage their own student's chapters
create policy "Teachers can view own student chapters" on student_chapters
  for select using (
    exists (
      select 1 from students
      where students.id = student_chapters.student_id
      and students.teacher_id = auth.uid()
    )
  );

create policy "Teachers can insert own student chapters" on student_chapters
  for insert with check (
    exists (
      select 1 from students
      where students.id = student_chapters.student_id
      and students.teacher_id = auth.uid()
    )
  );

create policy "Teachers can update own student chapters" on student_chapters
  for update using (
    exists (
      select 1 from students
      where students.id = student_chapters.student_id
      and students.teacher_id = auth.uid()
    )
  );

create policy "Teachers can delete own student chapters" on student_chapters
  for delete using (
    exists (
      select 1 from students
      where students.id = student_chapters.student_id
      and students.teacher_id = auth.uid()
    )
  );

-- Class Sessions: Teachers can only access their own sessions
create policy "Teachers can view own sessions" on class_sessions
  for select using (auth.uid() = teacher_id);

create policy "Teachers can insert own sessions" on class_sessions
  for insert with check (auth.uid() = teacher_id);

create policy "Teachers can update own sessions" on class_sessions
  for update using (auth.uid() = teacher_id);

create policy "Teachers can delete own sessions" on class_sessions
  for delete using (auth.uid() = teacher_id);
