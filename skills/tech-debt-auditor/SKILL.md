---
name: Tech Debt Auditor
description: Identifies and prioritizes technical debt in a codebase with an effort/impact matrix.
category: coding
tags:
  - tech-debt
  - code-quality
  - refactoring
  - audit
author: simplyutils
---

# Tech Debt Auditor

## What this skill does

This skill directs the agent to systematically scan a codebase for technical debt, categorize every item by type, and then rank each item against an effort/impact matrix so you can prioritize what to tackle first. It distinguishes between cosmetic debt (naming, formatting), structural debt (tangled dependencies, god classes), and strategic debt (shortcuts taken deliberately). The output is a prioritized backlog, not just a complaint list.

Use this when you're planning a refactoring sprint, preparing for a new feature that will touch old code, or doing a code quality review before onboarding new engineers.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/tech-debt-auditor/SKILL.md` in your project root.

Then ask:
- *"Use the Tech Debt Auditor skill on the `src/payments/` directory."*
- *"Run a full tech debt audit on this repository using the Tech Debt Auditor skill."*

Point to a specific directory, a single file, or ask for a whole-repo scan. For large repos, start with the highest-churn directories.

### Cursor

Add the instructions below to your `.cursorrules` or paste them into the Cursor AI pane before pointing to the code you want audited.

### Codex

Paste the file or directory listing into the chat along with the instructions from the section below. For large codebases, provide the directory tree and the agent will ask for specific files it needs to inspect.

## The Prompt / Instructions for the Agent

When asked to audit for technical debt, follow this process precisely:

### Phase 1 — Scan and catalogue

Read the target files thoroughly. For each file, look for:

**Structural debt**
- God classes or modules (a single file doing too many unrelated things)
- Circular dependencies between modules
- Deeply nested conditionals (more than 3 levels)
- Functions longer than 50 lines
- Duplicated logic across multiple files
- Hard-coded configuration values that should be environment variables

**Dependency debt**
- Outdated packages with known issues or major version gaps
- Direct use of deprecated APIs
- Tightly coupled modules with no abstraction layer

**Test debt**
- Files or functions with no test coverage
- Tests that are testing implementation rather than behavior
- Commented-out test blocks
- Missing integration tests for critical paths

**Documentation debt**
- Public functions/classes with no docstring or JSDoc
- Outdated comments that describe behavior that no longer matches the code
- Missing README or architecture notes for non-obvious modules

**Cosmetic debt**
- Inconsistent naming conventions within the same file
- Unused imports or dead code
- Magic numbers and unexplained string literals

### Phase 2 — Score each item

For every debt item found, assign:

- **Impact** (1–3): How much does this hurt? 1 = minor annoyance, 2 = slows feature work or causes occasional bugs, 3 = blocks features, causes real bugs, or creates security/correctness risk
- **Effort** (1–3): How much work to fix? 1 = under an hour, 2 = half a day to a day, 3 = multi-day or requires coordination

### Phase 3 — Build the priority matrix

Categorize each item:

- **Do First** — High impact (3), Low effort (1 or 2): quick wins
- **Plan In** — High impact (3), High effort (3): schedule these as dedicated work items
- **Nice to Have** — Low impact (1 or 2), Low effort (1): fix when passing by
- **Deprioritize** — Low impact (1 or 2), High effort (3): probably not worth it

### Phase 4 — Output

Format the output as follows:

```markdown
## Tech Debt Audit — [Target]

### Summary
- Total items found: N
- Do First: N items
- Plan In: N items
- Nice to Have: N items
- Deprioritize: N items

### Do First (High Impact, Low Effort)

| # | File | Debt Type | Description | Impact | Effort |
|---|------|-----------|-------------|--------|--------|
| 1 | `src/foo.ts` | Structural | Function `processOrder` is 120 lines and handles 4 unrelated concerns | 3 | 1 |

### Plan In (High Impact, High Effort)

[Same table format]

### Nice to Have

[Same table format]

### Deprioritize

[Same table format]

### Recommended Starting Point
[2–3 sentences explaining which item(s) to tackle first and why, including any dependencies between items]
```

Do not suggest fixes in detail — this is an audit, not a refactor plan. If the user wants a fix plan for a specific item, they should use the Refactor Planner skill.

## Example

**Input to Agent:**
> "Use the Tech Debt Auditor skill on `src/billing/`."

**Output from Agent:**

> ## Tech Debt Audit — `src/billing/`
>
> ### Summary
> - Total items found: 9
> - Do First: 3 items
> - Plan In: 2 items
> - Nice to Have: 3 items
> - Deprioritize: 1 item
>
> ### Do First (High Impact, Low Effort)
>
> | # | File | Debt Type | Description | Impact | Effort |
> |---|------|-----------|-------------|--------|--------|
> | 1 | `invoiceService.ts` | Structural | Stripe API key hardcoded on line 12 instead of read from env | 3 | 1 |
> | 2 | `invoiceService.ts` | Test | `generateInvoice()` has zero test coverage — it's the most critical billing path | 3 | 2 |
> | 3 | `utils/format.ts` | Documentation | 6 exported functions have no JSDoc; used across 11 files | 2 | 1 |
>
> ### Plan In (High Impact, High Effort)
>
> | # | File | Debt Type | Description | Impact | Effort |
> |---|------|-----------|-------------|--------|--------|
> | 4 | `billingController.ts` | Structural | 280-line god class handles HTTP parsing, business logic, and DB writes with no separation | 3 | 3 |
> | 5 | `billingController.ts` | Dependency | Directly imports `db` connection instead of going through a repository layer, making testing impossible | 3 | 3 |
>
> ### Recommended Starting Point
> Fix the hardcoded API key immediately (item 1) — it's a security issue, not just tech debt. Then add tests for `generateInvoice()` (item 2) before touching anything else, so you have a safety net when splitting the god class (item 4).

## Notes

- For monorepos, run the audit directory by directory so the output stays focused.
- Items that appear in multiple categories (e.g., a god class that also has no tests) should be listed once under the highest-impact category.
- This skill produces an audit list, not code changes. Use the Refactor Planner skill to turn individual items into step-by-step fix plans.
