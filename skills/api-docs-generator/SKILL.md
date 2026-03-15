---
name: API Documentation Generator
description: Generates OpenAPI-compatible documentation for REST API endpoints from code or route definitions.
category: coding
tags:
  - api
  - documentation
  - openapi
  - swagger
author: simplyutils
---

# API Documentation Generator

## What this skill does

This skill reads REST API route handlers (Express, FastAPI, Go net/http, Rails, Django, or any framework) and generates complete OpenAPI 3.0 YAML documentation. It extracts paths, HTTP methods, path/query/body parameters, response shapes, and error codes, then writes properly structured YAML with example request and response bodies. The output can be loaded directly into Swagger UI, Redoc, or any OpenAPI-compatible tool.

Use this when you have undocumented API code and need to produce accurate, usable API documentation quickly.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/api-docs-generator/SKILL.md` in your project root.

Then point the agent at your routes file and ask:
- *"Use the API Documentation Generator skill on `server/routes.ts`."*
- *"Generate OpenAPI docs for all routes in `src/api/` using the API Documentation Generator skill."*

The agent will read the route files and any referenced handler functions to extract parameter and response shapes.

### Cursor

Add the "Prompt / Instructions" section to your `.cursorrules` file. Open your routes file in the editor and ask Cursor to generate the OpenAPI YAML.

### Codex

Paste your route definitions and handler code into the chat along with the instructions below. Include type definitions or schema files if they exist — they help Codex produce accurate request/response schemas.

## The Prompt / Instructions for the Agent

When asked to generate API documentation, follow these steps:

1. **Read the route definitions.** For each route, extract:
   - HTTP method (GET, POST, PUT, PATCH, DELETE)
   - Path, including path parameters (e.g., `/users/:id` → `/users/{id}`)
   - Router-level middleware (e.g., authentication guards — these become `security` entries)
   - The handler function name

2. **Read the handler functions.** For each handler, extract:
   - Path parameters (e.g., `req.params.id`)
   - Query parameters (e.g., `req.query.page`, `req.query.limit`)
   - Request body shape — read from validation schema (Zod, Joi, Pydantic, etc.) if present, otherwise infer from how `req.body` fields are used
   - All `res.json()` / `return response` shapes — enumerate every response including error paths
   - HTTP status codes returned (`200`, `201`, `400`, `401`, `404`, `500`, etc.)

3. **Infer data types accurately:**
   - If a Zod/Joi/Pydantic/serializer schema exists for the body or response, use it as the source of truth
   - Otherwise infer types from usage: string, number, boolean, array, object
   - Mark fields as `required` if they are destructured without a default or checked for presence
   - Note `nullable: true` on fields that may be null

4. **Write the OpenAPI 3.0 YAML** with this structure:
   - `openapi: "3.0.3"`
   - `info`: title, version, description
   - `servers`: include a localhost dev server at minimum
   - `paths`: one entry per route
   - `components/schemas`: reusable schema objects referenced with `$ref`
   - `components/securitySchemes`: if auth middleware is detected (Bearer, API key, cookie)

5. **For each path entry, include:**
   - `summary`: one sentence describing what the endpoint does
   - `description`: optional longer explanation
   - `parameters`: path, query, and header params with name, in, required, schema, description
   - `requestBody`: with `content/application/json/schema` and a fully-formed `example`
   - `responses`: at minimum the success response and common error responses (400, 401, 404, 500)
   - Each response must have a `description` and a `content/application/json/schema`

6. **Include realistic example values** in request and response bodies. Do not use placeholder values like `"string"` or `0` — use realistic data (e.g., `"john@example.com"`, `42`, `"2026-03-15T12:00:00Z"`).

7. **Output the complete YAML** in a single code block. Do not truncate.

## Example

**Input to Agent:**
> "Use the API Documentation Generator skill on this Express route:
>
> ```ts
> router.post('/users', async (req, res) => {
>   const { name, email, role } = req.body;
>   if (!name || !email) return res.status(400).json({ error: 'name and email are required' });
>   const user = await db.users.create({ name, email, role: role ?? 'viewer' });
>   res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
> });
>
> router.get('/users/:id', requireAuth, async (req, res) => {
>   const user = await db.users.findById(req.params.id);
>   if (!user) return res.status(404).json({ error: 'User not found' });
>   res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
> });
> ```"

**Output from Agent:**
> ```yaml
> openapi: "3.0.3"
> info:
>   title: Users API
>   version: "1.0.0"
>   description: Endpoints for managing users.
> servers:
>   - url: http://localhost:3000
>     description: Local development
> components:
>   securitySchemes:
>     bearerAuth:
>       type: http
>       scheme: bearer
>   schemas:
>     User:
>       type: object
>       properties:
>         id:
>           type: string
>           example: "usr_a1b2c3"
>         name:
>           type: string
>           example: "Jane Smith"
>         email:
>           type: string
>           format: email
>           example: "jane@example.com"
>         role:
>           type: string
>           enum: [viewer, admin]
>           example: "viewer"
>     Error:
>       type: object
>       properties:
>         error:
>           type: string
> paths:
>   /users:
>     post:
>       summary: Create a new user
>       requestBody:
>         required: true
>         content:
>           application/json:
>             schema:
>               type: object
>               required: [name, email]
>               properties:
>                 name:
>                   type: string
>                   example: "Jane Smith"
>                 email:
>                   type: string
>                   format: email
>                   example: "jane@example.com"
>                 role:
>                   type: string
>                   enum: [viewer, admin]
>                   default: viewer
>       responses:
>         "201":
>           description: User created successfully.
>           content:
>             application/json:
>               schema:
>                 $ref: '#/components/schemas/User'
>         "400":
>           description: Missing required fields.
>           content:
>             application/json:
>               schema:
>                 $ref: '#/components/schemas/Error'
>   /users/{id}:
>     get:
>       summary: Get a user by ID
>       security:
>         - bearerAuth: []
>       parameters:
>         - name: id
>           in: path
>           required: true
>           schema:
>             type: string
>           example: "usr_a1b2c3"
>       responses:
>         "200":
>           description: User found.
>           content:
>             application/json:
>               schema:
>                 $ref: '#/components/schemas/User'
>         "401":
>           description: Not authenticated.
>         "404":
>           description: User not found.
>           content:
>             application/json:
>               schema:
>                 $ref: '#/components/schemas/Error'
> ```
