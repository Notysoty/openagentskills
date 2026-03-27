---
name: Code Review Checklist
description: Runs a systematic checklist review on any code diff or file, covering correctness, security, performance, and readability.
category: coding
tags:
  - code-review
  - quality
  - security
  - best-practices
author: simplyutils
---

# Code Review Checklist

## What this skill does

This skill directs the agent to perform a structured code review using a proven checklist. It catches bugs, security issues, performance problems, and readability concerns that are easy to miss in a quick scan. The output is a prioritized list of findings — not vague suggestions, but specific line-level feedback with clear explanations.

Use this before merging a PR, after a refactor, or any time you want a second opinion on code quality.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/code-review-checklist/SKILL.md` in your project root.

Then ask the agent:
- *"Review this file using the Code Review Checklist skill."*
- *"Run the Code Review Checklist skill on my PR diff."*

### Cursor

Add the contents of the "Prompt / Instructions" section below to your `.cursorrules` file, then open the file you want reviewed and ask Cursor to review it.

### Codex

Paste the code and the instructions from the section below into the Codex chat.

## The Prompt / Instructions for the Agent

When asked to review code, work through each section of this checklist in order. For every issue found, output:

- **Severity**: `critical` | `major` | `minor` | `nit`
- **Location**: file name and line number(s)
- **Issue**: one-sentence description
- **Suggestion**: what to do instead

---

### 1. Correctness

- [ ] Does the logic match the intended behavior (based on function name, comments, or context)?
- [ ] Are there off-by-one errors in loops or array accesses?
- [ ] Are all code paths handled, including edge cases (empty input, null, zero, negative numbers)?
- [ ] Are async operations properly awaited? Could there be race conditions?
- [ ] Are errors caught and handled appropriately, or silently swallowed?

### 2. Security

- [ ] Is any user input used in SQL queries, shell commands, or file paths without sanitization?
- [ ] Are secrets, API keys, or passwords hardcoded or logged?
- [ ] Are authentication and authorization checks in place before sensitive operations?
- [ ] Is output properly escaped before being rendered in HTML (XSS)?
- [ ] Are dependencies pinned to known-good versions?

### 3. Performance

- [ ] Are there any N+1 query patterns (a query inside a loop)?
- [ ] Is expensive work (network calls, heavy computation) done unnecessarily on every request?
- [ ] Are large data structures being copied when a reference would suffice?
- [ ] Are there obvious opportunities for caching or memoization?

### 4. Readability & Maintainability

- [ ] Are variable and function names descriptive and consistent with the surrounding codebase?
- [ ] Is any logic complex enough to warrant a comment but currently unexplained?
- [ ] Are there magic numbers or strings that should be named constants?
- [ ] Is the function doing more than one thing (violates single-responsibility)?
- [ ] Is there dead code, commented-out code, or TODO comments that should be resolved?

### 5. Tests

- [ ] Are the critical paths covered by tests?
- [ ] Do the tests actually assert meaningful behavior, or just that no error was thrown?
- [ ] Are edge cases (empty input, error states) tested?

---

After completing the checklist, output a **summary** with:
1. Total findings by severity
2. The top 3 issues to fix first (highest severity / most impactful)
3. An overall assessment: `Approve` | `Approve with minor fixes` | `Needs changes`

If no issues are found in a section, write "✓ No issues found" for that section rather than skipping it.

## Example

**Input to Agent:**
> "Use the Code Review Checklist skill on this function:
>
> ```typescript
> async function getUser(id: string) {
>   const query = `SELECT * FROM users WHERE id = '${id}'`;
>   const result = await db.raw(query);
>   return result.rows[0];
> }
> ```"

**Output from Agent:**

**Correctness**
- **Major** | Line 3 | No null check on `result.rows[0]` — returns `undefined` if user not found, which may cause downstream errors. | Return `null` explicitly or throw a `NotFoundError`.

**Security**
- **Critical** | Line 2 | SQL injection vulnerability — `id` is interpolated directly into the query string. | Use a parameterized query: `db.raw('SELECT * FROM users WHERE id = ?', [id])`.

**Performance**
- **Minor** | Line 2 | `SELECT *` fetches all columns even if only a few are needed. | Specify the columns you actually use.

**Summary**
- 1 critical, 1 major, 1 minor
- Top issues: SQL injection (critical), missing null check (major), over-fetching columns (minor)
- **Assessment: Needs changes**

## Notes

- If the diff is large, focus on files with the most business logic first.
- For nitpicks (formatting, naming), group them at the end rather than interspersing them with real issues.
- This skill does not run linters or static analysis — it is a reasoning-based review. For automated checks, run your existing lint/test pipeline first.
