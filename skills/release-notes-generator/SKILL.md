---
name: Release Notes Generator
description: Generates clear, user-friendly release notes from a git log or list of PRs.
category: productivity
tags:
  - git
  - releases
  - documentation
  - changelog
author: simplyutils
---

# Release Notes Generator

## What this skill does

This skill takes raw git log output or a list of PR titles/descriptions and turns them into polished, user-facing release notes. It groups changes by category, rewrites technical commit messages into plain English, and formats the output as clean markdown ready to paste into GitHub Releases, a CHANGELOG.md, or a blog post.

Use this before every release to save time and produce consistent, readable changelogs your users will actually understand.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/release-notes-generator/SKILL.md` in your project root.

Then run:
```bash
git log v1.2.0..v1.3.0 --oneline
```
Paste the output and ask:
- *"Use the Release Notes Generator skill to turn this git log into release notes for v1.3.0."*
- *"Generate release notes from these PR titles using the Release Notes Generator skill."*

### Cursor

Add the "Prompt / Instructions" section below to your `.cursorrules` file, then paste your git log or PR list into the chat.

### Codex

Paste your git log or PR descriptions directly into the chat along with the instructions below. Include PR body text when available — it gives Codex more context for accurate categorization.

## The Prompt / Instructions for the Agent

When asked to generate release notes, follow these steps:

1. **Parse the input.** Accept any of:
   - `git log --oneline` output (hash + short message)
   - Full `git log` with commit bodies
   - A numbered or bulleted list of PR titles
   - A list of PR titles + descriptions

2. **Categorize each change** into one of these buckets:
   - **New Features** — new capabilities, pages, commands, or options added
   - **Improvements** — enhancements to existing features (faster, easier to use, more options)
   - **Bug Fixes** — things that were broken and are now fixed
   - **Breaking Changes** — anything that requires users to update their code, config, or workflow
   - **Security** — security patches, dependency updates for known CVEs
   - **Under the Hood** — refactors, dependency bumps, CI changes (only include if relevant to devs)

   If a change doesn't clearly fit a category, use your best judgment. Omit pure chore commits (`chore: update lockfile`) unless they affect users.

3. **Rewrite each entry in user-friendly language.**
   - Remove jargon, ticket numbers, and internal references
   - Write from the user's perspective: "You can now..." / "Fixed a bug where..."
   - Keep each bullet to one sentence
   - Do not mention internal file names, function names, or variable names unless they are part of a public API

4. **Order the sections** as: Breaking Changes (if any, always first) → New Features → Improvements → Bug Fixes → Security → Under the Hood.

5. **Write an optional summary paragraph** (2–3 sentences) at the top highlighting the most important changes in this release.

6. **Output format:**

```markdown
## v[VERSION] — [DATE]

[Optional 2–3 sentence summary of the release highlights.]

### Breaking Changes
- ...

### New Features
- ...

### Improvements
- ...

### Bug Fixes
- ...

### Security
- ...

### Under the Hood
- ...
```

Omit any section that has no entries.

7. **If a "Breaking Changes" section exists**, add a migration hint for each breaking change — a one-line note on what users need to do.

## Example

**Input to Agent:**
> "Use the Release Notes Generator skill on this git log for v2.1.0:
>
> ```
> a3f2c1e feat(auth): add OAuth2 login with Google and GitHub
> 9b1d4a7 fix(dashboard): chart not rendering on Safari 16
> cc8e302 perf(api): reduce response time by 40% with query caching
> 5f3a991 chore: bump eslint from 8.0 to 9.0
> 2d7c14e feat(export): add CSV export for all report types
> b8a0f3c fix(upload): files over 10MB silently failed
> e1c5529 refactor(db): replace raw SQL with query builder
> 7fa3318 BREAKING: rename config key api_url to apiUrl
> ```"

**Output from Agent:**
> ## v2.1.0 — 2026-03-15
>
> This release adds Google and OAuth2 login, a long-requested CSV export, and a significant API speed improvement. One configuration key has been renamed — see the breaking change note below.
>
> ### Breaking Changes
> - The configuration key `api_url` has been renamed to `apiUrl`. Update your config file before upgrading.
>
> ### New Features
> - Sign in with Google or GitHub using OAuth2 — no password required.
> - Export any report as a CSV file with a single click.
>
> ### Improvements
> - API responses are now up to 40% faster thanks to query result caching.
>
> ### Bug Fixes
> - Fixed charts not rendering correctly in Safari 16.
> - Fixed an issue where file uploads larger than 10 MB would fail silently with no error message.
