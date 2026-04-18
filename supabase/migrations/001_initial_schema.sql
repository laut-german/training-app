-- Training App — Schema inicial
-- Fase 1: estructura para workouts importados de Harbiz + registro futuro de series.

-- ============================================================================
-- Enums
-- ============================================================================

create type workout_status as enum ('pending', 'completed');

create type block_type as enum ('simple', 'superset', 'rest');

-- Tipos de "target" parseados desde el string libre que viene de Harbiz
-- (e.g. "8+8", "30''", "6-4-2"). Ver src/lib/target-parser.ts
create type target_type as enum (
  'reps',
  'reps_range',
  'reps_paired',
  'pyramid',
  'time',
  'time_range',
  'distance',
  'mixed'
);

-- ============================================================================
-- exercises_catalog — ejercicios únicos (fuente de verdad para PR/histórico)
-- ============================================================================

create table exercises_catalog (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text unique not null,
  name                  text not null,
  name_alt              text,
  default_target_type   target_type not null,
  video_url             text,
  thumbnail_url         text,
  created_at            timestamptz not null default now()
);

comment on table exercises_catalog is
  'Ejercicio canónico, deduplicado por slug. Cada Exercise de un workout apunta aquí para habilitar PR, histórico y gráficas.';

-- ============================================================================
-- workouts
-- ============================================================================

create table workouts (
  id                uuid primary key default gen_random_uuid(),
  harbiz_id         text unique,
  name              text not null,
  description       text,
  scheduled_date    date not null,
  status            workout_status not null default 'pending',
  completed_at      timestamptz,
  effort_score      int check (effort_score between 1 and 10),
  duration_minutes  int check (duration_minutes >= 0),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index workouts_scheduled_date_idx on workouts (scheduled_date desc);

-- ============================================================================
-- workout_sections
-- ============================================================================

create table workout_sections (
  id            uuid primary key default gen_random_uuid(),
  workout_id    uuid not null references workouts(id) on delete cascade,
  harbiz_id     text,
  title         text,
  description   text,
  order_index   int not null,
  unique (workout_id, order_index)
);

create index workout_sections_workout_idx on workout_sections (workout_id);

-- ============================================================================
-- blocks
-- ============================================================================

create table blocks (
  id              uuid primary key default gen_random_uuid(),
  section_id      uuid not null references workout_sections(id) on delete cascade,
  harbiz_id       text,
  type            block_type not null,
  rounds          int not null default 1 check (rounds >= 1),
  rest_seconds    int check (rest_seconds >= 0),
  order_index     int not null,
  unique (section_id, order_index)
);

create index blocks_section_idx on blocks (section_id);

-- ============================================================================
-- exercises
-- ============================================================================

create table exercises (
  id              uuid primary key default gen_random_uuid(),
  block_id        uuid not null references blocks(id) on delete cascade,
  catalog_id      uuid references exercises_catalog(id) on delete set null,
  harbiz_id       text,
  order_index     int not null,
  sets            text,
  target_raw      text not null,
  target_type     target_type not null,
  target_parsed   jsonb,
  rest_seconds    int check (rest_seconds >= 0),
  notes           text,
  unique (block_id, order_index)
);

create index exercises_block_idx on exercises (block_id);
create index exercises_catalog_idx on exercises (catalog_id);

-- ============================================================================
-- exercise_logs — lo que realmente hiciste (Fase 3, creado vacío)
-- ============================================================================

create table exercise_logs (
  id                uuid primary key default gen_random_uuid(),
  exercise_id       uuid not null references exercises(id) on delete cascade,
  catalog_id        uuid not null references exercises_catalog(id) on delete restrict,
  workout_id        uuid not null references workouts(id) on delete cascade,
  set_number        int not null check (set_number >= 1),
  reps_done         int check (reps_done >= 0),
  weight_kg         numeric(5,2) check (weight_kg >= 0),
  duration_seconds  int check (duration_seconds >= 0),
  distance_meters   numeric(6,2) check (distance_meters >= 0),
  rpe               int check (rpe between 1 and 10),
  notes             text,
  logged_at         timestamptz not null default now()
);

-- Índices para las 3 features premium:
--   "última vez que hiciste X"   → (catalog_id, logged_at desc)
--   "PR automático"              → (catalog_id, weight_kg desc), (catalog_id, duration_seconds desc)
--   "gráfica por ejercicio"      → (catalog_id, logged_at)
create index exercise_logs_catalog_time_idx
  on exercise_logs (catalog_id, logged_at desc);
create index exercise_logs_workout_idx
  on exercise_logs (workout_id);

-- ============================================================================
-- Trigger: mantener workouts.updated_at
-- ============================================================================

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger workouts_set_updated_at
  before update on workouts
  for each row execute function set_updated_at();

-- ============================================================================
-- RLS: activar y bloquear todo acceso anon salvo lectura de catálogo/workouts
-- ============================================================================

-- Nota: sin auth, el único cliente que escribe es el seed/backend con service_role,
-- que hace bypass de RLS. El anon/public se usa solo para queries de lectura
-- desde Server Components en Fase 2. exercise_logs NO se expone a anon
-- (solo se leerá/escribirá desde server con service_role).

alter table exercises_catalog  enable row level security;
alter table workouts           enable row level security;
alter table workout_sections   enable row level security;
alter table blocks             enable row level security;
alter table exercises          enable row level security;
alter table exercise_logs      enable row level security;

create policy "anon read catalog"    on exercises_catalog  for select to anon using (true);
create policy "anon read workouts"   on workouts           for select to anon using (true);
create policy "anon read sections"   on workout_sections   for select to anon using (true);
create policy "anon read blocks"     on blocks             for select to anon using (true);
create policy "anon read exercises"  on exercises          for select to anon using (true);
-- exercise_logs: sin policy anon → inaccesible sin service_role
