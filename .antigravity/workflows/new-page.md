# Create a New Next.js Page

Follow this workflow whenever asked to add a new page or route:

1. **Routing:** Create the route directory inside `app/` using App Router conventions (`page.tsx`).
2. **Layout & Metadata:** Export static metadata using `export const metadata: Metadata = { ... }`.
3. **Server vs Client:** Keep the page component a Server Component by default. Extract interactive UI into a `components/` subfolder with `'use client'`.
4. **Styling:** Use Tailwind CSS utility classes adhering to the project's color palette.
5. **Verification:** Ensure `npm run build` passes without type or lint errors.