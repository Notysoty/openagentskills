# Contributing to OpenAgentSkills

Thanks for wanting to contribute. Every skill in this library was written by a real developer who found it useful — we're glad you want to add yours.

---

## Code of Conduct

This project follows a simple rule: be respectful. Constructive feedback is welcome; personal attacks are not. If you see a problem, open an issue instead of a comment war.

---

## Types of Contributions

- **New skills** — the most valuable contribution. If you've built a useful agent workflow, package it as a skill and share it.
- **Improvements to existing skills** — better instructions, more examples, new agent support, bug fixes in the prompt logic.
- **Bug reports** — if a skill doesn't work as documented, open an issue using the bug report template.
- **Documentation** — typo fixes, clearer wording, better examples in the README or this file.

---

## Step-by-Step Contribution Guide

### 1. Fork the repository

Click **Fork** at the top right of the GitHub page. This creates your own copy of the repo.

### 2. Clone your fork locally

```bash
git clone https://github.com/YOUR_USERNAME/openagentskills.git
cd openagentskills
```

### 3. Create a branch

Use the naming convention `skill/your-skill-name` for new skills, or `fix/skill-name-description` for fixes:

```bash
git checkout -b skill/your-skill-name
```

### 4. Create your skill folder

All skills live under the `skills/` directory. Create a folder using lowercase letters and hyphens:

```
skills/
└── your-skill-name/
    └── SKILL.md
```

Keep the folder name short and descriptive. Good examples: `git-commit-writer`, `sql-query-optimizer`. Bad examples: `my-cool-skill`, `skill1`.

### 5. Write your SKILL.md

Use the template in the next section. Take your time on this — the quality of your instructions directly determines how useful the skill is.

**Tip:** The `templates/` folder has ready-to-fill starter files for common skill types:
- `templates/code-review-skill.md` — for review and audit skills
- `templates/writing-skill.md` — for content generation skills
- `templates/analysis-skill.md` — for research and analysis skills

### 6. Test it locally

Before opening a PR, test your skill with at least one agent environment. Make sure the agent actually produces useful output following your instructions.

### 7. Commit and push

```bash
git add skills/your-skill-name/SKILL.md
git commit -m "skill: add your-skill-name"
git push origin skill/your-skill-name
```

### 8. Open a Pull Request

Go to the original repo on GitHub and click **Compare & pull request**. Fill out the PR template. A maintainer will review your skill within a few days.

---

## Skill File Structure

Every skill is a single folder with a single file:

```
skills/
└── skill-folder-name/       ← lowercase, hyphenated
    └── SKILL.md             ← the only required file
```

You may optionally include supporting files (e.g., example input files, screenshots), but `SKILL.md` is the only required file.

---

## SKILL.md Template

Copy this template exactly. The YAML frontmatter (between the `---` lines) is required and must be valid YAML.

```markdown
---
name: Your Skill Name
description: One sentence describing what this skill does.
category: coding
difficulty: beginner
tags:
  - your-tag
  - another-tag
author: your-github-username
---

# Your Skill Name

## What this skill does

Describe what the skill enables the agent to do. Be specific about the problem it solves and when you'd reach for it over writing a manual prompt.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/your-skill-name/SKILL.md` in your project root.
Then ask the agent: "Do X using the Your Skill Name skill."

### Cursor

Add the contents of the "Prompt / Instructions" section below to your `.cursorrules` file,
or paste it directly into a Cursor chat session before making your request.

### Codex

(Add Codex-specific setup if applicable, or omit this section.)

## The Prompt / Instructions for the Agent

When asked to [trigger condition], follow these steps:

1. **Step one:** Description of what the agent should do.
2. **Step two:** Another action.
3. **Output format:** Describe exactly how the agent should format its response.

## Example

**Input to Agent:**
> "Your example prompt here."

**Output from Agent:**
> The expected output, formatted as the agent would produce it.

## Notes

- Any known limitations or edge cases.
- Tips for getting better results.
- What this skill is NOT designed to do.
```

### Field Explanations

| Field | Required | Description |
|---|---|---|
| `name` | Yes | Human-readable name. Title case. Max ~50 chars. |
| `description` | Yes | One sentence. Should finish "This skill..." |
| `category` | Yes | One of: `coding`, `writing`, `data`, `devops`, `research`, `productivity` |
| `difficulty` | No | One of: `beginner`, `intermediate`, `advanced` — helps users pick the right skill |
| `tags` | Yes | 2–7 lowercase hyphenated tags for discoverability |
| `author` | Yes | Your GitHub username |

---

## What Makes a Great Skill vs a Poor One

### Great skills

- **Specific and focused.** "Write conventional commit messages from a diff" is a great skill. "Help with git" is too vague.
- **Include real instructions.** The agent prompt section reads like a detailed checklist, not a vague wish. Compare:
  - Poor: "Review the code and suggest improvements."
  - Great: "1. Check for missing error handling on async calls. 2. Flag any variables declared with `var`. 3. Identify unused imports. Format output as..."
- **Show real examples.** The example section uses realistic input and output — not placeholders like "Your input here."
- **Name real limitations.** If the skill only works on TypeScript files, say so.

### Poor skills

- Too generic (duplicates what the agent already does well without guidance)
- No examples
- YAML frontmatter is missing fields or has syntax errors
- The "instructions for the agent" section is just a vague sentence
- Exact duplicate of an existing skill

---

## Review Process

When you open a PR, a maintainer will check:

1. **Frontmatter validity** — all required fields are present and correctly typed
2. **Category correctness** — the category matches the skill's actual purpose
3. **Instruction quality** — the agent prompt section is specific enough to be useful
4. **Example quality** — the example shows a real, representative use case
5. **Uniqueness** — the skill isn't a near-duplicate of an existing one
6. **Folder naming** — lowercase, hyphenated, descriptive

The automated CI will also run `scripts/validate-skills.js` against your file and report any frontmatter errors before a human even looks at it.

---

## Tips for Getting Merged Faster

- Run the validator locally before pushing: `node scripts/validate-skills.js`
- Write your example using a real scenario, not a toy placeholder
- If your skill improves on an existing one, explain the difference in the PR description
- Keep the PR focused — one skill per PR is easiest to review
- Respond to reviewer comments promptly; PRs with no response for 2 weeks may be closed
