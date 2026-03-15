---
name: Architecture Explainer
description: Reads a codebase or system description and produces a clear, structured architecture overview with diagrams.
category: coding
tags:
  - architecture
  - documentation
  - system-design
author: simplyutils
---

# Architecture Explainer

## What this skill does

This skill directs the agent to explore a codebase or system description and produce a clear, structured architecture overview. It maps out layers, major components, data flows, and external dependencies, then renders ASCII diagrams showing how the pieces connect. The result is a document a new engineer could read in 10 minutes and understand how the system works.

Use this when onboarding new team members, preparing for an architecture review, creating documentation for a system you inherited, or clarifying your own mental model before a large refactor.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/architecture-explainer/SKILL.md` in your project root.

Then ask:
- *"Use the Architecture Explainer skill to document this entire repo."*
- *"Explain the architecture of the `server/` directory using the Architecture Explainer skill."*
- *"I'll describe our system. Use the Architecture Explainer skill to turn it into a structured overview."*

### Cursor

Add the instructions below to your `.cursorrules` or paste them into the Cursor AI pane before asking for the architecture overview.

### Codex

Provide a directory listing or paste key files and ask Codex to follow the instructions below to produce the architecture document.

## The Prompt / Instructions for the Agent

When asked to explain or document an architecture, follow these steps:

### Step 1 — Explore the codebase

Start by reading:
1. The root directory listing
2. `package.json`, `pyproject.toml`, `go.mod`, or the equivalent dependency manifest
3. Entry point files (e.g., `main.ts`, `index.ts`, `app.py`, `cmd/main.go`)
4. Top-level directory names and their `index` or `README` files if present
5. Any existing architecture or design docs

Do not read every file. Use the directory structure and entry points to infer the layering.

### Step 2 — Identify the major components

Extract:
- **Layers**: presentation, business logic, data access, infrastructure
- **Services or modules**: each significant unit of functionality
- **External dependencies**: databases, caches, third-party APIs, message queues
- **Entry points**: HTTP routes, CLI commands, event listeners, cron jobs
- **Shared utilities**: auth, logging, config, error handling

### Step 3 — Map the data flow

For the most important 2–3 user-facing operations, trace:
- Where the request enters the system
- Which layers or modules it passes through
- What data is read or written and where
- Where the response is assembled and returned

### Step 4 — Produce the architecture document

Format the output as follows:

```markdown
# Architecture Overview — [Project Name]

## System Summary
[2–3 sentences. What does this system do? What are the key technical choices (language, framework, DB)?]

## Layer Diagram

[ASCII diagram showing the main layers top-to-bottom, e.g.:]

┌─────────────────────────────────┐
│         Client / Browser        │
└────────────────┬────────────────┘
                 │ HTTP / REST
┌────────────────▼────────────────┐
│        Express API Server       │
│  routes/ → controllers/ → ...   │
└──────┬─────────────┬────────────┘
       │             │
┌──────▼──────┐ ┌────▼────────────┐
│  PostgreSQL  │ │  Redis Cache    │
└─────────────┘ └─────────────────┘

## Component Breakdown

### [Component Name]
- **Location**: `src/payments/`
- **Responsibility**: [1–2 sentences]
- **Depends on**: [List of other components or external services]
- **Depended on by**: [Who calls this]

[Repeat for each major component]

## Key Data Flows

### [Flow name, e.g., "User places an order"]
1. Request arrives at `POST /api/orders`
2. `OrderController` validates the request body
3. `OrderService` runs business logic and calls `PaymentService`
4. `PaymentService` calls Stripe API
5. On success, `OrderRepository` writes to `orders` table
6. Response returned to client

[Repeat for 2–3 key flows]

## External Dependencies

| Dependency | Purpose | Where integrated |
|------------|---------|-----------------|
| PostgreSQL | Primary data store | `server/db/` |
| Redis | Session cache | `server/cache/` |
| Stripe | Payment processing | `server/services/payment.ts` |

## What is NOT covered here
[Note any parts of the system this document doesn't address, e.g., "Worker queue jobs not documented"]
```

### Step 5 — Validate your understanding

After writing the document, re-read the entry point files and check that every major path through the system is accounted for. If something doesn't fit your model, revise the model — don't ignore the discrepancy.

## Example

**Input to Agent:**
> "Use the Architecture Explainer skill on this repo. Here's the directory tree:
> ```
> src/
>   api/routes/
>   api/controllers/
>   services/
>   db/repositories/
>   workers/
> client/
>   pages/
>   components/
> ```"

**Output from Agent:**

> # Architecture Overview — MyApp
>
> ## System Summary
> MyApp is a full-stack web application built with Node.js/Express on the backend and React on the frontend. It uses PostgreSQL for persistence and background workers for async processing.
>
> ## Layer Diagram
>
> ```
> ┌──────────────────────────┐
> │   React Client (client/) │
> └────────────┬─────────────┘
>              │ HTTP/JSON
> ┌────────────▼─────────────┐
> │ Express API (src/api/)   │
> │  routes/ → controllers/  │
> └──────┬───────────────────┘
>        │
> ┌──────▼───────────────────┐
> │ Services (src/services/) │
> └──────┬───────────────────┘
>        │
> ┌──────▼───────────────────┐  ┌──────────────────┐
> │ Repositories (src/db/)   │  │ Workers           │
> └──────┬───────────────────┘  │ (src/workers/)    │
>        │                      └──────────────────┘
> ┌──────▼───────────────────┐
> │       PostgreSQL         │
> └──────────────────────────┘
> ```
>
> ## Component Breakdown
>
> ### API Routes
> - **Location**: `src/api/routes/`
> - **Responsibility**: Maps HTTP methods and paths to controller functions
> - **Depends on**: Controllers
>
> ### Services
> - **Location**: `src/services/`
> - **Responsibility**: Contains all business logic; orchestrates calls between repositories and external APIs
> - **Depends on**: Repositories, external APIs
> - **Depended on by**: Controllers, Workers

## Notes

- For very large repos, ask the agent to focus on one service or one top-level directory at a time.
- If you have an existing architecture doc, paste it in and ask the agent to update it rather than writing from scratch.
- ASCII diagrams can be copied into tools like Mermaid or draw.io for polish.
