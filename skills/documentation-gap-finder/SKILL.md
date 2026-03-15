---
name: Documentation Gap Finder
description: Audits a codebase or docs folder and lists everything that is undocumented, outdated, or unclear.
category: productivity
tags:
  - documentation
  - audit
  - dx
  - technical-writing
author: simplyutils
---

# Documentation Gap Finder

## What this skill does

This skill directs the agent to audit a codebase or documentation directory and produce a comprehensive list of documentation gaps. It checks for missing docstrings, undocumented exports, README files that don't match the current code, stale setup instructions, and any public API surface that lacks documentation. The output is a prioritized gap list that tells you exactly what to write and in what order.

Use this when preparing for a new developer joining the team, before an open-source launch, when onboarding is taking too long, or as part of a quarterly documentation review.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/documentation-gap-finder/SKILL.md` in your project root.

Then ask:
- *"Use the Documentation Gap Finder skill on the entire repo."*
- *"Audit the documentation for `src/api/` using the Documentation Gap Finder skill."*
- *"Use the Documentation Gap Finder skill — I want to know what a new developer would struggle to find."*

### Cursor

Add the instructions below to your `.cursorrules` or paste them into the Cursor AI pane before asking for the audit.

### Codex

Provide the directory tree and key files. Ask Codex to follow the instructions below to produce the gap report.

## The Prompt / Instructions for the Agent

When asked to audit documentation, follow these steps:

### Step 1 — Establish scope

Determine what to audit:
- If given a specific directory, focus there
- If given the whole repo, check: root-level docs, `docs/` or `wiki/` folder, `README.md`, all public API surfaces, and configuration files
- Identify the audience: internal developers, external API consumers, end users, or all three

### Step 2 — Audit each documentation type

**README / Project-level docs**
- Does a `README.md` exist at the project root?
- Does it cover: what the project does, how to set it up, how to run it locally, how to run tests, how to deploy, how to contribute?
- Are the setup instructions still accurate? Check against `package.json`, `Dockerfile`, or equivalent.
- Are any listed commands or URLs broken or outdated?

**Code-level documentation**
- For every exported function, class, type, and constant: is there a docstring or JSDoc comment?
- Are complex algorithms or non-obvious logic blocks explained with inline comments?
- Are there any TODO/FIXME comments that have been sitting for a long time without resolution?

**API documentation**
- For REST APIs: is every endpoint documented? (method, path, request body, response shape, error codes)
- For library/SDK APIs: is every public export documented with parameters, return type, and an example?
- Is there an OpenAPI/Swagger spec? If so, is it up to date?

**Architecture documentation**
- Is there any document explaining the high-level system design?
- Are major design decisions documented (ADRs — Architecture Decision Records)?
- Are non-obvious dependencies or integrations explained?

**Operational documentation**
- How is the application deployed?
- Are environment variables documented (what each one does, whether it's required)?
- Is there a runbook for common operational tasks?

**Onboarding documentation**
- Is there a "getting started for new developers" guide?
- Are there contribution guidelines?

### Step 3 — Flag outdated content

For documentation that exists, check for staleness signals:
- Setup instructions that reference packages/tools no longer in the project
- API docs that describe endpoints that have been removed or changed
- Screenshots or examples that no longer match the current UI or output
- Version numbers or dates that suggest the doc hasn't been updated recently

### Step 4 — Prioritize the gaps

Score each gap:
- **Critical** — Without this, a new developer cannot set up or use the project
- **High** — A developer can get started but will waste significant time without this
- **Medium** — Useful documentation that reduces friction but isn't blocking
- **Low** — Nice to have; minor polish

### Step 5 — Format the output

```markdown
## Documentation Gap Report — [Project / Directory]

### Summary
- Critical gaps: N
- High-priority gaps: N
- Medium-priority gaps: N
- Low-priority gaps: N

---

### Critical Gaps

#### 1. [Gap title]
- **Type**: [Missing / Outdated / Unclear]
- **Location**: [Where it should live, e.g., `README.md` setup section]
- **Impact**: [Who is affected and how]
- **What to write**: [Specific description of what the documentation should say]

### High-Priority Gaps
[Same format]

### Medium-Priority Gaps
[Same format]

### Low-Priority Gaps
[Same format]

---

### What's Already Well-Documented
[Briefly note what's good so the team knows what not to change]

### Recommended First 3 Actions
1. [Most important thing to write first]
2. [Second]
3. [Third]
```

## Example

**Input to Agent:**
> "Use the Documentation Gap Finder skill on this repo. Here's the directory tree and the current README content: [paste tree and README]"

**Output from Agent:**

> ## Documentation Gap Report — MyAPI
>
> ### Summary
> - Critical gaps: 2
> - High-priority gaps: 4
> - Medium-priority gaps: 6
> - Low-priority gaps: 3
>
> ### Critical Gaps
>
> #### 1. No environment variable documentation
> - **Type**: Missing
> - **Location**: `README.md` or new `docs/environment.md`
> - **Impact**: New developers cannot run the project locally — they don't know what `.env` keys to set
> - **What to write**: A table with every env var, whether it's required, what it does, and an example value. Found 14 undocumented env vars in `server/config.ts`.
>
> #### 2. No local setup instructions in README
> - **Type**: Missing
> - **Location**: `README.md`
> - **Impact**: First thing a new developer needs; currently only shows badges
> - **What to write**: Step-by-step: clone, `npm install`, copy `.env.example`, `npm run db:push`, `npm run dev`
>
> ### Recommended First 3 Actions
> 1. Add a local setup section to README.md
> 2. Document all environment variables (they're blocking the most people)
> 3. Add JSDoc to the 8 exported functions in `src/api/auth.ts` — most heavily used file with no docs

## Notes

- Focus on documentation that helps a developer who has never seen the codebase. Everything that seems "obvious" to the current team is a documentation gap for a newcomer.
- If you find outdated documentation, flag it as a gap even if documentation exists — wrong documentation is often worse than no documentation.
- Use this skill together with the README Writer skill to produce the missing documents after identifying them.
