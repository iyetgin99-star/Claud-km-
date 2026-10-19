-- PostgreSQL şeması (Neon/Supabase uyumlu). Yalnızca kaynakta bulunan bilgiler doldurulur; diğerleri NULL.
create table users(id uuid primary key default gen_random_uuid(), email text unique not null, role text not null default 'student' check (role in ('student','admin')), created_at timestamptz default now());
create table courses(id serial primary key, name text unique not null);
create table teachers(id serial primary key, name text unique not null);
create table exams(id serial primary key, exam_year text not null, donem text, kurul text, kind text default 'regular', unique(exam_year,donem,kurul,kind));
create table source_pdfs(id serial primary key, file_name text unique not null, pages int, sha256 text, object_key text);
create table topics(id serial primary key, course_id int references courses, name text not null, parent_id int references topics);
create table questions(
  id text primary key, source_type text not null check (source_type in ('cikmis','calisma','ai_uretilmis')),
  exam_id int references exams, course_id int references courses, teacher_id int references teachers, topic_id int references topics,
  stem text not null, answer char(1), answer_text text, explanation text, student_marked char(1),
  source_pdf_id int references source_pdfs, source_page int, number_in_source int, section int,
  status text not null default 'parsed' check (status in ('parsed','needs_review','verified')), flags text[] default '{}',
  iptal_edildi boolean default false, note text, duplicate_group text, has_figure_ref boolean default false, image_key text,
  fts tsvector generated always as (to_tsvector('turkish', coalesce(stem,''))) stored);
create index on questions using gin(fts); create index on questions(exam_id); create index on questions(teacher_id);
create table options(question_id text references questions on delete cascade, label char(1), body text not null, is_correct boolean default false, primary key(question_id,label));
create table tags(id serial primary key, name text unique); create table question_tags(question_id text references questions, tag_id int references tags, primary key(question_id,tag_id));
create table slide_uploads(id uuid primary key default gen_random_uuid(), user_id uuid references users, object_key text not null, size_bytes bigint, status text default 'uploaded', extracted_text text, created_at timestamptz default now());
create table slide_question_matches(slide_id uuid references slide_uploads, question_id text references questions, score real, level text check (level in ('yuksek','orta','dusuk')), slide_topic text, primary key(slide_id,question_id));
create table summary_images(id uuid primary key default gen_random_uuid(), slide_id uuid references slide_uploads, png_key text, pdf_key text);
create table quizzes(id uuid primary key default gen_random_uuid(), slide_id uuid references slide_uploads, user_id uuid references users, n int, items jsonb, created_at timestamptz default now());
create table quiz_results(id uuid primary key default gen_random_uuid(), quiz_id uuid references quizzes, correct int, wrong int, answers jsonb);
