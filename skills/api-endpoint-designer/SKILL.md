---
name: REST API Endpoint Designer
description: Designs RESTful API endpoints following OpenAPI spec and industry best practices.
category: coding
tags:
  - api
  - rest
  - openapi
  - backend
author: simplyutils
---

# REST API Endpoint Designer

## What this skill does

This skill directs the agent to design RESTful API endpoints for a given resource or feature — including URL structure, HTTP methods, request/response schemas, status codes, and error formats. It outputs a complete OpenAPI 3.1 YAML snippet that can be dropped directly into your API spec, along with implementation notes.

Use this when starting a new API resource, reviewing an existing endpoint design, or when you want a second opinion on naming conventions and status code choices.

## How to use

### Claude Code / Cursor / Codex

Copy this file to `.agents/skills/api-endpoint-designer/SKILL.md` in your project root (for Claude Code), or add the instructions to your `.cursorrules` (for Cursor).

Then ask:
- *"Design the REST endpoints for a blog post resource using the REST API Endpoint Designer skill."*
- *"I need CRUD endpoints for a `team-members` resource. Use the REST API Endpoint Designer skill."*

Provide the resource name, any existing conventions in your API (e.g., base path, auth method), and any fields the resource should have.

## The Prompt / Instructions for the Agent

When asked to design REST API endpoints, follow these rules:

### 1. URL naming conventions

- Use **plural nouns** for resource collections: `/users`, `/orders`, `/blog-posts`
- Use **kebab-case** for multi-word resources: `/blog-posts`, not `/blogPosts`
- Use path parameters for specific resources: `/users/{userId}`
- Use **nested resources** only when the relationship is truly hierarchical: `/users/{userId}/orders`
- Avoid verbs in URLs — the HTTP method is the verb: `POST /sessions` not `POST /login`
- Use query parameters for filtering, sorting, and pagination: `GET /users?role=admin&sort=created_at&order=desc&page=2&limit=20`

### 2. HTTP method selection

| Action | Method | Notes |
|---|---|---|
| List resources | GET | Paginated, filterable |
| Get one resource | GET | By ID in path |
| Create | POST | Body contains new resource |
| Full replace | PUT | Idempotent — replaces entire resource |
| Partial update | PATCH | Only fields provided are updated |
| Delete | DELETE | Returns 204 No Content on success |

### 3. Status codes

Always return the most specific correct code:
- `200` — success with body
- `201` — resource created (include `Location` header)
- `204` — success with no body (DELETE, some PATCH)
- `400` — bad request / validation error (include which field failed)
- `401` — not authenticated
- `403` — authenticated but not authorized
- `404` — resource not found
- `409` — conflict (e.g., duplicate email)
- `422` — unprocessable entity (semantic validation failed)
- `500` — internal server error (never leak stack traces)

### 4. Error response format

All error responses must follow this consistent shape:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": [
      { "field": "email", "message": "must be a valid email address" }
    ]
  }
}
```

### 5. Output format

Produce:
1. A table listing each endpoint with method, path, description, and auth requirement
2. An OpenAPI 3.1 YAML snippet for each endpoint
3. Implementation notes (e.g., pagination defaults, required indexes, rate limiting recommendations)

## Example

**Input to Agent:**
> "Design CRUD endpoints for a `posts` resource. Fields: title (string, required), body (string, required), authorId (string, required), status (draft | published, default: draft). Auth is required for create/update/delete. Use the REST API Endpoint Designer skill."

**Output from Agent:**

**Endpoints**

| Method | Path | Description | Auth Required |
|---|---|---|---|
| GET | /posts | List posts (paginated, filterable by status) | No |
| GET | /posts/{postId} | Get a single post | No |
| POST | /posts | Create a new post | Yes |
| PATCH | /posts/{postId} | Update post fields | Yes (author only) |
| DELETE | /posts/{postId} | Delete a post | Yes (author only) |

**OpenAPI YAML**

```yaml
paths:
  /posts:
    get:
      summary: List posts
      operationId: listPosts
      tags: [Posts]
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [draft, published]
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
      responses:
        '200':
          description: Paginated list of posts
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Post'
                  meta:
                    $ref: '#/components/schemas/PaginationMeta'

    post:
      summary: Create a post
      operationId: createPost
      tags: [Posts]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreatePostInput'
      responses:
        '201':
          description: Post created
          headers:
            Location:
              schema:
                type: string
                example: /posts/abc123
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Post'
        '400':
          $ref: '#/components/responses/ValidationError'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /posts/{postId}:
    get:
      summary: Get a post
      operationId: getPost
      tags: [Posts]
      parameters:
        - $ref: '#/components/parameters/PostId'
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Post'
        '404':
          $ref: '#/components/responses/NotFound'

    patch:
      summary: Update a post
      operationId: updatePost
      tags: [Posts]
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/PostId'
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdatePostInput'
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Post'
        '403':
          $ref: '#/components/responses/Forbidden'
        '404':
          $ref: '#/components/responses/NotFound'

    delete:
      summary: Delete a post
      operationId: deletePost
      tags: [Posts]
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/PostId'
      responses:
        '204':
          description: Post deleted
        '403':
          $ref: '#/components/responses/Forbidden'
        '404':
          $ref: '#/components/responses/NotFound'
```

**Implementation Notes**
- Index `posts.status` and `posts.authorId` for the list endpoint filters
- Enforce `limit <= 100` server-side, not just in the spec
- `PATCH /posts/{postId}` should check `authorId === currentUser.id` before applying changes — return `403` if not
- Consider a `GET /posts?authorId={userId}` filter for profile pages

## Notes

- By default this skill outputs OpenAPI 3.1 YAML. Ask for JSON or an earlier version (3.0, 2.0/Swagger) if needed.
- The skill does not generate implementation code — only the API contract. Use the Unit Test Writer or another skill for implementation.
- For GraphQL or gRPC APIs, this skill is not the right tool — it is designed for REST only.
