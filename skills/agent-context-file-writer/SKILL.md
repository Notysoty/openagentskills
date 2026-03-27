---
name: Agent Context File Writer
description: Writes a high-quality CLAUDE.md, .cursorrules, or .windsurfrules file that gives a coding agent the right project context, conventions, and constraints to work effectively.
category: productivity
tags:
  - claude-code
  - cursor
  - cursorrules
  - coding-agent
  - context
author: simplyutils
---

# Agent Context File Writer

## What this skill does

This skill writes the context file that tells a coding agent how to work in your project — `CLAUDE.md` for Claude Code, `.cursorrules` for Cursor, `.windsurfrules` for Windsurf, or `.codebuddy` for others. A well-written context file is the highest-leverage thing you can do to improve agent quality. It prevents the agent from making wrong assumptions, using the wrong patterns, or re-explaining things you've already decided.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/agent-context-file-writer/SKILL.md` in your project root.

Then ask:
- *"Use the Agent Context File Writer to create a CLAUDE.md for this project."*
- *"Write a .cursorrules file for our Next.js + Prisma + tRPC codebase."*

Provide:
- Tech stack (framework, language, key libraries)
- Project type (API, frontend app, CLI tool, etc.)
- Any strong conventions (naming, file structure, testing approach)
- Anything agents have done wrong in the past

### Cursor / Codex

Describe your project and provide any existing README or architecture notes alongside these instructions.

## The Prompt / Instructions for the Agent

When asked to write an agent context file, explore the codebase first, then produce the file with all of these sections:

### Step 1 — Explore the codebase

Before writing, read:
- `package.json` / `pyproject.toml` / `go.mod` — to identify the stack
- Directory structure (top 2 levels) — to understand layout
- One or two key files — to understand coding style
- Existing README — for project purpose

### Step 2 — Produce the context file

The file must contain all of these sections:

---

#### Section 1: Project overview (3–5 sentences)
What the project does, who uses it, and what matters most about it. Not a marketing pitch — a technical brief for an agent.

```markdown
## Project Overview
SimplyUtils is a multi-tool web app with 72+ browser-based utilities built on React + Express + PostgreSQL.
Most tools run entirely client-side for privacy. The project is deployed on Vercel (frontend) + EC2 (API).
```

#### Section 2: Stack and key dependencies
List the exact libraries and versions an agent needs to know to write correct code.

```markdown
## Tech Stack
- Frontend: React 18, TypeScript, Vite, TailwindCSS, shadcn/ui, Wouter (routing)
- Backend: Express, TypeScript, Drizzle ORM, PostgreSQL
- Testing: Vitest, Playwright
- Build: Vite (client), esbuild (server)
```

#### Section 3: Project structure
Map the key directories so the agent doesn't need to explore.

```markdown
## Project Structure
- `client/src/tools/` — tool components (one file per tool)
- `client/src/components/seo/` — SEO content per tool (required)
- `server/routes.ts` — all API endpoints
- `shared/schema.ts` — database schema (Drizzle)
- `client/src/data/` — static data files
```

#### Section 4: Conventions and rules (most important section)
Explicit rules the agent must follow. Be specific — vague rules get ignored.

```markdown
## Rules
1. Every new tool needs a matching SEO component in `client/src/components/seo/`
2. Use shadcn/ui components — never write raw HTML form elements
3. Database queries go through `storage` (server/storage.ts) — never query directly in routes
4. All client-side processing preferred — no server round-trip unless necessary
5. Run `npm run check` before finishing any task — fix all type errors
```

#### Section 5: Patterns with examples
Show the agent how things are done in this project, not how they're done in general.

```markdown
## Patterns

### Adding a new tool
1. Create `client/src/tools/MyTool.tsx`
2. Add to `client/src/data/tools.ts`
3. Map in `client/src/pages/ToolPage.tsx`
4. Create `client/src/components/seo/MyToolSeoContent.tsx`

### API endpoint pattern
```ts
app.post("/api/my-endpoint", requireTurnstile, async (req, res) => {
  const { input } = req.body;
  // validate input
  res.json({ result });
});
```
```

#### Section 6: What NOT to do
List anti-patterns the agent should avoid. Include ones it has gotten wrong before.

```markdown
## Avoid
- Never use `any` type in TypeScript — use proper types or `unknown`
- Never add console.log statements in production code
- Never commit .env files or secrets
- Don't create new utility files for one-off functions — inline them
- Don't add dependencies without checking if something already in the project does the job
```

#### Section 7: Commands
The commands the agent needs to run.

```markdown
## Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run check` — TypeScript type check (run before finishing)
- `npm run db:push` — push schema changes
```

### Rules for writing a good context file

- **Be specific, not general.** "Use TypeScript properly" is useless. "Never use `any` — use `unknown` and narrow it" is actionable.
- **Include negative examples.** What has gone wrong? What should the agent never do?
- **Keep it under 200 lines.** Longer files dilute attention. If it's too long, the agent will skim it.
- **Update it when conventions change.** A stale context file is worse than none.
- **Don't duplicate the README.** The context file is for agent behavior, not project documentation.

## Example

**Input:**
> "Write a CLAUDE.md for a FastAPI + SQLAlchemy + React project. We use Pydantic v2, Alembic for migrations, and pytest. The agent previously kept writing raw SQL instead of using SQLAlchemy."

**Output:**
```markdown
# CLAUDE.md

## Project Overview
Python REST API (FastAPI) with a React frontend. SQLAlchemy is the ORM — never write raw SQL.
Pydantic v2 handles all request/response validation.

## Stack
- Backend: Python 3.12, FastAPI, SQLAlchemy 2.0, Pydantic v2, Alembic
- Frontend: React 18, TypeScript, Vite
- Testing: pytest, pytest-asyncio

## Rules
1. **Never write raw SQL** — always use SQLAlchemy ORM (select, insert, update via session)
2. All request/response models are Pydantic BaseModel subclasses in `app/schemas/`
3. Database models are in `app/models/` — one file per domain entity
4. All DB operations go through the session dependency: `db: Session = Depends(get_db)`
5. Run `pytest` before finishing — all tests must pass

## Migrations
- Add new columns in `app/models/`, then run `alembic revision --autogenerate -m "description"`
- Never edit the database directly

## Commands
- `uvicorn app.main:app --reload` — dev server
- `pytest` — run tests
- `alembic upgrade head` — apply migrations
```
