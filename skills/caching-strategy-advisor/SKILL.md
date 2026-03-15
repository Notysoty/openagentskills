---
name: Caching Strategy Advisor
description: Recommends the right caching layer, TTL strategy, and invalidation approach for any application bottleneck.
category: devops
tags:
  - caching
  - performance
  - redis
  - cdn
  - backend
author: simplyutils
---

# Caching Strategy Advisor

## What this skill does

This skill analyzes a performance bottleneck, a slow query, or an expensive operation and recommends the right caching strategy for it — which cache layer to use, what TTL to set, how to handle cache invalidation, and what to watch out for. It covers in-memory caches, Redis, HTTP caching headers, CDN caching, and database query caching, and explains the trade-offs of each recommendation.

Use this when you have a slow API, a database that's under heavy read load, a page that's slow to load, or any operation that's expensive and called frequently.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/caching-strategy-advisor/SKILL.md` in your project root.

Then ask:
- *"Use the Caching Strategy Advisor skill — our product listing API is slow and called thousands of times per minute."*
- *"We have a heavy database query that runs on every page load. Use the Caching Strategy Advisor skill to recommend a caching approach."*

Provide:
- What operation is slow (SQL query, API call, computation, file read)
- How often it's called and by how many users
- How often the underlying data changes
- Your current tech stack (language, framework, existing infrastructure)
- What consistency guarantees you need (is stale data for a few seconds OK?)

### Cursor

Add the instructions below to your `.cursorrules` or paste them into the Cursor AI pane with the context above.

### Codex

Provide the operation description and context. Ask Codex to follow the instructions below to produce the caching recommendation.

## The Prompt / Instructions for the Agent

When asked to advise on a caching strategy, follow these steps:

### Step 1 — Understand the workload

Ask or infer:
- **Read/write ratio**: Is this data mostly read, or is it frequently updated?
- **Call frequency**: How many requests per second/minute hit this operation?
- **Data freshness requirement**: How stale can the data be before it causes a real problem? 1 second? 1 minute? 1 hour? Doesn't matter?
- **Data size**: How large is the response? (Affects cache storage cost and memory limits)
- **User specificity**: Is the data the same for all users (public), or different per user (personalized)?
- **Consistency requirement**: Is it OK to serve slightly stale data, or does every user need to see the absolute latest?

### Step 2 — Identify the right cache layer

Choose the appropriate layer(s):

**In-process / in-memory cache** (e.g., a Map or LRU cache in the application itself)
- Best for: Frequently read, rarely changing data that's the same for all instances. Config values, lookup tables, small datasets.
- Trade-offs: Lost on restart, not shared across instances, can cause memory pressure if not bounded.
- Use when: Single-server deployments, data that almost never changes, sub-millisecond latency needed.

**Redis / Memcached** (distributed key-value cache)
- Best for: Data shared across multiple application instances. User sessions, computed results, rate limit counters, frequently read DB query results.
- Trade-offs: Additional infrastructure to manage, network hop adds ~1ms latency.
- Use when: Multi-instance deployments, data shared between requests from different users/servers.

**HTTP response caching (Cache-Control headers)**
- Best for: REST API responses that don't change per-user. Public endpoints.
- Trade-offs: Client controls freshness; requires proper `ETag` or `Last-Modified` for conditional requests.
- Use when: Public API responses, static-ish data served to browsers or API clients.

**CDN caching** (Cloudflare, CloudFront, Fastly)
- Best for: Static assets, public pages, API responses that are the same for all users globally.
- Trade-offs: Purging cached content requires a CDN API call; not suitable for personalized data.
- Use when: High global traffic, static or semi-static public content, reducing origin server load.

**Database query cache / materialized views**
- Best for: Expensive aggregation queries that are read-heavy.
- Trade-offs: Must be refreshed on a schedule or trigger; adds complexity to the data layer.
- Use when: The query result can't be moved to Redis easily, the query runs on a schedule anyway.

### Step 3 — Recommend TTL and invalidation strategy

**TTL (Time-to-live)**
- For data that rarely changes: 1 hour to 24 hours
- For data that changes occasionally: 5–15 minutes
- For data that changes frequently but exact freshness isn't critical: 30–60 seconds
- For data where you need exact freshness: cache with event-based invalidation (not TTL)

**Invalidation strategies**:

- **TTL-only (lazy expiry)**: Simplest. Cache expires after TTL. Good when stale data for a few minutes is acceptable.
- **Write-through**: Update the cache at the same time you write to the database. Good consistency, but write path is slower.
- **Cache-aside (read-through)**: Check cache first; on miss, read from DB and populate cache. Most common pattern.
- **Event-based invalidation**: When data changes (on DB write, on event), explicitly delete or update the cache key. Needed for strong consistency.
- **Stale-while-revalidate**: Serve the stale value immediately while refreshing in the background. Great for reducing perceived latency.

### Step 4 — Flag cache-specific risks

Always check for:
- **Cache stampede**: Many requests hit the cache at the same time after expiry, all flooding the DB. Mitigation: probabilistic early expiry, mutex/lock on cache refresh.
- **Cache poisoning**: Attackers inject bad data into the cache. Mitigation: validate data before caching, don't cache error responses.
- **Thundering herd on cold start**: Cache is empty on startup; all traffic hits DB. Mitigation: warm the cache on startup, use staggered TTLs.
- **Memory limits**: Unbounded caches grow until the process crashes. Always set a max size and eviction policy.
- **Sensitive data in cache**: PII or secrets in cache keys or values. Ensure cache is not exposed and keys don't leak user data.

### Step 5 — Format the recommendation

```markdown
## Caching Strategy Recommendation

### Problem Summary
[1–2 sentences describing the bottleneck and the key workload characteristics]

### Recommended Strategy
[Which cache layer(s) to use and why]

### Implementation Plan

#### Cache Layer: [Layer name]
- **What to cache**: [The exact query result, API response, computed value]
- **Cache key structure**: `[prefix]:[identifier]` (e.g., `product:list:category:electronics:page:1`)
- **TTL**: [Value and reasoning]
- **Invalidation**: [How and when to invalidate]
- **Storage estimate**: [Approximate size per entry × expected number of entries]

### Code Pattern
[Pseudocode or real code example showing the cache-aside or write-through pattern]

### Risks and Mitigations
| Risk | Mitigation |
|------|-----------|
| [Risk] | [How to address it] |

### Expected Impact
[Estimated reduction in DB load, latency improvement, or throughput increase]

### What NOT to cache
[Any related data that should NOT be cached, and why]
```

## Example

**Input to Agent:**
> "Use the Caching Strategy Advisor skill. Our `GET /api/products` endpoint queries the database for a product catalog (500 products, with category and price info). It's called 2,000 times per minute. Products are updated by staff roughly once per hour. Our stack is Node.js + PostgreSQL + Redis (already available). Stale data for up to 5 minutes is acceptable."

**Output from Agent:**

> ## Caching Strategy Recommendation
>
> ### Problem Summary
> The product catalog is read-heavy (2,000 req/min), changes infrequently (~hourly), and can tolerate up to 5 minutes of staleness. This is an ideal candidate for a Redis cache with a TTL-based expiry.
>
> ### Recommended Strategy
> Cache the query result in Redis with a 5-minute TTL. Use a cache-aside pattern: on a cache miss, query PostgreSQL and populate the cache. No event-based invalidation needed given the acceptable staleness window.
>
> ### Implementation Plan
>
> #### Cache Layer: Redis
> - **What to cache**: Full serialized response of `GET /api/products` (the array of 500 products with category and price)
> - **Cache key**: `products:catalog:all` (if no filtering); `products:catalog:category:[slug]` (if filtered by category)
> - **TTL**: 5 minutes (300 seconds)
> - **Invalidation**: TTL-only. Optionally: explicitly delete the key after a staff product update for immediate freshness.
> - **Storage estimate**: ~500 products × ~500 bytes = ~250KB per cache key — well within Redis limits
>
> ### Code Pattern
> ```ts
> async function getProducts(category?: string): Promise<Product[]> {
>   const cacheKey = category ? `products:catalog:category:${category}` : 'products:catalog:all';
>
>   const cached = await redis.get(cacheKey);
>   if (cached) return JSON.parse(cached);
>
>   const products = await db.query('SELECT * FROM products WHERE ...', [category]);
>   await redis.setex(cacheKey, 300, JSON.stringify(products)); // TTL: 300s
>   return products;
> }
> ```
>
> ### Risks and Mitigations
>
> | Risk | Mitigation |
> |------|-----------|
> | Cache stampede (all cache keys expire at once) | Add small random jitter to TTL: `300 + Math.floor(Math.random() * 30)` |
> | Cold start on deploy | Pre-warm cache on server startup by calling `getProducts()` |
>
> ### Expected Impact
> DB read load for this endpoint drops by ~98% (cache miss rate will be very low at 2,000 req/min with 5-minute TTL).

## Notes

- Don't cache what you can't invalidate. If you're not sure how to invalidate a cache entry when the data changes, use a shorter TTL until you have a proper invalidation strategy.
- Cache the output of expensive operations, not the input. Cache the rendered HTML or the query result, not intermediate variables.
- Measure before and after — add cache hit/miss metrics so you can verify the cache is actually being used.
