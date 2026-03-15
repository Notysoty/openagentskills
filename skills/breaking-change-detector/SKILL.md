---
name: Breaking Change Detector
description: Compares two versions of a codebase or API and flags all breaking changes with migration hints.
category: coding
tags:
  - breaking-changes
  - versioning
  - api
  - migration
author: simplyutils
---

# Breaking Change Detector

## What this skill does

This skill directs the agent to compare two versions of a codebase, API schema, or interface definition and systematically identify every change that could break existing callers. It classifies each change by severity, explains why it is breaking, and provides a concrete migration hint so consumers know exactly what they need to update.

Use this before publishing a new package version, before deploying an API change that existing clients depend on, or during a code review to catch unintended contract changes.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/breaking-change-detector/SKILL.md` in your project root.

Then ask:
- *"Use the Breaking Change Detector skill to compare the old and new versions of our API."*
- *"I changed `src/auth/index.ts`. Use the Breaking Change Detector skill to find any breaking changes."*

Provide: the old version (paste, file path, or git ref) and the new version.

### Cursor

Add the instructions below to your `.cursorrules` or paste them into the Cursor AI pane. Then share both the old and new code side by side.

### Codex

Paste both versions clearly labeled as "OLD VERSION" and "NEW VERSION" and ask Codex to follow the instructions below.

## The Prompt / Instructions for the Agent

When asked to detect breaking changes, follow this process:

### Step 1 — Establish what constitutes the public contract

Before comparing, identify what is "public" — i.e., what external callers or consumers depend on:
- For a library: all exported functions, types, interfaces, and constants
- For a REST API: all endpoints (method + path), request body shapes, response shapes, status codes, and headers
- For a database schema: table names, column names, data types, nullability, and unique constraints
- For a TypeScript/JavaScript module: all `export` statements

Changes to internal/private code are not breaking changes unless they affect something observable from outside.

### Step 2 — Categorize each difference

Compare the old and new versions and classify every difference into one of these categories:

**Breaking changes (must flag)**
- Removed export, endpoint, table, or column
- Renamed export, endpoint, table, or column (removal + add = breaking)
- Changed function signature: removed a parameter, changed a required parameter's type, changed return type in an incompatible way
- Changed REST response: removed a field, changed a field's type, changed a status code that callers branch on
- Added a required field to a request body or function parameter
- Narrowed a type (e.g., `string` → `'a' | 'b'`)
- Changed behavior that existing callers rely on (e.g., changed sort order, changed error format)

**Non-breaking changes (informational only)**
- Added a new optional parameter (with a default value)
- Added a new export, endpoint, or field
- Widened a type (e.g., `'a' | 'b'` → `string`)
- Internal refactoring with identical observable behavior
- Performance improvements
- New optional fields in a response

### Step 3 — For each breaking change, produce a migration hint

Every breaking change entry must include:
- What changed (old vs new)
- Why it is breaking (what callers were relying on)
- What callers must do to migrate (specific, actionable)

### Step 4 — Format the output

```markdown
## Breaking Change Report

### Summary
- Breaking changes: N
- Non-breaking changes: N (informational)

---

### Breaking Changes

#### 1. [Short title]
- **Type**: [Removed / Renamed / Signature change / Type change / Behavior change]
- **Location**: `path/to/file.ts` or `POST /api/endpoint`
- **Old**: [What it was before]
- **New**: [What it is now, or "Removed"]
- **Why it breaks**: [What callers were depending on]
- **Migration**: [Exactly what callers need to change]

#### 2. ...

---

### Non-Breaking Changes (Informational)

| # | Location | Change | Notes |
|---|----------|--------|-------|
| 1 | `src/utils.ts` | Added `formatCurrency()` export | New addition, no action needed |

---

### Recommended Version Bump
[Based on semver: MAJOR if any breaking changes exist, MINOR if only additions, PATCH if only bug fixes]
```

### Step 5 — Flag ambiguous cases

If a change is ambiguous (e.g., a behavior change that some callers rely on but it was arguably a bug), flag it explicitly as "Potentially breaking — review required" with context explaining the ambiguity.

## Example

**Input to Agent:**
> "Use the Breaking Change Detector skill. Here are the two versions of our user service interface:
>
> OLD:
> ```ts
> export function getUser(id: string): Promise<{ id: string; name: string; email: string }>
> export function createUser(name: string, email: string): Promise<{ id: string }>
> export function deleteUser(id: string): Promise<void>
> ```
>
> NEW:
> ```ts
> export function getUser(id: string): Promise<{ id: string; name: string; email: string; role: string }>
> export function createUser(input: { name: string; email: string; role: string }): Promise<{ id: string }>
> ```"

**Output from Agent:**

> ## Breaking Change Report
>
> ### Summary
> - Breaking changes: 2
> - Non-breaking changes: 1 (informational)
>
> ---
>
> ### Breaking Changes
>
> #### 1. `createUser` signature changed from positional args to object input
> - **Type**: Signature change
> - **Location**: `userService.ts`
> - **Old**: `createUser(name: string, email: string)`
> - **New**: `createUser(input: { name: string; email: string; role: string })`
> - **Why it breaks**: All callers passing `createUser("Alice", "alice@example.com")` will break at compile time. Also, `role` is now required — callers that don't provide it will fail.
> - **Migration**: Update all call sites to `createUser({ name: "Alice", email: "alice@example.com", role: "user" })`. Decide on a default role value for existing callers.
>
> #### 2. `deleteUser` removed
> - **Type**: Removed
> - **Location**: `userService.ts`
> - **Old**: `deleteUser(id: string): Promise<void>`
> - **New**: Not present
> - **Why it breaks**: Any caller invoking `deleteUser()` will get a compile error or runtime error.
> - **Migration**: Find a replacement for delete functionality or soft-delete via `updateUser`. Audit all usages with `grep -r "deleteUser"`.
>
> ---
>
> ### Non-Breaking Changes
>
> | # | Location | Change | Notes |
> |---|----------|--------|-------|
> | 1 | `getUser` return type | Added `role: string` field to response | Additive — existing callers can ignore it |
>
> ### Recommended Version Bump
> MAJOR — two breaking changes require a major version bump.

## Notes

- For REST APIs, also check HTTP status codes — changing a 404 to a 400 can break callers that branch on status codes.
- For database schemas, dropping a column is always breaking even if no application code references it — other services may query directly.
- This skill does not apply the migrations — it produces the report. Use the Migration Guide Writer skill to turn the report into a full migration guide.
