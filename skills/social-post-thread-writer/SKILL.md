---
name: Social Post Thread Writer
description: Converts a blog post, idea, or document into an engaging Twitter/X or LinkedIn thread with hooks and CTAs.
category: writing
tags:
  - social-media
  - twitter
  - linkedin
  - content
  - writing
author: simplyutils
---

# Social Post Thread Writer

## What this skill does

This skill converts any source material — a blog post, a rough idea, a document, a lesson learned, or a list of bullet points — into a polished, engagement-optimized Twitter/X or LinkedIn thread. It writes a strong hook, structures the content for maximum retention, and closes with a clear call to action. The output is ready to post.

Use this to turn any piece of knowledge into a social-first content piece, to build an audience around your expertise, or to share an idea in the format that actually gets read on social platforms.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/social-post-thread-writer/SKILL.md` in your project root.

Then ask:
- *"Use the Social Post Thread Writer skill to turn this blog post into a Twitter thread: [paste content]."*
- *"Write a LinkedIn thread about this idea using the Social Post Thread Writer skill: [describe idea]."*

Provide:
- The source material (blog post, bullets, idea description, document)
- The target platform: Twitter/X or LinkedIn (or both)
- Your name or handle (for attribution if needed)
- Tone preferences: professional, casual, technical, storytelling
- Optional: a specific angle or point you want to emphasize

### Cursor

Add the instructions below to your `.cursorrules` or paste them into the Cursor AI pane. Provide the source material and platform.

### Codex

Paste the source material with the target platform specified. Ask Codex to follow the instructions below.

## The Prompt / Instructions for the Agent

When asked to write a social thread, apply these instructions based on the platform:

---

### For Twitter/X Threads

#### Structure

**Tweet 1 — The Hook**
This is the most important tweet. It must make someone stop scrolling. Use one of these proven hook formulas:
- **The counterintuitive claim**: "The advice everyone gives about X is wrong."
- **The surprising number**: "I spent 2 years building X. Here's what I learned that nobody told me."
- **The promise**: "Here's how to [outcome] in [short timeframe/simple steps]."
- **The bold statement**: State the most controversial or surprising insight from the whole thread in one sentence.

Never start with "In this thread, I'll..." — it buries the hook. Start with the hook itself.

**Tweets 2–N — The Body**
Each tweet is a standalone unit of value. Follow this pattern:
- One insight or point per tweet
- Lead with the point, then support it (not the other way around)
- Use concrete examples, numbers, or stories — not abstract generalities
- Short sentences. Numbered points within a tweet are fine (1. 2. 3.) but don't overuse them
- Leave the reader wanting the next tweet — end with a natural "because..." or "here's the thing:"

**Final tweet — CTA**
Don't end with "Thanks for reading." Give the reader something:
- A link to the full article
- A question to answer in the replies
- A follow prompt: "Follow me for more on [topic]"
- A retweet ask if the content is genuinely shareable

#### Formatting rules
- Max 280 characters per tweet (count carefully)
- Number each tweet: `1/`, `2/`, etc.
- Use blank lines within tweets for visual breathing room
- Emojis are optional — use sparingly if the tone calls for it, not as decoration
- Hashtags: 0–2 in the last tweet only; never mid-thread

---

### For LinkedIn Threads / Carousel-style Posts

LinkedIn doesn't have native threads, but long-form posts with clear structure (line breaks, short paragraphs, occasional bold) perform well. Write for this format:

#### Structure

**Opening (2–3 lines)**
The hook. Must work as the preview text before "See more." The first line should create curiosity, tension, or a compelling claim. Don't bury the lead.

**Body (3–5 short sections)**
Each section: a sub-point or step, written as a short paragraph (2–4 sentences). Use white space generously — walls of text get skipped.

Optional: Use bold sparingly for the most important phrase in each section.

**Closing**
End with a question or reflection that invites comments. LinkedIn's algorithm rewards comment engagement heavily.

**Footer**
- Link to the full article or resource if applicable
- 3–5 hashtags (on their own line at the end)

#### Tone for LinkedIn
More reflective and personal than Twitter. LinkedIn rewards vulnerability and lessons-learned framing. "I used to think X. Here's what changed my mind." performs better than pure listicles.

---

### Content principles (both platforms)

- **Specificity beats generality**: "I reduced my bug count by 40% using this one technique" > "this technique will make you a better developer"
- **Show, don't tell**: Instead of "it's very important", show why with a concrete example
- **Cut ruthlessly**: Every sentence that doesn't add value to the reader should be deleted
- **Native format**: Write for how people read social media (fast, scanning, on mobile) — not how they read articles

---

### Output format

```
## Twitter/X Thread — [Working title]

1/ [Hook tweet]

2/ [Body tweet]

...

N/ [CTA tweet]

---

## LinkedIn Post — [Working title]

[Full LinkedIn post text]
```

If only one platform was requested, produce only that format.

## Example

**Input to Agent:**
> "Use the Social Post Thread Writer skill. Platform: Twitter/X. Tone: casual but thoughtful.
>
> Source idea: I've noticed that most developers who say they don't have time to write documentation actually spend 3x more time answering the same questions in Slack over and over. Writing a 1-page doc once would save hours every month. The problem is that writing docs doesn't feel productive while you're doing it — it feels like a distraction. But answering Slack messages also doesn't feel unproductive, even though it's the same information repeated."

**Output from Agent:**

> ## Twitter/X Thread — The hidden cost of skipping documentation
>
> 1/ Every developer who says "I don't have time to write docs"
> is spending 3x more time answering the same Slack messages.
>
> The math is brutal. Here's why.
>
> 2/ A 1-page doc takes maybe 45 minutes to write.
>
> A Slack DM takes 5 minutes.
>
> Sounds like Slack wins.
>
> But that 5-minute message gets sent to 8 different people.
> Over 6 months.
>
> That's 4+ hours. Gone.
>
> 3/ The reason we keep choosing Slack?
>
> Writing docs feels like a distraction.
> Answering messages feels like helping.
>
> Same information. Completely different emotional signal.
>
> 4/ The reframe that worked for me:
>
> A doc isn't documentation.
>
> It's a tool that answers a question for every future person who has it —
> including future me at 11pm before a deadline.
>
> 5/ The 3-question test for "should I write a doc?":
>
> 1. Have I answered this question more than twice?
> 2. Will I need to answer it again in 6 months?
> 3. Could a new team member find the answer without asking?
>
> If yes → write the doc. Now.
>
> 6/ The goal isn't documentation.
>
> It's buying back your time in 5-minute increments, forever.
>
> What's the one question you answer on repeat that you should just document already?

## Notes

- The hook is worth rewriting 3–5 times. The first draft is rarely the best version. Ask the agent for 3 alternative hooks if the first one doesn't feel strong enough.
- For Twitter, read the thread out loud. If any tweet sounds stilted or unnatural, rewrite it.
- LinkedIn posts with a question at the end consistently get more comments than those that end with a statement. This matters for reach.
