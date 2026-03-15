---
name: Migration Guide Writer
description: Writes clear migration guides for library upgrades, breaking API changes, or framework version bumps.
category: writing
tags:
  - migration
  - documentation
  - breaking-changes
  - upgrades
author: simplyutils
---

# Migration Guide Writer

## What this skill does

This skill produces a structured, developer-friendly migration guide for any upgrade that involves breaking changes. Given the old and new versions of an API, library, or framework, it documents every breaking change with before/after code examples, produces a step-by-step migration checklist, calls out known gotchas, and estimates effort. The result is documentation your users can follow without needing to dig through release notes themselves.

Use this when releasing a major version of a library, upgrading a critical dependency, or documenting a framework migration (e.g., React Router v5 → v6, Next.js 13 → 14, Postgres 15 → 16).

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/migration-guide-writer/SKILL.md` in your project root.

Then ask:
- *"Use the Migration Guide Writer skill to document the changes from v1 to v2 of our SDK."*
- *"Write a migration guide for upgrading from React Router v5 to v6 using the Migration Guide Writer skill."*

Provide the changelog, breaking change list, or old vs. new API code. The more context you give, the more accurate the guide.

### Cursor

Add the "Prompt / Instructions" section to your `.cursorrules` file. Open both the old and new API files (or paste the changelog) and ask Cursor to write the migration guide.

### Codex

Paste the old API code and the new API code (or a changelog listing breaking changes) along with the instructions below.

## The Prompt / Instructions for the Agent

When asked to write a migration guide, follow these steps:

1. **Gather the breaking changes.** Accept input in any form:
   - Old code + new code (diff or separate files)
   - A changelog or release notes listing breaking changes
   - A description of what changed
   - If given a library name and version range, use your knowledge of that library's known changes

2. **Categorize each breaking change by type:**
   - **API rename** — a function, class, or property was renamed
   - **Signature change** — a function's parameters or return type changed
   - **Removal** — a feature, option, or API was removed with no replacement
   - **Behavior change** — the same call now behaves differently
   - **Configuration change** — config file format, env variable names, or defaults changed
   - **Dependency change** — a peer dependency was added, removed, or version-constrained

3. **For every breaking change, write:**
   - A clear title for the change
   - A one-sentence description of what changed and why
   - A "Before" code block showing the old way
   - An "After" code block showing the new way
   - A note about any edge cases or side effects to watch for

4. **Write a step-by-step migration checklist.** Order the steps so each one is safe to do before the next:
   - Start with dependency updates (install new version, remove old packages)
   - Then configuration changes
   - Then API changes that can be done with search-and-replace
   - Then behavioral changes that require manual review
   - End with running tests and validating

5. **Estimate effort** for each step:
   - **Automated** — can be done with a codemod, sed, or find-replace
   - **Quick** (< 1 hour) — a few files to change manually
   - **Medium** (half day) — multiple files or some logic changes needed
   - **Significant** (1+ days) — architectural changes or widespread usage

6. **Include a "Common Gotchas" section** with pitfalls that are easy to miss or that cause confusing errors.

7. **Include a "Testing Your Migration" section** — what to check after the upgrade to confirm everything works.

8. **Output format:**

```markdown
# Migrating from [OLD VERSION] to [NEW VERSION]

## Overview
[2–3 sentences describing the scope of the migration and the most impactful changes.]

## Prerequisites
- [What to install or check before starting]

## Breaking Changes

### [Change Title]
[One-sentence description.]

**Before:**
```[lang]
[old code]
```

**After:**
```[lang]
[new code]
```

> **Note:** [any edge case or side effect]

---
[repeat for each breaking change]

## Step-by-Step Migration Checklist

- [ ] Step 1 — [description] *(Effort: Automated)*
- [ ] Step 2 — [description] *(Effort: Quick)*
...

## Common Gotchas
- **[Gotcha title]:** [Description of the trap and how to avoid it]

## Testing Your Migration
- [ ] [What to verify]
```

## Example

**Input to Agent:**
> "Use the Migration Guide Writer skill. We're migrating our Express app from `jsonwebtoken` v8 to v9. The main changes are: `sign()` callback is removed (now always synchronous), `verify()` now throws instead of passing error to callback, and the `algorithm` option was renamed to `algorithms` (array)."

**Output from Agent:**
> # Migrating from jsonwebtoken v8 to v9
>
> ## Overview
> jsonwebtoken v9 removes all callback-based APIs in favor of synchronous calls and throws on error instead of passing errors to callbacks. Most codebases will need changes in 3–5 files.
>
> ## Breaking Changes
>
> ### `sign()` callback removed
> `jwt.sign()` is now always synchronous. The callback form no longer works.
>
> **Before:**
> ```js
> jwt.sign(payload, secret, { expiresIn: '1h' }, (err, token) => {
>   if (err) return next(err);
>   res.json({ token });
> });
> ```
>
> **After:**
> ```js
> const token = jwt.sign(payload, secret, { expiresIn: '1h' });
> res.json({ token });
> ```
>
> > **Note:** Wrap in `try/catch` since errors now throw instead of being passed to a callback.
>
> ---
>
> ### `verify()` now throws on failure
> Errors are thrown synchronously instead of passed as the first callback argument.
>
> **Before:**
> ```js
> jwt.verify(token, secret, (err, decoded) => {
>   if (err) return res.status(401).json({ error: 'Invalid token' });
>   req.user = decoded;
>   next();
> });
> ```
>
> **After:**
> ```js
> try {
>   req.user = jwt.verify(token, secret);
>   next();
> } catch (err) {
>   res.status(401).json({ error: 'Invalid token' });
> }
> ```
>
> ---
>
> ### `algorithm` option renamed to `algorithms`
> The option now takes an array to explicitly allow multiple algorithms.
>
> **Before:**
> ```js
> jwt.verify(token, secret, { algorithm: 'HS256' }, callback);
> ```
>
> **After:**
> ```js
> jwt.verify(token, secret, { algorithms: ['HS256'] });
> ```
>
> ## Step-by-Step Migration Checklist
>
> - [ ] Update `jsonwebtoken` to v9: `npm install jsonwebtoken@9` *(Effort: Automated)*
> - [ ] Find all `jwt.sign(...)` calls with a callback and rewrite as synchronous *(Effort: Quick)*
> - [ ] Find all `jwt.verify(...)` calls with a callback and replace with try/catch *(Effort: Quick)*
> - [ ] Replace `algorithm:` option with `algorithms: [...]` *(Effort: Automated — find-replace)*
> - [ ] Run your test suite and check all auth-related flows *(Effort: Quick)*
>
> ## Common Gotchas
> - **Unhandled throws:** If you removed the error callback from `verify()` but didn't add try/catch, invalid tokens will crash your server with an unhandled exception.
> - **Middleware scope:** Make sure every `verify()` call in middleware is wrapped in try/catch — not just the ones in route handlers.
>
> ## Testing Your Migration
> - [ ] Login flow produces a valid token
> - [ ] Protected routes reject requests with no token (401)
> - [ ] Protected routes reject requests with an expired token (401)
> - [ ] Protected routes accept a valid token and set `req.user`
