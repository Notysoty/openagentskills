---
name: SDK Quickstart Writer
description: Generates a concise, copy-paste-ready quickstart guide for any SDK or library.
category: writing
tags:
  - sdk
  - documentation
  - quickstart
  - onboarding
author: simplyutils
---

# SDK Quickstart Writer

## What this skill does

This skill writes a concise, copy-paste-ready quickstart guide for any SDK or library. It produces a document that gets a developer from zero to their first working API call or feature in under 10 minutes — covering installation, setup, authentication, and a complete working example. The output follows the "get it working first, explain later" philosophy.

Use this when releasing a new SDK, when existing documentation is too verbose or scattered, or when onboarding developers who need a working example before reading the full API reference.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/sdk-quickstart-writer/SKILL.md` in your project root.

Then ask:
- *"Use the SDK Quickstart Writer skill to write a quickstart for our Node.js SDK."*
- *"Write a quickstart guide for developers integrating our REST API using the SDK Quickstart Writer skill."*

Provide:
- The SDK name and language(s)
- Installation command
- Required credentials or API keys
- The most common or important first use case
- Any code samples you already have

### Cursor

Add the instructions below to your `.cursorrules` or paste them into the Cursor AI pane. Provide SDK details and any existing code.

### Codex

Provide the SDK name, the package name, authentication method, and a description of the primary use case. Ask Codex to follow the instructions below.

## The Prompt / Instructions for the Agent

When asked to write an SDK quickstart, follow these steps:

### Step 1 — Understand the SDK

Before writing, confirm you understand:
- **Language / runtime**: Node.js, Python, Go, browser JS, etc.
- **Package name**: What do developers install?
- **Authentication**: API key in header? OAuth? Client ID + secret?
- **Primary use case**: What's the first thing 80% of developers want to do?
- **Base URL / environment**: Any staging vs production distinction?

If this information isn't provided, ask before writing.

### Step 2 — Structure the quickstart

The quickstart must follow this exact structure:

1. **Prerequisites** — What does the developer need before starting? (Node 18+, a free account, an API key)
2. **Installation** — Single command, copy-paste ready
3. **Configuration** — How to provide credentials (environment variable, config file, constructor argument)
4. **Your first call** — A complete, runnable code example that does something meaningful. Not "hello world" — the actual thing they came here to do.
5. **Understanding the response** — Annotate the response object with comments explaining key fields
6. **What to do next** — 3–4 links or topics to explore after the quickstart

### Step 3 — Write the code examples

Code examples must be:
- **Complete and runnable** — copy-paste with only the API key changed
- **Minimal** — no boilerplate, no unrelated setup, no try/catch unless error handling is the point
- **Annotated** — key lines should have a short inline comment explaining what they do
- **Using real-looking data** — use realistic example values, not `foo`, `bar`, `test123`

### Step 4 — Write the surrounding prose

- Keep it short. Each prose section should be 1–3 sentences max.
- Use imperative voice: "Install the package", "Set your API key", "Create a client"
- Don't explain why — that's for the reference docs. Just show what to do.
- Use callout boxes for important notes (authentication, rate limits, required fields)

### Step 5 — Format the quickstart

```markdown
# [SDK Name] Quickstart

Get up and running in under 10 minutes.

## Prerequisites
- [Requirement 1]
- [Requirement 2]
- An API key — [link to where to get one]

## Install

```bash
npm install @yourcompany/sdk
```

## Configure

Set your API key as an environment variable:

```bash
export YOUR_API_KEY=your_key_here
```

> **Never commit your API key to source control.** Use a `.env` file and add it to `.gitignore`.

## Your First Call

[1–2 sentence description of what this example does]

```[language]
[Complete, runnable code example with inline comments]
```

## Understanding the Response

```[language]
{
  "id": "item_123",       // Unique ID for this resource
  "status": "active",     // Current state: "active" | "inactive" | "pending"
  "createdAt": "2026-03-15T10:00:00Z"  // ISO 8601 timestamp
}
```

## Next Steps
- [Link or topic 1]
- [Link or topic 2]
- [Link or topic 3]
```

## Example

**Input to Agent:**
> "Use the SDK Quickstart Writer skill. SDK details:
> - Name: Notify SDK (Node.js)
> - Package: `@notifyhq/node`
> - Auth: API key passed to constructor
> - Primary use case: Send a push notification to a user by their user ID"

**Output from Agent:**

> # Notify Node.js SDK — Quickstart
>
> Get up and running in under 10 minutes.
>
> ## Prerequisites
> - Node.js 18 or higher
> - A Notify account — [sign up free](https://notifyhq.com/signup)
> - An API key from your [Notify dashboard](https://notifyhq.com/dashboard/keys)
>
> ## Install
>
> ```bash
> npm install @notifyhq/node
> ```
>
> ## Configure
>
> ```bash
> export NOTIFY_API_KEY=your_api_key_here
> ```
>
> > **Never commit your API key.** Add `.env` to `.gitignore` and use a package like `dotenv` to load it locally.
>
> ## Your First Call
>
> Send a push notification to a user:
>
> ```js
> import { NotifyClient } from '@notifyhq/node';
>
> // Initialize the client with your API key
> const notify = new NotifyClient(process.env.NOTIFY_API_KEY);
>
> // Send a push notification to a user by their ID
> const result = await notify.push.send({
>   userId: 'user_8a72bc',           // Your app's user identifier
>   title: 'Your order has shipped', // Notification title
>   body: 'Estimated arrival: March 18', // Notification body
> });
>
> console.log(result.id); // => "notif_9f3a12c"
> ```
>
> ## Understanding the Response
>
> ```js
> {
>   "id": "notif_9f3a12c",        // Unique notification ID — use for status lookups
>   "status": "queued",           // "queued" | "delivered" | "failed"
>   "userId": "user_8a72bc",      // The recipient
>   "createdAt": "2026-03-15T10:00:00Z"
> }
> ```
>
> ## Next Steps
> - [Send to multiple users at once](https://docs.notifyhq.com/batch)
> - [Track delivery status with webhooks](https://docs.notifyhq.com/webhooks)
> - [Customize notification channels (email, SMS, push)](https://docs.notifyhq.com/channels)
> - [Full API reference](https://docs.notifyhq.com/api)

## Notes

- The quickstart should be opinionated — show one way to do it, not three. Options belong in the full docs.
- If the SDK supports multiple languages, write a separate quickstart for each — don't try to combine them.
- Real, working code examples are more valuable than any amount of prose. When in doubt, add more code and less text.
