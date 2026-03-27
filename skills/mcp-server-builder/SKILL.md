---
name: MCP Server Builder
description: Step-by-step guidance for creating a new MCP server with FastMCP or the TypeScript SDK — tool definitions, resource handlers, error responses, and usage examples.
category: coding
tags:
  - mcp
  - model-context-protocol
  - tools
  - fastmcp
  - claude
author: simplyutils
---

# MCP Server Builder

## What this skill does

This skill walks you through building a Model Context Protocol (MCP) server from scratch. MCP servers expose tools, resources, and prompts to AI agents (Claude, Cursor, Cline, etc.). This skill covers both Python (FastMCP) and TypeScript (official SDK) implementations, with production-ready patterns for error handling, input validation, and tool description writing.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/mcp-server-builder/SKILL.md` in your project root.

Then ask:
- *"Use the MCP Server Builder to create a server that exposes our internal database as tools."*
- *"Build an MCP server in Python that wraps our REST API."*

Provide:
- What capabilities you want to expose (tools, resources, or both)
- Language preference (Python or TypeScript)
- Whether it will run locally (stdio) or as a remote server (HTTP)
- What systems it needs to connect to

### Cursor / Codex

Describe the tools you want to expose alongside these instructions.

## The Prompt / Instructions for the Agent

When asked to build an MCP server, produce the following:

### Step 1 — Choose transport

| Use case | Transport |
|---|---|
| Local tool for one developer | stdio (local process) |
| Team-shared server | Streamable HTTP (remote) |
| Claude Desktop integration | stdio |
| Multi-user / production | HTTP with auth |

### Step 2a — Python implementation (FastMCP)

```python
# Install: pip install fastmcp
from fastmcp import FastMCP
from pydantic import BaseModel, Field

mcp = FastMCP("my-server")

# --- Tool definition ---
class SearchInput(BaseModel):
    query: str = Field(description="The search query to run")
    limit: int = Field(default=10, ge=1, le=50, description="Max results to return")

@mcp.tool()
async def search_documents(input: SearchInput) -> str:
    """
    Search the document database for relevant content.

    Use this when the user asks to find, look up, or search for documents.
    Returns a formatted list of matching documents with titles and summaries.
    """
    try:
        results = await db.search(input.query, limit=input.limit)
        if not results:
            return "No documents found matching your query."
        return "\n".join(f"- {r.title}: {r.summary}" for r in results)
    except Exception as e:
        return f"Error searching documents: {str(e)}"

# --- Resource definition (read-only data) ---
@mcp.resource("config://app-settings")
async def get_app_settings() -> str:
    """Returns the current application configuration."""
    return json.dumps(load_config(), indent=2)

# Run with stdio (for local / Claude Desktop)
if __name__ == "__main__":
    mcp.run()

# Run with HTTP (for remote / team use)
# mcp.run(transport="streamable-http", host="0.0.0.0", port=8000)
```

### Step 2b — TypeScript implementation (official SDK)

```typescript
// Install: npm install @modelcontextprotocol/sdk zod
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const server = new Server(
  { name: "my-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "search_documents",
    description: "Search the document database. Use when user asks to find or look up documents.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        limit: { type: "number", description: "Max results (1-50)", default: 10 }
      },
      required: ["query"]
    }
  }]
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "search_documents") {
    const { query, limit = 10 } = request.params.arguments as { query: string; limit?: number };

    try {
      const results = await searchDB(query, limit);
      return {
        content: [{ type: "text", text: formatResults(results) }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
  throw new Error(`Unknown tool: ${request.params.name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

### Step 3 — Write effective tool descriptions

Tool descriptions are what the model reads to decide when and how to use your tool. Write them like documentation for a smart but unfamiliar developer:

**Bad description:**
```
"Searches documents"
```

**Good description:**
```
"Search the internal document database by keyword or semantic query.
Use this when the user asks to find, look up, retrieve, or search for
any documents, files, or records. Returns up to `limit` results with
title, author, date, and a 2-sentence summary. For best results, use
natural language queries rather than boolean operators."
```

Rules for good tool descriptions:
- Say **when to use** the tool ("Use this when...")
- Describe **what it returns** precisely
- Mention **limitations** (max results, supported formats)
- Use natural language — the model reads these, not a parser

### Step 4 — Error handling pattern

Always return errors as text content, never throw unhandled exceptions:

```python
@mcp.tool()
async def get_user(user_id: str) -> str:
    """Fetch a user record by ID."""
    if not user_id.strip():
        return "Error: user_id cannot be empty"

    try:
        user = await db.get_user(user_id)
        if not user:
            return f"No user found with ID '{user_id}'"
        return user.to_json()
    except DatabaseError as e:
        return f"Database error: {str(e)}"
    except Exception as e:
        return f"Unexpected error fetching user: {str(e)}"
```

### Step 5 — Claude Desktop config

To test locally with Claude Desktop, add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "python",
      "args": ["/path/to/server.py"],
      "env": {
        "DATABASE_URL": "postgresql://..."
      }
    }
  }
}
```

For TypeScript: `"command": "node", "args": ["/path/to/dist/server.js"]`

### Step 6 — Production checklist

Before deploying a shared MCP server:
- [ ] All tool inputs validated with Pydantic / Zod schemas
- [ ] All errors return descriptive text (no unhandled exceptions)
- [ ] Tool descriptions explain when AND how to use each tool
- [ ] Sensitive operations (write/delete) require explicit confirmation parameters
- [ ] Rate limiting implemented if tools call external APIs
- [ ] Authentication added if server is exposed over HTTP
- [ ] Tool names are unique, lowercase, underscore-separated
