# Project Overview & Rules

- **Tech Stack:** Next.js, Tailwind CSS, TypeScript
- **State Management:** React hooks / Context API
- **Styling:** Mobile-first, Tailwind utility classes only

## Coding Standards
- Use functional components with explicit TypeScript interfaces for props.
- Keep business logic inside custom hooks or server actions.


# Agent Execution Standards

## Required Workflows
Before executing tasks, check and follow the relevant playbook in `.antigravity/workflows/`:
- Creating UI/routes: `.antigravity/workflows/new-page.md`
- Submitting git changes: Use global workflow `git-commit.md`
- Bug triage: `.antigravity/workflows/fix-bug.md`

Always state which workflow is being executed at the beginning of the response.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->