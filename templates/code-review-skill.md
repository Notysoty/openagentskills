---
name: Your Code Review Skill Name
description: One sentence describing what this review skill checks for and fixes.
category: coding
difficulty: beginner
tags:
  - code-review
  - your-tag
author: your-github-username
---

# Your Code Review Skill Name

## What this skill does

This skill directs the agent to review code for [specific concern — e.g., security issues, performance bottlenecks, accessibility violations]. It produces a prioritized list of findings with severity levels and concrete fix suggestions.

Use this when you want a focused review on [concern] rather than a general code review.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/your-skill-name/SKILL.md` in your project root.

Then ask:
- *"Review `src/auth.ts` using the [Skill Name] skill."*
- *"Run the [Skill Name] skill on all files in `src/api/`."*

### Cursor

Add the **The Prompt / Instructions** section below to your `.cursorrules` file, or paste it into a Cursor chat before making your request.

### Codex

Paste the instructions section into the chat along with the file(s) you want reviewed.

## The Prompt / Instructions for the Agent

When asked to review code using this skill, follow these steps:

1. **Read the file(s).** Understand the structure, purpose, and any existing patterns before flagging issues.

2. **Check for [concern #1].** Look for [specific pattern or anti-pattern]. Flag any instance where [condition].

3. **Check for [concern #2].** Look for [specific pattern]. Flag cases where [condition].

4. **Check for [concern #3].** Look for [specific pattern]. Flag any [condition].

5. **Prioritize findings.** Sort issues into:
   - 🔴 **Critical** — must fix before merging (security risk, data loss, crash)
   - 🟠 **High** — should fix soon (performance, correctness)
   - 🟡 **Medium** — fix when convenient (maintainability, readability)
   - 🟢 **Low** — optional improvement (style, minor cleanup)

6. **For each finding, output:**
   - File and line number
   - Severity level
   - What the problem is
   - Why it matters
   - A concrete fix with a code snippet

7. **Summarize at the end:** Total issues found by severity, and an overall assessment (Ready to merge / Needs minor fixes / Needs major fixes).

## Example

**Input to Agent:**
> "Review `src/middleware/auth.ts` using the [Skill Name] skill."

**Output from Agent:**

```
## Code Review: src/middleware/auth.ts

### 🔴 Critical

**Line 42 — [Issue title]**
Problem: [Description of what's wrong]
Why it matters: [Impact if not fixed]
Fix:
```ts
// Before
const token = req.headers.authorization;

// After
const token = req.headers.authorization?.replace('Bearer ', '');
if (!token) return res.status(401).json({ error: 'Missing token' });
```

### 🟡 Medium

**Line 78 — [Issue title]**
Problem: [Description]
Fix: [Suggested change]

---
Summary: 1 critical, 0 high, 1 medium, 0 low. Needs fixes before merge.
```

## Notes

- This skill focuses on [concern] only. For a general review, use the Code Review Checklist skill.
- Works best on files under ~500 lines. For larger files, run it on specific functions or sections.
- [Any other known limitations or tips]
