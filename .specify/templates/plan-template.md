# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]

**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]

**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]

**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]

**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]

**Project Type**: [e.g., library/cli/web-service/mobile-app/compiler/desktop-app or NEEDS CLARIFICATION]

**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]

**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]

**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Confirm the feature keeps reads inside `src/lib/repositories/` and writes inside
  `src/lib/actions/`.
- Confirm data flow remains `page.tsx -> repository -> props -> Client Component ->
  Server Action` for every affected user journey.
- List every new or changed Client Component and verify the filename ends with
  `Client.tsx`.
- Confirm `src/components/ui/` primitives are not being modified directly; wrap or
  compose them elsewhere if customization is needed.
- Confirm no new `services/` layer is introduced unless justified in Complexity
  Tracking and pre-documented in `ARCHITECTURE.md`.
- Confirm any Next.js 16 or React 19 API usage has been checked against current project
  conventions and docs.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── app/                  # Routes, pages, layouts, loading states
├── components/
│   ├── ui/               # shadcn primitives (do not modify directly)
│   ├── workout/
│   ├── exercise/
│   ├── planner/
│   ├── stats/
│   ├── layout/
│   └── theme/
└── lib/
    ├── actions/          # All Supabase mutations via Server Actions
    ├── repositories/     # Supabase reads only
    ├── supabase/         # Clients and generated DB types
    └── utils/

scripts/                  # Repository scripts such as seeding and type generation
specs/[###-feature]/      # Feature-specific planning artifacts
```

**Structure Decision**: Use the existing Next.js app structure above and name the exact
files or folders this feature will add or change.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
