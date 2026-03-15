---
name: Technical Blog Post Writer
description: Writes engaging, accurate technical blog posts targeted at developer audiences.
category: writing
tags:
  - writing
  - blog
  - technical-writing
  - content
author: simplyutils
---

# Technical Blog Post Writer

## What this skill does

This skill directs the agent to write a complete technical blog post on a given topic — from a strong hook through to a practical conclusion — targeting a developer audience. It produces content that is technically accurate, conversational without being sloppy, and structured for both skim-readers and deep-readers. It also outputs an SEO title and meta description.

Use this when you need to publish a tutorial, an opinion piece, a launch announcement, or a "how we solved X" post on your engineering blog.

## How to use

### Claude Code / Antigravity

Copy this file to `.agents/skills/tech-blog-writer/SKILL.md` in your project root.

Then ask:
- *"Write a blog post about how we migrated from REST to GraphQL using the Technical Blog Post Writer skill."*
- *"Use the Technical Blog Post Writer skill to write a tutorial on using React Query for server state management."*

Provide:
- The topic or title idea
- The target audience (junior devs, senior backend engineers, general developer audience, etc.)
- The tone (opinionated/personal vs neutral/tutorial-style)
- Any key points, code snippets, or conclusions you want included
- Target length if you have a preference (default: 800-1200 words)

### Cursor / Codex

Paste the instructions below into your session along with your topic brief.

## The Prompt / Instructions for the Agent

When asked to write a technical blog post, follow these steps:

### 1. Plan before writing

Before drafting, identify:
- **The problem** the post addresses (developers reading this have this pain point)
- **The insight** or solution the post delivers
- **The reader's takeaway** — what can they do differently after reading?
- **The assumed skill level** — calibrate vocabulary and explanation depth accordingly

### 2. Structure the post

Every post must follow this structure:

**Hook (first 2-3 sentences)**
Open with a relatable scenario, a surprising stat, or a bold claim. Do NOT open with "In this post, I will...". Do NOT open with a definition ("Docker is a containerization platform..."). Make the reader feel the problem before you name it.

**The Problem (1-2 paragraphs)**
Describe the situation that led to needing this solution. Be specific. Use concrete numbers and scenarios, not vague abstractions.

**The Solution / Tutorial body**
The core content. For tutorials:
- Use numbered steps for sequential processes
- Use H2 headers for major sections, H3 for sub-sections
- Include code blocks with the correct language tag (```typescript, ```bash, etc.)
- Explain *why* before *how* — readers skip the "why" but they remember it
- Keep code examples minimal but complete enough to run

For opinion/analysis posts:
- Make a clear claim
- Support it with evidence (benchmarks, examples, experience)
- Acknowledge counterarguments briefly

**Conclusion (1 paragraph)**
Summarize the key takeaway in one sentence. Tell the reader what to do next (try it, read this other post, open a GitHub issue, etc.).

### 3. Tone rules

- Write how a senior developer would talk to a junior colleague over Slack — friendly, direct, no corporate buzzwords
- Use "you" to address the reader
- Use contractions naturally ("you'll", "it's", "don't")
- Avoid: "leverage", "utilize", "seamlessly", "robust solution", "in conclusion, it is evident that"
- Short paragraphs (3-4 sentences max for body text)
- Use bullet points for lists of 3+ items, not inline commas

### 4. Code examples

- Show real, runnable code (not pseudocode unless the concept genuinely requires it)
- Include comments in code blocks to explain non-obvious lines
- When comparing before/after, show both blocks clearly labeled
- Do not show code that would require the reader to fill in 10 imports to run

### 5. Output format

```markdown
---
title: [SEO-optimized title, 50-65 characters]
meta_description: [150-160 character description including the primary keyword]
---

# [Post Title]

[Post body in markdown]
```

After the post, add a short "Editorial notes" block (not part of the published post):
```
## Editorial Notes
- Primary keyword: [keyword]
- Suggested tags: [tag1, tag2, tag3]
- Estimated reading time: [X min]
- Suggested internal links: [topics to link to]
```

## Example

**Input to Agent:**
> "Use the Technical Blog Post Writer skill to write a post about using environment variables correctly in Node.js. Target: junior to mid-level Node.js developers. Tone: tutorial-style. Key points: dotenv, never commit .env, process.env validation with zod. ~800 words."

**Output from Agent:**

```markdown
---
title: How to Manage Environment Variables in Node.js the Right Way
meta_description: Learn how to use dotenv, validate env vars with Zod, and avoid the mistakes that expose secrets in Node.js projects.
---

# How to Manage Environment Variables in Node.js the Right Way

You've seen it in a GitHub commit history: `remove API key oops`. Someone hardcoded a secret,
pushed it, and then panicked. It's more common than anyone admits.

Environment variables are how you keep secrets out of your codebase — but there's a right way
and a wrong way to use them. Here's how to get it right from the start.

## The basics: dotenv

...
```

## Notes

- If you have a specific code example you want included, paste it when making the request. The agent will incorporate it naturally rather than inventing a different example.
- The skill writes a first draft. Technical accuracy of any code examples should be verified by the author before publishing.
- For posts involving benchmarks or specific version numbers, provide those numbers explicitly — the agent should not invent them.
- If the post is about a proprietary internal system, give the agent enough context about what the system does so it can write accurately without access to your codebase.
