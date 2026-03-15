---
name: Newsletter Summary Writer
description: Condenses long articles, threads, or documents into concise, engaging newsletter-ready summaries.
category: writing
tags:
  - newsletter
  - writing
  - summarization
  - content
author: simplyutils
---

# Newsletter Summary Writer

## What this skill does

This skill takes any source content — a long article, a Twitter/X thread, a research paper, a podcast transcript, a blog post, or a document — and condenses it into a polished, newsletter-ready summary under 200 words. The output includes a punchy hook, scannable key takeaways, and a "Why it matters" closing line that gives readers a reason to care.

Use this when curating content for a weekly newsletter, a team digest, a Slack summary post, or any context where you need to surface the key ideas from something long without making people read the whole thing.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/newsletter-summary-writer/SKILL.md` in your project root.

Then paste the source content and ask:
- *"Use the Newsletter Summary Writer skill to summarize this article."*
- *"Summarize this research paper for my weekly dev newsletter using the Newsletter Summary Writer skill."*

You can also specify tone (casual, professional, technical) and the newsletter's audience if you want the output tailored.

### Cursor

Add the "Prompt / Instructions" section to your `.cursorrules` file. Paste the source content into the chat and ask for a newsletter summary.

### Codex

Paste the full source content (or a URL if Codex can access it) along with the instructions below. Specify word count if you need something shorter or longer than the 200-word default.

## The Prompt / Instructions for the Agent

When asked to write a newsletter summary, follow these steps:

1. **Read the full source content.** Do not skim — identify:
   - The central argument or finding
   - The most surprising, counterintuitive, or valuable insight
   - Supporting evidence, data, or examples worth mentioning
   - The author's conclusion or recommendation
   - Any caveats, limitations, or opposing views worth noting

2. **Extract 3–5 key takeaways.** Each takeaway must:
   - Express one complete idea in one sentence
   - Be concrete — no vague claims like "this is interesting" or "this matters"
   - Stand alone: a reader who only reads the bullets should understand the substance
   - Start with a strong verb or noun (avoid starting with "The article says..." or "According to...")

3. **Write a 2–3 sentence hook.** The hook should:
   - Open with the most interesting or surprising thing about the content
   - Create enough tension or curiosity that the reader wants to know more
   - Not start with "In this article..." or "The author discusses..."
   - Be conversational — write as if you're telling a smart friend about something fascinating

4. **Write a "Why it matters" line** (1 sentence):
   - Answer the reader's implicit question: "So what? Why should I care about this?"
   - Connect the content to a broader trend, a practical implication, or a decision the reader might face
   - Make it specific to the newsletter's audience if that information is provided

5. **Assemble the summary:**
   - Hook (2–3 sentences)
   - Key takeaways (bullet list, 3–5 items)
   - "Why it matters" line

6. **Check total length.** The default target is under 200 words. If the user specifies a different length, honor it. Cut from the takeaways first, then tighten the hook.

7. **Match the tone** to the audience:
   - **Technical/dev audience:** Use correct terminology, respect the reader's expertise, don't over-explain basics
   - **Business/executive audience:** Lead with impact and decisions, skip implementation details
   - **General audience:** Plain language, no jargon, use analogies where helpful
   - **Casual newsletter:** Conversational, light humor allowed, contractions welcome

8. **Output format:**

```
[Hook paragraph — 2–3 sentences]

**Key takeaways:**
- [Takeaway 1]
- [Takeaway 2]
- [Takeaway 3]
- [Takeaway 4 — if applicable]
- [Takeaway 5 — if applicable]

**Why it matters:** [One sentence]
```

Do not add a title, author name, or source link — the newsletter curator will add those. Just output the summary block.

## Example

**Input to Agent:**
> "Use the Newsletter Summary Writer skill on this article. Audience: software engineering managers.
>
> [Long article about a study showing that developers who write tests first (TDD) ship 40% fewer bugs in production but take 15–35% longer in the short term, with the time cost disappearing after 6 months as the codebase matures. The study tracked 24 teams over 18 months. Teams using TDD had significantly lower onboarding time for new engineers and reported higher code confidence. The main barrier to adoption was manager pressure to ship fast in early sprints.]"

**Output from Agent:**
> A new 18-month study of 24 software teams just put a number on the TDD debate: 40% fewer production bugs, at a short-term cost of 15–35% slower delivery. The catch? That speed penalty disappears entirely after about 6 months — and your new engineers will thank you for it.
>
> **Key takeaways:**
> - Teams practicing TDD shipped 40% fewer production bugs over the 18-month study period
> - The short-term speed cost (15–35% slower) fully recovered within 6 months as the codebase matured
> - TDD teams had measurably faster onboarding for new engineers due to better-documented behavior
> - Developer confidence in making changes was significantly higher on TDD teams
> - The biggest barrier to adoption was manager pressure to ship fast in early sprints — not developer resistance
>
> **Why it matters:** If you're managing a team building something that will still exist in a year, the data now suggests TDD is a performance investment, not a slowdown — but only if you protect the first 6 months.
