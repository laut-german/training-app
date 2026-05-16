# Training App

Training App is a Next.js 16 and Supabase application for planning workouts,
tracking execution, and reviewing progress.

## Architecture Rules

- Reads live in `src/lib/repositories/` and stay read-only.
- Writes live in `src/lib/actions/` as Next.js Server Actions.
- Routes in `src/app/` orchestrate data and pass props down to components.
- Interactive components use the `Client` suffix and never import repositories.
- `src/components/ui/` contains shadcn primitives and is not edited directly.

See `AGENTS.md`, `ARCHITECTURE.md`, and `.specify/memory/constitution.md` for the
full working rules.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Most feature work starts from a route in `src/app/`, a read model in
`src/lib/repositories/`, and a matching interaction path through a `*Client.tsx`
component and `src/lib/actions/`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
