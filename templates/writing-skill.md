---
name: Your Writing Skill Name
description: One sentence describing what content this skill produces and for what audience.
category: writing
difficulty: beginner
tags:
  - writing
  - your-tag
author: your-github-username
---

# Your Writing Skill Name

## What this skill does

This skill directs the agent to write [content type — e.g., technical blog posts, release notes, SDK docs] for [target audience — e.g., developers, non-technical stakeholders]. It follows [format/style — e.g., a structured outline with H2/H3 headings, a formal tone, a conversational tone].

Use this when you need [specific output] and want consistent structure and quality every time.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/your-skill-name/SKILL.md` in your project root.

Then ask:
- *"Write [content] using the [Skill Name] skill."*
- *"Use the [Skill Name] skill to turn this [input] into [output]."*

### Cursor

Paste the **The Prompt / Instructions** section into a Cursor chat before making your request.

### Codex

Paste the instructions section into the chat along with any source material you want the agent to work from.

## The Prompt / Instructions for the Agent

When asked to write [content type] using this skill, follow these steps:

1. **Understand the input.** Read the [source material — e.g., diff, feature description, changelog]. Identify the key points to communicate.

2. **Define the audience.** Write for [target audience]. Assume they [know/don't know] [technical level]. Use [formal/casual] tone.

3. **Structure the output.** Use this format:
   - **[Section 1 name]:** [What to include]
   - **[Section 2 name]:** [What to include]
   - **[Section 3 name]:** [What to include]

4. **Follow these style rules:**
   - [Rule 1 — e.g., "Keep sentences under 25 words."]
   - [Rule 2 — e.g., "Lead with the most important information."]
   - [Rule 3 — e.g., "Use active voice. Avoid passive constructions."]
   - [Rule 4 — e.g., "No jargon without explanation."]

5. **Length:** [Target length — e.g., "200–400 words", "3–5 bullet points per section", "under 1 tweet (280 chars)"]

6. **Output format:** [Exact format — e.g., "Markdown with H2 headers", "plain text", "JSON with `title` and `body` fields"]

## Example

**Input to Agent:**
> "Use the [Skill Name] skill to write [content] from this [source]:
> [paste sample input here]"

**Output from Agent:**

```
[Paste a realistic sample output here — not a placeholder.
Show exactly what the agent should produce, with real content.]
```

## Notes

- Best results when the input is [specific type of source material].
- If [edge case], tell the agent to [how to handle it].
- This skill is NOT designed for [out-of-scope use case]. Use [alternative skill] instead.
