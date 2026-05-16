<!--
Sync Impact Report
- Version change: template -> 1.0.0
- Modified principles:
  - Template principle 1 -> I. Server-First Data Flow
  - Template principle 2 -> II. Repositories Are Read-Only Boundaries
  - Template principle 3 -> III. Mutations Live in Server Actions
  - Template principle 4 -> IV. Components Preserve UI Boundaries
  - Template principle 5 -> V. Minimal Layering and Version-Aware Changes
- Added sections:
  - Implementation Constraints
  - Delivery Workflow
- Removed sections:
  - None
- Templates requiring updates:
  - ✅ updated .specify/templates/plan-template.md
  - ✅ updated .specify/templates/spec-template.md
  - ✅ updated .specify/templates/tasks-template.md
  - ✅ updated README.md
  - ✅ no files present under .specify/templates/commands/*.md
- Follow-up TODOs:
  - None
-->

# Training App Constitution

## Core Principles

### I. Server-First Data Flow
Every feature MUST follow the data path `page.tsx (Server Component) -> repository ->
props -> Client Component -> Server Action`. Pages and layouts in `src/app/` own data
loading orchestration, repositories provide the read models, Client Components handle
interaction only, and mutations return to Server Actions. This keeps data access
auditable, avoids duplicated fetching paths, and matches the architecture documented in
`AGENTS.md` and `ARCHITECTURE.md`.

### II. Repositories Are Read-Only Boundaries
Files in `src/lib/repositories/` MUST be limited to Supabase read access, with one file
per entity or domain slice. Repositories MUST NOT contain writes, business logic, UI
formatting, or cross-layer orchestration. Server Components may call repositories
directly. If logic is needed beyond shaping a query result, it belongs outside the
repository so data access remains predictable and easy to review.

### III. Mutations Live in Server Actions
Every write to Supabase MUST be implemented in `src/lib/actions/` as a Next.js Server
Action with `'use server'` at the top of the file. Actions MUST use
`createSupabaseAdminClient()` and MUST call `revalidatePath` or `revalidateTag` for all
affected views after a successful write. This is non-negotiable because stale UI,
split mutation paths, and inconsistent authorization are the fastest ways to erode app
correctness.

### IV. Components Preserve UI Boundaries
Components MUST receive data as props and MUST NOT import repositories. Files under
`src/components/ui/` are shadcn primitives and MUST NOT be modified directly.
Interactive components MUST use the `Client` suffix in the filename, and domain
components MUST stay within the existing `workout/`, `exercise/`, `planner/`, `stats/`,
`layout/`, or `theme/` groupings unless a new domain grouping is clearly warranted.
These boundaries keep rendering intent obvious and reduce accidental coupling.

### V. Minimal Layering and Version-Aware Changes
The codebase MUST prefer the smallest correct change. New architectural layers,
especially `services/`, MUST NOT be introduced unless business logic is reused across
multiple actions and the need is documented in `ARCHITECTURE.md` before implementation.
Because this app runs on Next.js 16 and React 19, any framework-facing change MUST be
checked against the current project conventions and official docs rather than older
patterns or training-data defaults. Simplicity is a governance rule here, not a style
preference.

## Implementation Constraints

- The primary stack is Next.js 16, React 19, TypeScript, Supabase, Tailwind CSS v4,
  and shadcn/ui.
- Route files in `src/app/` MUST stay focused on routing, page composition, metadata,
  and server-side orchestration.
- Shared database access utilities MUST stay under `src/lib/supabase/`, and generated
  Supabase types MUST remain the source of truth for database typing.
- New work MUST preserve the established source layout instead of introducing parallel
  patterns that duplicate `app/`, `components/`, `lib/actions/`, or
  `lib/repositories/` responsibilities.
- Any exception to these constraints MUST be documented in the feature plan's
  Complexity Tracking section and reflected in `ARCHITECTURE.md` before merge.

## Delivery Workflow

- Every spec and implementation plan MUST include an explicit constitution check that
  calls out impacted repositories, actions, routes, and Client Components.
- Every task list MUST organize work by user story and by the affected architecture
  boundary so read-path, write-path, and UI changes remain traceable.
- Reviews MUST reject changes that place writes in repositories, fetch data inside
  Client Components, modify shadcn primitives directly, or add undocumented service
  layers.
- Validation MUST be proportional to the change: linting, targeted tests, build
  verification, or visual checks MUST be recorded when relevant to the touched paths.

## Governance

- This constitution supersedes conflicting local habits or ad hoc implementation
  shortcuts. `AGENTS.md` and `ARCHITECTURE.md` are operational guides that MUST remain
  consistent with it.
- Amendments MUST update this file and any affected templates or runtime guidance in the
  same change.
- Versioning policy uses semantic versioning for the constitution itself:
  MAJOR for incompatible governance changes or removals, MINOR for new principles or
  materially expanded requirements, and PATCH for clarifications that do not change
  expected behavior.
- Compliance review is mandatory for every plan, task list, and code review touching the
  governed areas above. Violations MUST be corrected or explicitly justified in
  Complexity Tracking before implementation proceeds.

**Version**: 1.0.0 | **Ratified**: 2026-05-16 | **Last Amended**: 2026-05-16
