---
name: Auth Flow Planner
description: Designs a secure authentication and authorization flow for any application, covering login, sessions, roles, and edge cases.
category: coding
tags:
  - auth
  - security
  - backend
  - jwt
  - oauth
author: simplyutils
---

# Auth Flow Planner

## What this skill does

This skill designs a complete authentication and authorization flow for any application. It covers the full lifecycle: registration, login, session management, token refresh, password reset, role-based access control, and all the edge cases (expired tokens, concurrent sessions, brute force protection). The output is a detailed design document with flow diagrams, endpoint definitions, data models, and security considerations — ready to hand off to engineering.

Use this when starting a new application, when auditing an existing auth system, or when extending your auth with new features (OAuth, MFA, roles).

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/auth-flow-planner/SKILL.md` in your project root.

Then ask:
- *"Use the Auth Flow Planner skill to design auth for our SaaS app."*
- *"Plan the authentication system for a multi-tenant API using the Auth Flow Planner skill."*

Provide context about:
- Application type (web app, mobile app, API-only, SaaS)
- User types (end users, admins, API consumers)
- Required features (social login, MFA, teams/orgs, API keys)
- Tech stack (language, framework, existing auth libraries)
- Compliance requirements if any (HIPAA, SOC2, GDPR)

### Cursor

Add the instructions below to your `.cursorrules` or paste them into the Cursor AI pane with your application context.

### Codex

Provide the application context and ask Codex to follow the instructions below to produce the auth design.

## The Prompt / Instructions for the Agent

When asked to plan an authentication flow, follow these steps:

### Step 1 — Understand requirements

Gather:
- What user types need to authenticate?
- What needs to be protected (API routes, pages, data scopes)?
- What auth methods are needed (email/password, OAuth, magic link, API key, MFA)?
- What session approach: stateless JWT, stateful sessions (DB/Redis), or both?
- Are there multiple roles or permission levels?
- Are there multi-tenant concerns (organizations, workspaces)?

If any of this is unclear, state your assumptions and proceed.

### Step 2 — Choose and justify the session strategy

Recommend one of:

**Stateless JWT** — Good for: API-only services, microservices, when you can't or don't want to maintain session state.
- Access token: short-lived (15 min), stored in memory (web) or secure storage (mobile)
- Refresh token: longer-lived (7–30 days), stored in HttpOnly cookie (web) or secure storage (mobile)
- Revocation requires a blocklist for the refresh token

**Stateful sessions (server-side)** — Good for: traditional web apps, when you need instant revocation, when security > scalability.
- Session ID in HttpOnly cookie
- Session data stored in DB or Redis
- Easy to revoke; requires session store

**Hybrid (recommended for most SaaS)** — Short-lived JWT for requests, refresh token stored in session table for revocation control.

### Step 3 — Design each flow

For each of the following flows, produce:
- A numbered step-by-step description
- The HTTP endpoints involved (method, path, request body, response)
- What is stored and where
- Security considerations

**Required flows to cover:**
1. User registration
2. Email verification
3. Login (email/password)
4. Authenticated request (how the access token is validated)
5. Token refresh
6. Logout
7. Password reset request
8. Password reset completion
9. OAuth login (if applicable)
10. API key authentication (if applicable)

### Step 4 — Design the RBAC model

If roles are required:
- Define the roles and what each can do
- Where role is stored (user record, JWT claim, permission table)
- How authorization checks are applied (middleware, policy layer, row-level)

### Step 5 — Security checklist

For every flow, verify these protections are designed in:

**Brute force protection**
- Rate limit login attempts per IP (e.g., 5 attempts per 15 minutes)
- Rate limit password reset requests per email

**Token security**
- Access tokens expire quickly (15 minutes recommended)
- Refresh tokens are one-time-use (rotation) or carefully protected
- Tokens are never stored in localStorage (XSS risk)
- Refresh tokens in HttpOnly, Secure, SameSite=Strict cookies

**CSRF protection**
- If using cookies for session/refresh token: require CSRF token or use SameSite=Strict

**Password storage**
- bcrypt, scrypt, or Argon2 — never MD5/SHA1/unsalted hashes
- Minimum cost factor appropriate for the hardware

**Session fixation**
- Issue a new session ID / refresh token after each login

**Sensitive operations**
- Re-authentication required for: changing email, changing password, deleting account, viewing billing info

### Step 6 — Format the output

```markdown
# Auth Flow Design — [Application Name]

## Strategy Summary
[2–3 sentences on chosen session approach and why]

## User Roles
| Role | Permissions |
|------|-------------|
| [Role] | [What they can do] |

## Flows

### [Flow Name]
**Purpose**: [What this flow achieves]

**Steps**:
1. [Step 1]
2. [Step 2]
...

**Endpoints**:
- `POST /api/auth/[action]` — Request: `{ field }` — Response: `{ field }`

**Security notes**: [Any specific considerations]

---

[Repeat for each flow]

## Data Models

### users table
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| email | text | Unique, indexed |
| password_hash | text | bcrypt |
| ...

### sessions / refresh_tokens table
[If stateful]

## Security Checklist
- [ ] Rate limiting on login endpoint
- [ ] Refresh token rotation
- [ ] HttpOnly cookies for refresh token
- [ ] CSRF protection
- [ ] bcrypt for password hashing
- [ ] Re-auth for sensitive operations
```

## Example

**Input to Agent:**
> "Use the Auth Flow Planner skill. Building a SaaS web app with: email/password login, Google OAuth, two roles (admin and member), Node.js/Express backend, React frontend. No MFA for now. Users belong to organizations."

**Output from Agent:**

> # Auth Flow Design — SaaS App
>
> ## Strategy Summary
> Hybrid approach: short-lived JWTs (15 min) for authenticated requests, with refresh tokens stored in a database table and delivered via HttpOnly cookie. This allows instant revocation (important for deactivating team members) while keeping request validation stateless.
>
> ## User Roles
>
> | Role | Permissions |
> |------|-------------|
> | Owner | Full access to org settings, billing, member management, all features |
> | Admin | Manage members, all features, no billing access |
> | Member | Access to product features, no admin settings |
>
> ## Flows
>
> ### 1. Registration (Email/Password)
>
> **Steps**:
> 1. User submits email + password via `POST /api/auth/register`
> 2. Server validates: email format, password strength (min 8 chars), email not already registered
> 3. Hash password with bcrypt (cost factor 12)
> 4. Create `users` record with `email_verified: false`
> 5. Create initial `organizations` record, set user as Owner
> 6. Send verification email with a signed token (valid 24h)
> 7. Return `{ message: "Check your email to verify your account" }` — do not auto-login before verification
>
> **Endpoints**: `POST /api/auth/register` — `{ email, password, orgName }` → `{ message }`
>
> **Security notes**: Rate limit to 5 registrations per IP per hour. Do not reveal whether an email is already registered (return the same message either way to prevent enumeration).
>
> ### 2. Login
>
> **Steps**:
> 1. User submits email + password via `POST /api/auth/login`
> 2. Server looks up user by email; if not found, return generic error (no enumeration)
> 3. Verify password with bcrypt; if wrong, increment failed attempt counter
> 4. After 5 failed attempts from same IP in 15 min, return 429 with `retryAfter`
> 5. Check `email_verified: true`; if not, return 403 with "Please verify your email"
> 6. Generate access JWT (15 min expiry, payload: `{ userId, orgId, role }`)
> 7. Generate refresh token (random 64-byte hex), store in `refresh_tokens` table with expiry 30 days
> 8. Set refresh token in HttpOnly, Secure, SameSite=Strict cookie
> 9. Return access token in response body
>
> **Endpoints**: `POST /api/auth/login` — `{ email, password }` → `{ accessToken, user }`

## Notes

- This skill designs the auth system. Implementation is a separate step — use this document as the spec.
- If you have an existing auth system, describe it and ask the skill to identify gaps rather than design from scratch.
- Never roll your own crypto primitives. Use established libraries: `bcrypt`, `jsonwebtoken`, `passport`, `lucia`, `better-auth`, or a managed service like Auth0, Clerk, or Supabase Auth.
