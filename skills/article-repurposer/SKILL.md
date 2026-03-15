---
name: Article Repurposer
description: "Takes a long-form article and repurposes it into multiple formats: tweet thread, LinkedIn post, TL;DR, and key quotes."
category: writing
tags:
  - content
  - repurposing
  - social-media
  - writing
author: simplyutils
---

# Article Repurposer

## What this skill does

This skill takes a long-form article, blog post, or essay and repurposes it into four ready-to-publish formats: a Twitter/X thread, a LinkedIn post, a TL;DR summary, and a set of pull-quote cards. Each format is written natively for its medium — not just the article copy-pasted with line breaks. The output can be published immediately or used as a starting point for further editing.

Use this to maximize the reach of any long-form content you publish. A single well-written article should produce at least a week's worth of social content.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/article-repurposer/SKILL.md` in your project root.

Then ask:
- *"Use the Article Repurposer skill on this article: [paste article]."*
- *"Repurpose this blog post into social formats using the Article Repurposer skill."*

Provide:
- The full article text (or a link if the agent can fetch URLs)
- Your name or handle for attribution
- Any specific tone preferences (casual, professional, technical, etc.)
- Whether you want all four formats or specific ones

### Cursor

Add the instructions below to your `.cursorrules` or paste them into the Cursor AI pane. Paste the article text.

### Codex

Paste the full article and ask Codex to follow the instructions below to produce all four formats.

## The Prompt / Instructions for the Agent

When asked to repurpose an article, produce all four of these formats. For each one, follow the specific instructions below.

---

### Format 1 — Twitter/X Thread

**Goal**: Turn the article's core argument and key insights into an engaging multi-tweet thread that stands alone — readers shouldn't need to read the article to get value from the thread.

**Structure**:
- **Tweet 1 (hook)**: The most surprising, counterintuitive, or compelling idea from the article. This is the one people retweet. No "In this thread..." preamble. Just the hook.
- **Tweets 2–7 (body)**: One key point per tweet. Each should be a self-contained insight, not a continuation sentence. Use specific numbers, examples, and concrete language.
- **Final tweet (CTA)**: A natural invitation to read the full article. Not "click here" — something that makes the article sound worth reading.

**Rules**:
- Max 280 characters per tweet
- Number each tweet (1/, 2/, etc.)
- Use line breaks within tweets for readability
- No hashtag spam — at most 1–2 relevant hashtags in the last tweet
- Write in first person if attributing to the author
- Avoid jargon unless the audience is deeply technical

---

### Format 2 — LinkedIn Post

**Goal**: A thoughtful, standalone post that works for a professional audience. LinkedIn rewards longer, reflective posts — this isn't a thread, it's a mini-essay.

**Structure**:
- **Opening line (hook)**: A bold statement, a surprising statistic, or a question. This must work as the preview text (before "see more").
- **2–3 paragraphs**: Expand the core insight. Include a personal observation or perspective. LinkedIn posts that feel human perform better than those that feel like press releases.
- **Closing line**: A question or invitation that prompts comments.
- **Article link**: Include as "Full article: [URL]" at the end

**Rules**:
- 150–400 words total
- Use short paragraphs (2–4 sentences max)
- No bullet-point walls — prose reads better on LinkedIn
- Tone: professional but conversational; not stiff corporate language
- 3–5 hashtags at the very end, not embedded in text

---

### Format 3 — TL;DR (Newsletter or Email Snippet)

**Goal**: A 3–5 bullet summary that someone could read in 30 seconds and understand the article's key takeaways. Suitable for a newsletter roundup, Slack message, or email.

**Structure**:
- One-sentence framing: "This article argues that..." or "Key finding: ..."
- 3–5 bullet points, each one a standalone insight
- One-sentence conclusion or recommendation

**Rules**:
- Bullets must be complete sentences, not fragments
- Prioritize surprising or actionable insights over background/context
- Total length: under 100 words

---

### Format 4 — Pull Quotes

**Goal**: Extract 3–5 quotable sentences from the article that would work as standalone graphic quotes (for Twitter image cards, LinkedIn carousels, Instagram, or internal Slack pins).

**Criteria for a good pull quote**:
- Self-contained — makes sense with no context
- Punchy — under 30 words ideally
- Surprising, counterintuitive, or emotionally resonant
- Represents the author's original voice or unique perspective

**Format**: List each quote verbatim from the article, followed by a one-word tone label (Surprising / Motivating / Contrarian / Tactical / Philosophical).

---

### Output structure

Deliver all four formats clearly labeled and separated:

```
## Twitter/X Thread
[tweets numbered 1/ through N/]

---

## LinkedIn Post
[post text]

---

## TL;DR
[summary]

---

## Pull Quotes
1. "[quote]" — Surprising
2. "[quote]" — Tactical
...
```

## Example

**Input to Agent:**
> "Use the Article Repurposer skill on this article excerpt:
>
> **Why Most Developers Ship Bugs They Could Have Caught**
>
> The average developer spends 30% of their time debugging code — but research from Cambridge University found that 70% of those bugs could have been caught at the design stage, before a single line of code was written. The problem isn't that developers are careless. It's that we've trained ourselves to think that thinking is less productive than coding...
>
> [article continues — assume full article provided]"

**Output from Agent:**

> ## Twitter/X Thread
>
> 1/ 70% of bugs could be caught before you write a single line of code.
>
> Most developers skip this step because it feels like "not working."
>
> It's the most expensive mistake in software development. 🧵
>
> 2/ The average developer spends 30% of their time debugging.
>
> That's 12+ hours a week — for a typical 40hr week.
>
> Almost all of it is optional.
>
> 3/ The research is clear: bugs caught at the design stage cost ~10x less to fix than bugs caught in production.
>
> But "design phase" sounds like waterfall. It isn't.
>
> It's just: think before you type.
>
> 4/ The habit that changed how I code:
>
> Before touching a keyboard, write down in plain English:
> — What does this function receive?
> — What does it return?
> — What can go wrong?
>
> Takes 3 minutes. Saves 3 hours.
>
> 5/ Read the full breakdown → [article URL]
>
> ---
>
> ## LinkedIn Post
>
> 70% of the bugs I've fixed in my career were preventable.
>
> Not preventable with better tests. Not preventable with a smarter linter.
>
> Preventable with 3 extra minutes of thinking before writing code.
>
> Cambridge researchers found that bugs caught at the design stage cost roughly 10x less to fix than bugs caught in production. And yet most of us jump straight to the keyboard, because coding feels productive and thinking doesn't.
>
> I spent years doing this. A deadline would hit, I'd write fast, and then spend twice as long debugging the fast code. The speed was an illusion.
>
> The shift that worked for me: before any non-trivial function, I write three things in a comment: what it receives, what it returns, and what can go wrong. That's it. It takes minutes. It surfaces 70% of the edge cases before I have to hunt for them in production at 11pm.
>
> What's your pre-coding ritual? I'm curious what works for other developers.
>
> Full article: [URL]
>
> #softwaredevelopment #programming #engineeringculture
>
> ---
>
> ## TL;DR
>
> Key finding: Most software bugs are introduced before coding starts — and could be prevented with brief upfront design thinking.
>
> - 70% of bugs could be caught at the design stage, per Cambridge research
> - Developers spend 30% of their time debugging — the majority of it avoidably
> - Bugs caught in design cost ~10x less to fix than bugs caught in production
> - Simple habit: write out inputs, outputs, and failure modes before coding any non-trivial function
> - The feeling of "thinking isn't working" is the root cause of most debugging time
>
> ---
>
> ## Pull Quotes
>
> 1. "70% of bugs could be caught before you write a single line of code." — Surprising
> 2. "The speed was an illusion. I'd write fast and spend twice as long debugging the fast code." — Contrarian
> 3. "We've trained ourselves to think that thinking is less productive than coding." — Philosophical

## Notes

- The hook is everything. If the first tweet or the first line of the LinkedIn post doesn't make someone stop scrolling, nothing else matters. Spend extra time on the opening line.
- Each format is a standalone piece — a reader who only sees the thread should get full value without needing to read the article.
- For best results, provide the full article, not just an excerpt. The most shareable insights are often buried in the middle.
