<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Architecture — Non-negotiable rules

Full context in `ARCHITECTURE.md`. These rules apply to every file you touch:

## Structure
- `src/lib/repositories/` — DB reads only, one file per entity, no business logic
- `src/lib/actions/` — all mutations via Next.js Server Actions (`'use server'`)
- `src/components/ui/` — shadcn primitives, do not modify
- `src/components/workout/`, `src/components/exercise/` — domain components
- `src/app/` — routes and pages only

## Hard rules
1. **Repositories** only call Supabase. No logic. Server Components call them directly.
2. **Actions** always have `'use server'`, always use `createSupabaseAdminClient()`, always call `revalidatePath` after writing.
3. **Components** receive data as props. Never import repositories inside components.
4. **Client Components** have the suffix `Client` in the filename (e.g. `SetLoggerClient.tsx`).
5. Data flow is always: `page.tsx (Server) → repository → props → Client Component → Server Action`
6. Do NOT add a `services/` layer unless business logic is reused across multiple actions. Document in `ARCHITECTURE.md` first.

# Available MCP Servers

## magic (21st.dev) — UI Component Generation
**When to use:** When the user asks you to create or refine UI components, layouts, or any visual frontend element.
**How to use:**
- `mcp__magic__21st_magic_component_builder` — Build a new component from a natural language description
- `mcp__magic__21st_magic_component_refiner` — Refine or improve an existing component
- `mcp__magic__21st_magic_component_inspiration` — Browse component inspiration/examples
- `mcp__magic__logo_search` — Search for logos/brand assets
**Notes:** Always prefer this over writing raw Tailwind/JSX from scratch for new components.

## puppeteer — Browser Screenshots & Visual Testing
**When to use:** When you need to verify how the UI looks in the browser, check for visual regressions, or debug layout issues.
**How to use:** Take a screenshot of a running dev server page to confirm visual output before reporting a task complete.
**Notes:** The dev server runs on `http://localhost:3000`. Use this to verify UI changes when you can't rely on type checking alone.

## Figma MCP — Design Tokens & Assets
**When to use:** When the user references a Figma design or needs design tokens, colors, spacing, or assets from Figma.
**Status:** Configured but may require re-authentication if failing to connect.
