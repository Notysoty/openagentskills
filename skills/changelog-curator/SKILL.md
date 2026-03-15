---
name: Changelog Curator
description: Maintains and formats a CHANGELOG.md following Keep a Changelog conventions from git history or PR list.
category: productivity
tags:
  - changelog
  - documentation
  - git
  - releases
author: simplyutils
---

# Changelog Curator

## What this skill does

This skill directs the agent to write or update a `CHANGELOG.md` that follows the [Keep a Changelog](https://keepachangelog.com) format. It takes a list of commits, PR titles, or a git log dump, groups changes into the correct categories (Added, Changed, Fixed, Removed, Deprecated, Security), writes them in clear human-readable language, and formats the file correctly with semantic versioning and dates.

Use this before cutting a release, during sprint wrap-up, or when your changelog has fallen behind and you need to bring it up to date.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/changelog-curator/SKILL.md` in your project root.

Then ask:
- *"Use the Changelog Curator skill to update CHANGELOG.md for the v2.3.0 release. Here's the git log: [paste log]."*
- *"Use the Changelog Curator skill to create a CHANGELOG.md for these PRs: [list PRs]."*

Provide:
- The git log (`git log --oneline vX.Y.Z..HEAD`) or a list of PR titles/descriptions
- The new version number and release date (or "Unreleased")
- The existing `CHANGELOG.md` if one exists (so the agent can append, not overwrite)

### Cursor

Add the instructions below to your `.cursorrules` or paste them into the Cursor AI pane. Paste the git log or PR list along with the version number.

### Codex

Paste the git log or PR list, the current `CHANGELOG.md` if it exists, and the version number. Ask Codex to follow the instructions below.

## The Prompt / Instructions for the Agent

When asked to write or update a changelog, follow these steps:

### Step 1 — Parse the input

The input may be:
- A raw `git log --oneline` dump
- A list of PR titles
- A mix of both

For each item, extract:
- The core change (ignore ticket numbers, PR numbers, merge commit boilerplate like "Merge branch X")
- The type of change (what category does it belong to?)
- The user-facing impact (what does a user or developer actually experience?)

### Step 2 — Categorize each change

Use exactly these Keep a Changelog categories:

- **Added** — New features, new endpoints, new configuration options, new pages
- **Changed** — Changes to existing functionality, updated behavior, updated dependencies (when behavior changes)
- **Deprecated** — Features that still work but will be removed in a future version
- **Removed** — Features, endpoints, or fields that are gone
- **Fixed** — Bug fixes
- **Security** — Fixes for security vulnerabilities (always list separately and first if present)

If a commit is unclear (e.g., "misc cleanup"), use your best judgment or place it under "Changed."

### Step 3 — Write each entry

Rules for writing changelog entries:
- Write in the **past tense** ("Added", "Fixed", "Removed" — not "Add", "Fix", "Remove")
- Write from the **user's perspective** — what changed for them, not what the developer did internally
- Be **specific** — "Fixed crash when uploading files larger than 10 MB" not "Fixed file upload bug"
- Do not include commit hashes, PR numbers, or developer names (unless the project convention includes them)
- Remove redundant prefixes like "feat:", "fix:", "chore:" from conventional commits
- If multiple commits address the same issue, combine them into one entry

### Step 4 — Format the CHANGELOG.md section

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Security
- [Security fixes first, if any]

### Added
- [New feature 1]
- [New feature 2]

### Changed
- [Change 1]

### Deprecated
- [Deprecation 1]

### Removed
- [Removal 1]

### Fixed
- [Bug fix 1]
- [Bug fix 2]
```

Only include sections that have entries. Don't include empty sections.

### Step 5 — Handle the full file

If an existing `CHANGELOG.md` is provided:
- Insert the new version section **above** the previous most-recent version
- Keep the `[Unreleased]` section at the top if it exists; convert it to the new version
- Do not modify any existing version sections
- Ensure the `[Unreleased]` section remains (empty or reset) at the top after inserting

If no `CHANGELOG.md` exists, create one with this header:
```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

[new version section here]
```

## Example

**Input to Agent:**
> "Use the Changelog Curator skill for v1.4.0 released today. Git log:
> ```
> a1b2c3d feat: add CSV export to reports page
> d4e5f6g fix: crash when user has no profile picture
> h7i8j9k fix: login redirect loop on mobile Safari
> l0m1n2o chore: upgrade lodash to 4.17.21
> p3q4r5s feat: add dark mode toggle
> t6u7v8w security: patch XSS in comment renderer
> x9y0z1a feat: new /api/v2/users endpoint with pagination
> b2c3d4e fix: orders not showing for guest users
> ```"

**Output from Agent:**

> ## [1.4.0] - 2026-03-15
>
> ### Security
> - Patched XSS vulnerability in the comment renderer
>
> ### Added
> - Added CSV export to the reports page
> - Added dark mode toggle
> - Added new `/api/v2/users` endpoint with pagination support
>
> ### Changed
> - Updated lodash dependency to 4.17.21
>
> ### Fixed
> - Fixed crash when a user has no profile picture set
> - Fixed login redirect loop on mobile Safari
> - Fixed orders not displaying for guest users

## Notes

- Changelog entries are written for readers (users, developers consuming the API), not for the author. If a change only affects CI configuration or internal test setup, it's usually fine to omit it.
- For breaking changes, add a `⚠ Breaking` prefix to the entry and consider adding a migration note.
- Run `git log vX.Y.Z..HEAD --oneline` to get the commit list for a specific range.
