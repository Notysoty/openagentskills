---
name: MCP Integration Assistant
description: Helps design and implement Model Context Protocol (MCP) server integrations for AI agents.
category: coding
tags:
  - mcp
  - model-context-protocol
  - ai
  - agents
  - tools
author: simplyutils
---

# MCP Integration Assistant

## What this skill does

This skill guides the design and implementation of a Model Context Protocol (MCP) server that exposes an external system, API, or data source as tools, resources, or prompts for AI agents. It designs the tool schema, writes the server handler code, generates the client configuration snippet, and explains how to test the integration. The output is a working MCP server ready for use with Claude Desktop, Claude Code, Cline, or any MCP-compatible agent.

Use this when you want to give an AI agent access to a new system — a database, an internal API, a third-party service, a file system, or any data source — through the standard MCP protocol.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/mcp-integration-assistant/SKILL.md` in your project root.

Then describe what you want to expose and ask:
- *"Use the MCP Integration Assistant skill to build an MCP server for our Postgres database."*
- *"Design an MCP integration for the GitHub API using the MCP Integration Assistant skill."*

Describe the external system, what operations the agent should be able to perform, and any auth requirements.

### Cursor

Add the "Prompt / Instructions" section to your `.cursorrules` file. Describe the system you want to expose and ask Cursor to design the MCP server.

### Codex

Describe the target system and the operations you want to expose, then include the instructions below. Provide any relevant API docs or existing SDK code.

## The Prompt / Instructions for the Agent

When asked to design an MCP integration, follow these steps:

1. **Understand the target system.** Ask for or infer:
   - What external system, API, or data source needs to be exposed
   - What operations should the agent be able to perform (read, write, search, execute, etc.)
   - Authentication method (API key, OAuth, none, environment variable)
   - Any existing SDK or client library available
   - Programming language preference (TypeScript/Node.js is the primary MCP SDK language)

2. **Choose the right MCP primitive for each capability:**
   - **Tools** — actions the agent can invoke with parameters and receive a result (call an API, query a database, run a command). Use for anything that *does something*.
   - **Resources** — data the agent can read (files, URLs, database records). Use for structured data the agent needs as context. Resources have URIs.
   - **Prompts** — reusable prompt templates the agent can invoke. Use for common workflows or task templates.

   Most integrations primarily use Tools. Resources are best for large, browseable data. Prompts are optional.

3. **Design the tool schema for each tool:**
   - `name`: lowercase, hyphenated, descriptive verb-noun (e.g., `search-issues`, `create-record`, `get-user`)
   - `description`: one sentence. Explain what the tool does AND what an agent should use it for. Good descriptions help the agent decide when to call the tool.
   - `inputSchema`: JSON Schema object defining all parameters with:
     - `type`, `description`, and `required` for each field
     - Meaningful `enum` values where the set of options is known
     - Realistic `examples` or `default` values where applicable
   - Keep tools focused: one tool, one action. Avoid "do everything" tools.

4. **Write the MCP server in TypeScript** using the `@modelcontextprotocol/sdk` package:

   ```typescript
   import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
   import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
   import { z } from "zod";

   const server = new McpServer({
     name: "your-server-name",
     version: "1.0.0",
   });

   server.tool("tool-name", "Description", { param: z.string() }, async ({ param }) => {
     // implementation
     return { content: [{ type: "text", text: result }] };
   });

   const transport = new StdioServerTransport();
   await server.connect(transport);
   ```

   Use Zod for input validation. Return `{ content: [{ type: "text", text: "..." }] }` for success. Return `{ content: [...], isError: true }` for errors.

5. **Handle authentication securely:**
   - API keys and secrets must come from environment variables, never hardcoded
   - Show how to read them: `const apiKey = process.env.MY_SERVICE_API_KEY`
   - Include an error if required env vars are missing at startup

6. **Generate the client configuration snippet** for `claude_desktop_config.json`:
   ```json
   {
     "mcpServers": {
       "your-server-name": {
         "command": "node",
         "args": ["/absolute/path/to/dist/index.js"],
         "env": {
           "MY_SERVICE_API_KEY": "your-key-here"
         }
       }
     }
   }
   ```
   Also show the equivalent for Claude Code / Cline if different.

7. **Explain the testing approach:**
   - Run the server manually with `node dist/index.js` and send JSON-RPC messages via stdin
   - List the MCP Inspector tool (`npx @modelcontextprotocol/inspector`) for interactive testing
   - Describe a smoke test for each tool

8. **Output format:**

```
## MCP Integration: [System Name]

### Tools Designed
| Tool Name | Description | Key Parameters |
|-----------|-------------|----------------|
| ... | ... | ... |

### Server Code
```typescript
[Full server implementation]
```

### package.json dependencies
```json
[Required packages]
```

### Client Configuration
```json
[claude_desktop_config.json snippet]
```

### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| ... | ... | ... |

### Testing
[How to test each tool]
```

## Example

**Input to Agent:**
> "Use the MCP Integration Assistant skill to build an MCP server that lets an AI agent search and create Notion pages. Auth is via a Notion integration token."

**Output from Agent:**
> ## MCP Integration: Notion
>
> ### Tools Designed
> | Tool Name | Description | Key Parameters |
> |-----------|-------------|----------------|
> | `search-notion` | Search for pages and databases by title or content. Use when the agent needs to find existing Notion content. | `query` (string), `filter` (page/database) |
> | `get-notion-page` | Retrieve the full content of a Notion page by ID. Use when the agent needs to read a specific page. | `pageId` (string) |
> | `create-notion-page` | Create a new page in a Notion database. Use when the agent needs to write structured data to Notion. | `parentId`, `title`, `properties`, `content` |
>
> ### Server Code
> ```typescript
> import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
> import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
> import { z } from "zod";
> import { Client } from "@notionhq/client";
>
> const notionToken = process.env.NOTION_TOKEN;
> if (!notionToken) throw new Error("NOTION_TOKEN environment variable is required");
>
> const notion = new Client({ auth: notionToken });
>
> const server = new McpServer({
>   name: "notion-mcp",
>   version: "1.0.0",
> });
>
> server.tool(
>   "search-notion",
>   "Search Notion pages and databases by title or content. Use when you need to find existing Notion content before reading or updating it.",
>   {
>     query: z.string().describe("The search query"),
>     filter: z.enum(["page", "database"]).optional().describe("Filter results to pages or databases only"),
>   },
>   async ({ query, filter }) => {
>     try {
>       const response = await notion.search({
>         query,
>         filter: filter ? { property: "object", value: filter } : undefined,
>       });
>       const results = response.results.map((r: any) => ({
>         id: r.id,
>         title: r.properties?.title?.title?.[0]?.plain_text ?? r.title?.[0]?.plain_text ?? "Untitled",
>         url: r.url,
>         type: r.object,
>       }));
>       return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
>     } catch (err: any) {
>       return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
>     }
>   }
> );
>
> server.tool(
>   "get-notion-page",
>   "Retrieve the full content of a Notion page by its ID. Use when you have a page ID from search results and need to read the content.",
>   { pageId: z.string().describe("The Notion page ID") },
>   async ({ pageId }) => {
>     try {
>       const [page, blocks] = await Promise.all([
>         notion.pages.retrieve({ page_id: pageId }),
>         notion.blocks.children.list({ block_id: pageId }),
>       ]);
>       return { content: [{ type: "text", text: JSON.stringify({ page, blocks: blocks.results }, null, 2) }] };
>     } catch (err: any) {
>       return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
>     }
>   }
> );
>
> const transport = new StdioServerTransport();
> await server.connect(transport);
> ```
>
> ### Client Configuration
> ```json
> {
>   "mcpServers": {
>     "notion-mcp": {
>       "command": "node",
>       "args": ["/absolute/path/to/notion-mcp/dist/index.js"],
>       "env": {
>         "NOTION_TOKEN": "secret_your_integration_token_here"
>       }
>     }
>   }
> }
> ```
>
> ### Environment Variables
> | Variable | Required | Description |
> |----------|----------|-------------|
> | `NOTION_TOKEN` | Yes | Notion integration token from https://www.notion.so/my-integrations |
>
> ### Testing
> 1. Run `npx @modelcontextprotocol/inspector node dist/index.js` to open the interactive inspector
> 2. Test `search-notion` with a query matching a known page title
> 3. Copy the returned ID and test `get-notion-page` with it
> 4. Test `create-notion-page` with a known database ID and verify the page appears in Notion
