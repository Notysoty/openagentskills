---
name: Blog Outline Generator
description: Generates a detailed, SEO-optimized blog post outline with H2/H3 structure, key points per section, and a hook.
category: writing
tags:
  - blog
  - writing
  - content
  - seo
  - outline
author: simplyutils
---

# Blog Outline Generator

## What this skill does

This skill produces a complete, ready-to-write blog post outline for any topic. Given a subject and target audience, it generates multiple title options, a meta description, an intro hook angle, 5–7 H2 sections with H3 sub-points under each, a CTA suggestion, and internal link opportunities. The output is structured to satisfy SEO requirements while giving a writer a clear narrative arc to follow.

Use this before writing any long-form blog post. A strong outline cuts writing time in half and ensures the post is complete, well-structured, and optimized for the primary keyword before you write a single sentence.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/blog-outline-generator/SKILL.md` in your project root.

Then ask:
- *"Use the Blog Outline Generator skill to outline a post about TypeScript generics for beginner developers."*
- *"Generate a blog outline for 'best practices for React performance' using the Blog Outline Generator skill."*

Provide the topic, primary keyword, target audience, and approximate word count target if you have them.

### Cursor

Add the "Prompt / Instructions" section to your `.cursorrules` file. Describe the blog topic in the chat.

### Codex

Describe the blog topic, target audience, and primary keyword you want to rank for. Include the instructions below.

## The Prompt / Instructions for the Agent

When asked to generate a blog outline, follow these steps:

1. **Clarify the parameters** (use what's provided; ask only if critical information is missing):
   - **Topic:** What the post is about
   - **Primary keyword:** The main search term to rank for (e.g., "react performance optimization")
   - **Target audience:** Who will read this (e.g., "junior developers", "marketing managers", "startup founders")
   - **Tone:** Conversational, technical, authoritative, beginner-friendly
   - **Word count target:** Short (~800 words), standard (~1500 words), comprehensive (~2500+ words)

2. **Generate 3 title options.** Each title should:
   - Include the primary keyword naturally
   - Be 50–65 characters for SEO
   - Use a different angle: one numbered list format ("7 Ways to..."), one how-to format ("How to..."), one question or bold claim format
   - Be compelling enough to earn a click

3. **Write a meta description** (150–160 characters):
   - Include the primary keyword
   - Be action-oriented — promise a specific benefit
   - Do not start with the article title
   - End with a subtle CTA ("Learn how", "Find out", "Start here")

4. **Design the intro hook.** Suggest one of these proven hook angles:
   - **Pain point opener:** Start with the frustration the reader has right now
   - **Statistic opener:** A surprising or counterintuitive data point
   - **Story opener:** A brief relatable scenario
   - **Contrarian opener:** Challenge a common assumption
   - **Question opener:** A question the reader is already asking

   Write 2–3 sentences for the suggested hook.

5. **Create 5–7 H2 sections** that form a logical narrative arc:
   - The first H2 should establish context or define the problem
   - Middle H2s should deliver the main value (tactics, explanations, examples)
   - The penultimate H2 should address objections, mistakes, or caveats
   - The final H2 should be a conclusion or next steps section
   - Each H2 should include 2–4 H3 sub-points with 1-sentence descriptions of what each covers
   - H2 headings should include secondary keywords or related terms naturally

6. **Suggest a CTA** for the post conclusion:
   - What should the reader do after reading? (subscribe, download, try a tool, leave a comment, share)
   - Write the CTA as a one-sentence prompt

7. **List 3–5 internal link opportunities:**
   - Suggest related topics the site might cover that could be linked from this post
   - Format as: "In Section X, mention [topic] — link to a post about [related topic]"

8. **Output format:**

```markdown
## Blog Post Outline: [TOPIC]

### Keyword & Audience
- **Primary keyword:** [keyword]
- **Target audience:** [audience]
- **Tone:** [tone]
- **Target length:** [word count]

---

### Title Options
1. [Title option 1] *(XX chars)*
2. [Title option 2] *(XX chars)*
3. [Title option 3] *(XX chars)*

### Meta Description
[150–160 character meta description]

---

### Intro Hook
**Angle:** [Hook type]
[2–3 sentence hook]

---

### Outline

**H1:** [Chosen or recommended title]

**H2: [Section 1 title]**
- H3: [Sub-point] — [1-sentence description]
- H3: [Sub-point] — [1-sentence description]

**H2: [Section 2 title]**
- H3: ...
...

---

### CTA Suggestion
[One-sentence CTA]

### Internal Link Opportunities
- In "[Section]", mention [topic] → link to a post about [related topic]
...
```

## Example

**Input to Agent:**
> "Use the Blog Outline Generator skill. Topic: how to do code reviews effectively. Primary keyword: 'code review best practices'. Audience: mid-level software engineers. Tone: practical and direct. Target: ~1500 words."

**Output from Agent:**
> ## Blog Post Outline: Code Review Best Practices
>
> ### Keyword & Audience
> - **Primary keyword:** code review best practices
> - **Target audience:** mid-level software engineers
> - **Tone:** Practical and direct
> - **Target length:** ~1500 words
>
> ---
>
> ### Title Options
> 1. 10 Code Review Best Practices That Actually Improve Your Team *(62 chars)*
> 2. How to Do Code Reviews That Don't Waste Everyone's Time *(56 chars)*
> 3. Are Your Code Reviews Hurting Your Team? Here's How to Fix Them *(64 chars)*
>
> ### Meta Description
> Learn code review best practices that speed up merges, reduce bugs, and build team trust — without turning reviews into a chore. Start here.
>
> ---
>
> ### Intro Hook
> **Angle:** Pain point opener
> You've left a pull request open for three days. The reviewer left 47 comments, half of them about formatting. The author rewrote half the file. And somehow the bug you both missed shipped to production anyway. Code reviews don't have to work this way.
>
> ---
>
> ### Outline
>
> **H1:** 10 Code Review Best Practices That Actually Improve Your Team
>
> **H2: Why Most Code Reviews Fail (And What They Should Actually Do)**
> - H3: The two jobs of a code review — Distinguish between catching bugs and sharing knowledge; most teams only do one.
> - H3: The review anti-patterns killing your team's velocity — Cover the most common failure modes: nitpick spirals, rubber-stamping, and review hoarding.
>
> **H2: Before You Open the PR — Set Reviews Up for Success**
> - H3: Keep PRs small and focused — Explain the research behind PR size and review quality.
> - H3: Write a useful PR description — What to include so reviewers understand the "why" without reading every line.
> - H3: Self-review before requesting — The fast mental checklist authors should run before tagging someone.
>
> **H2: How to Give Feedback That Actually Gets Acted On**
> - H3: The difference between blocking and non-blocking comments — Introduce the `nit:` / `blocking:` / `question:` prefix convention.
> - H3: Explain the "why," not just the "what" — How to write comments that teach, not just criticize.
> - H3: Ask questions instead of making demands — Reframe feedback as curiosity to reduce defensiveness.
>
> **H2: How to Receive a Review Without Getting Defensive**
> - H3: Separate yourself from your code — Practical reframe for taking feedback professionally.
> - H3: Responding to comments efficiently — The "resolve vs. reply vs. push back" decision framework.
>
> **H2: Automate the Boring Parts**
> - H3: What linters, formatters, and CI should catch — Free your reviewers for logic, not style.
> - H3: The tools worth setting up (ESLint, Prettier, GitHub Actions) — Quick practical list.
>
> **H2: Common Code Review Mistakes (And How to Avoid Them)**
> - H3: Reviewing for too long — Why diminishing returns kick in after 60 minutes.
> - H3: Approving without reading — The "LGTM" problem and how to prevent it culturally.
> - H3: Making it personal — Red flags in review culture and how to course-correct.
>
> **H2: Building a Code Review Culture Your Team Actually Respects**
> - H3: Set team norms explicitly — How to run a 30-minute team session to agree on review standards.
> - H3: Track review time as a metric — Why treating review latency as a team health metric changes behavior.
>
> ---
>
> ### CTA Suggestion
> Share this with your team and pick one practice to try in your next sprint — even one change can cut your average PR merge time significantly.
>
> ### Internal Link Opportunities
> - In "Automate the Boring Parts," mention CI/CD → link to a post about setting up GitHub Actions
> - In "Keep PRs Small," mention git branching → link to a post about Git branching strategies
> - In the intro, mention debugging → link to a post about debugging techniques
