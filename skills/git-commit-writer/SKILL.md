---
name: Git Commit Writer
description: Generates conventional commit messages from staged changes or a diff.
category: coding
tags:
  - git
  - commits
  - conventional-commits
author: simplyutils
---

# Git Commit Writer

## What this skill does

This skill directs the agent to read a git diff (or a plain description of changes) and produce a well-formed commit message following the [Conventional Commits](https://www.conventionalcommits.org/) specification. It chooses the right type (`feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `perf`, `ci`), picks an appropriate scope, writes a concise subject line, and — when the change is large enough to warrant it — adds a descriptive body.

Use this when you want consistent, meaningful commit history without having to remember the format every time.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/git-commit-writer/SKILL.md` in your project root.

Then ask the agent:
- *"Write a commit message for my staged changes using the Git Commit Writer skill."*
- *"Here's a diff. Use the Git Commit Writer skill to produce a commit message."*

For Claude Code, you can also run `git diff --staged` first and paste the output into the chat.

### Cursor

Add the contents of the "Prompt / Instructions" section below to your `.cursorrules` file, or paste it into the Cursor AI pane before asking for a commit message.

### Codex

Paste the diff into the Codex chat along with the instructions from the section below. Codex works best when you include the full diff rather than a summary.

## The Prompt / Instructions for the Agent

When asked to write a commit message, follow these steps:

1. **Read the diff.** If not provided, ask for `git diff --staged` output. Understand every file changed.

2. **Determine the commit type** using these rules:
   - `feat` — a new feature or behavior visible to users or callers
   - `fix` — a bug fix
   - `refactor` — code restructuring with no behavior change
   - `perf` — performance improvement
   - `test` — adding or fixing tests
   - `docs` — documentation only (README, comments, etc.)
   - `style` — formatting, whitespace, lint (no logic change)
   - `chore` — build scripts, dependencies, tooling
   - `ci` — CI/CD pipeline changes

3. **Choose a scope** (optional but recommended). The scope is the part of the codebase most affected, in lowercase: `auth`, `api`, `ui`, `db`, `parser`, etc. Use the folder name or module name if unsure.

4. **Write the subject line** (first line of the commit):
   - Format: `type(scope): short description`
   - Max 72 characters
   - Use the imperative mood: "add", "fix", "remove" — not "added", "fixing", "removes"
   - Do not capitalize the first word after the colon
   - Do not end with a period

5. **Write the body** if the change needs explanation:
   - Leave a blank line between subject and body
   - Explain *why* the change was made, not *what* (the diff shows what)
   - Wrap lines at 72 characters
   - Use bullet points for multiple distinct changes

6. **Add a footer** if applicable:
   - Breaking changes: `BREAKING CHANGE: description`
   - Issue references: `Closes #123` or `Fixes #456`

7. **Output format:**

```
type(scope): short imperative description

Optional body explaining the why behind the change.
Can be multiple paragraphs. Wrap at 72 chars.

Optional footer: Closes #123
```

If the diff contains multiple unrelated changes, flag this and suggest splitting into separate commits.

## Example

**Input to Agent:**
> "Here's my staged diff. Write a commit message using the Git Commit Writer skill.
>
> ```diff
> diff --git a/server/auth.ts b/server/auth.ts
> index 3a1b2c..9f4e5d 100644
> --- a/server/auth.ts
> +++ b/server/auth.ts
> @@ -42,6 +42,12 @@ export async function login(email: string, password: string) {
>    const user = await db.users.findOne({ email });
>    if (!user) throw new AuthError('User not found');
> +
> +  if (user.lockedUntil && user.lockedUntil > new Date()) {
> +    throw new AuthError('Account is temporarily locked. Try again later.');
> +  }
> +
>    const valid = await bcrypt.compare(password, user.passwordHash);
>    if (!valid) {
> +    await incrementFailedAttempts(user.id);
>      throw new AuthError('Invalid password');
>    }
> ```"

**Output from Agent:**
```
fix(auth): lock accounts after repeated failed login attempts

Adds a check for the `lockedUntil` field before attempting password
comparison. Also increments a failed-attempt counter on each bad
password so the locking mechanism has data to act on.
```

## Notes

- If you paste a large diff with changes spanning many files and concerns, the agent may suggest splitting it. That is intentional behavior — large atomic commits make history harder to read.
- The skill does not run `git commit` automatically. It only produces the message text for you to review and use.
- For monorepos, use the package or workspace name as the scope (e.g., `feat(api-gateway): ...`).
