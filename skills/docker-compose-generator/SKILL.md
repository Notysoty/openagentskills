---
name: Docker Compose Generator
description: Generates production-ready docker-compose.yml files for any application stack.
category: devops
tags:
  - docker
  - containers
  - devops
  - infrastructure
author: simplyutils
---

# Docker Compose Generator

## What this skill does

This skill directs the agent to gather information about your application stack and produce a production-ready `docker-compose.yml` file. It includes health checks, named volumes, custom networks, environment variable placeholders, restart policies, and sensible resource limits — all things that are easy to miss when writing a Compose file from scratch.

Use this when bootstrapping a new project, when converting an existing app to run in containers, or when you want a solid starting point to customize from.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/docker-compose-generator/SKILL.md` in your project root.

Then ask:
- *"Use the Docker Compose Generator skill to create a docker-compose.yml for my Node.js app with PostgreSQL and Redis."*
- *"I have a Python FastAPI backend, a React frontend, and a Postgres database. Use the Docker Compose Generator skill."*

The agent will ask clarifying questions before generating the file if your description is incomplete.

### Cursor / Codex

Paste the instructions from the section below into your session along with a description of your stack.

## The Prompt / Instructions for the Agent

When asked to generate a docker-compose.yml, follow these steps:

1. **Gather requirements.** If not already provided, ask for:
   - The application services (e.g., web server, worker, frontend build)
   - The data stores (PostgreSQL, MySQL, MongoDB, Redis, etc.) and their versions
   - The runtime environment (Node.js, Python, Go, etc.) and version
   - Whether this is for **development** or **production** (they differ significantly)
   - Any custom ports, domains, or volume paths

2. **Apply these rules to every service:**
   - Always set a `restart` policy (`unless-stopped` for production, `on-failure` for dev)
   - Add a `healthcheck` for every database or cache service
   - Use named volumes (not bind mounts) for persistent data in production
   - Use a custom named network — do not rely on the default bridge network
   - Put secrets and credentials in environment variables with `${VAR_NAME}` placeholders, never hardcoded values
   - Set `depends_on` with `condition: service_healthy` for services that require a healthy DB before starting

3. **For development configs**, also:
   - Add bind-mount source code for hot reloading (e.g., `./src:/app/src`)
   - Expose debug ports (e.g., `9229` for Node.js inspector)
   - Add a `.env.example` reminder comment

4. **For production configs**, also:
   - Add `deploy.resources.limits` for memory and CPU
   - Do not expose database ports to the host unless explicitly requested
   - Use `read_only: true` on containers where the filesystem does not need to be writable

5. **Output:**
   - The `docker-compose.yml` in a fenced code block
   - A `.env.example` snippet showing all required variables
   - A brief "Next steps" section (e.g., how to start, how to view logs)

## Example

**Input to Agent:**
> "Use the Docker Compose Generator skill. I have a Node.js Express API (port 3000), a PostgreSQL 16 database, and a Redis 7 cache. This is for production."

**Output from Agent:**

```yaml
# docker-compose.yml
version: '3.9'

services:
  api:
    build: .
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - NODE_ENV=production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - app-network
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M

  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres-data:
  redis-data:

networks:
  app-network:
    driver: bridge
```

**.env.example**
```
DATABASE_URL=postgresql://user:password@postgres:5432/myapp
REDIS_URL=redis://redis:6379
POSTGRES_DB=myapp
POSTGRES_USER=user
POSTGRES_PASSWORD=changeme
```

**Next steps**
1. Copy `.env.example` to `.env` and fill in real values
2. `docker compose up -d` to start all services
3. `docker compose logs -f api` to tail API logs

## Notes

- The generated file is a starting point — review resource limits and port exposure before deploying.
- The skill does not write a `Dockerfile` for your application image. It assumes your `Dockerfile` already exists in the project root, or will ask you to create one.
- For multi-environment setups, consider generating separate `docker-compose.override.yml` files for dev and staging. Ask the agent to do this explicitly.
- Always rotate any credentials in `.env.example` before using them in a real environment.
