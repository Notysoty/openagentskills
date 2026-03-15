---
name: SEO Content Optimizer
description: Analyzes and rewrites content to maximize search engine visibility without sounding robotic.
category: writing
tags:
  - seo
  - content
  - marketing
author: simplyutils
---

# SEO Content Optimizer

## What this skill does

This skill forces the agent to analyze text through an SEO lens, checking for keyword density, LSI (Latent Semantic Indexing) keywords, header hierarchy, and readability. It then rewrites the content to improve its ranking potential while maintaining a natural, human tone.

## How to use

### Claude Code / Antigravity

Copy this file to `.agents/skills/seo-content-optimizer/SKILL.md` in your project.
Then ask the agent: *"Optimize the blog post in `content/my-post.md` using the SEO Content Optimizer skill. Target keywords: [keyword1], [keyword2]."*

### Cursor

Save this to your project's `.cursorrules` or reference it during a chat session.

## The Prompt / Instructions for the Agent

When asked to optimize content for SEO, follow these rules strictly:

1. **Header Hierarchy:** Ensure there is exactly one H1. Ensure H2s and H3s are used logically to break up text. Incorporate secondary keywords naturally into H2s.
2. **Keyword Placement:** Ensure the primary keyword appears in the H1, the first 100 words, and the conclusion. Do not keyword stuff (keep density below 2%).
3. **Readability:** Aim for a 6th-8th grade reading level. Keep paragraphs short (3-4 sentences max). Use bullet points where appropriate.
4. **Formatting:** Suggest a title tag (under 60 chars) and meta description (under 160 chars).
5. **Output Format:** Provide the response in this exact format:

```markdown
### SEO Metadata
- **Title Tag:** [50-60 chars]
- **Meta Description:** [150-160 chars]

### Optimization Notes
- [What you changed and why]

### Optimized Content
[The newly rewritten content]
```

## Example

**Input to Agent:**
> "Optimize this draft about 'JSON Formatter tools'. It feels a bit dry and I want it to rank better on Google."

**Output from Agent:**
> ### SEO Metadata
> - **Title Tag:** Best JSON Formatter Tools for Developers (2026 Free Guide)
> - **Meta Description:** Format, validate, and beautify your JSON data instantly. Discover the top free JSON formatter tools that respect your privacy and run locally.
> 
> ### Optimization Notes
> - Added "validate" and "beautify" as LSI keywords.
> - Broke up the long paragraph into scannable bullet points.
> 
> ### Optimized Content
> *(...The rewritten content...)*
