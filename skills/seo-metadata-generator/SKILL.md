---
name: SEO Metadata Generator
description: Generates optimized title tags, meta descriptions, Open Graph tags, and structured data for any web page.
category: writing
tags:
  - seo
  - metadata
  - open-graph
  - structured-data
  - html
author: simplyutils
---

# SEO Metadata Generator

## What this skill does

This skill generates a complete set of SEO metadata for any web page — title tag, meta description, Open Graph tags, Twitter Card tags, and JSON-LD structured data — all in a single ready-to-paste HTML snippet. It analyzes the page's content and purpose, chooses the right structured data schema (Article, Product, WebPage, FAQPage, etc.), and optimizes every field for both search engines and social sharing.

Use this when building a new page, auditing existing metadata, or ensuring consistent SEO across a site.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/seo-metadata-generator/SKILL.md` in your project root.

Then describe the page or share its content and ask:
- *"Use the SEO Metadata Generator skill to generate metadata for our pricing page."*
- *"Generate SEO tags for this blog post using the SEO Metadata Generator skill."*

Provide: the page's main content or purpose, the primary keyword, the page URL, the site name, and an available OG image URL (or a placeholder if none exists yet).

### Cursor

Add the "Prompt / Instructions" section to your `.cursorrules` file. Open the page template or content file and ask Cursor to generate the metadata.

### Codex

Describe the page content, primary keyword, URL, site name, and page type. Include the instructions below.

## The Prompt / Instructions for the Agent

When asked to generate SEO metadata, follow these steps:

1. **Understand the page.** Extract or ask for:
   - Page type: article/blog post, product page, landing page, homepage, tool/app page, FAQ page, category page
   - Primary keyword: the main search term this page should rank for
   - Page URL (full, canonical)
   - Site name and brand
   - Page content summary (or the content itself)
   - OG image URL (use `https://example.com/og-image.png` as a placeholder if not provided)
   - Author name (for articles)
   - Publication date (for articles)

2. **Generate the title tag:**
   - Length: 50–60 characters (never exceed 60)
   - Format: `Primary Keyword — Brand Name` or `Primary Keyword: Descriptive Subtitle`
   - Put the primary keyword first (or as close to the beginning as possible)
   - Do not keyword-stuff — the title must read naturally
   - For homepages: `Brand Name — Short Value Proposition`

3. **Generate the meta description:**
   - Length: 150–160 characters (never exceed 160)
   - Include the primary keyword once, naturally
   - Be action-oriented: tell the user what they'll get or what they can do
   - End with an implicit or explicit CTA ("Get started", "Try it free", "Learn how")
   - Never just repeat the title

4. **Generate Open Graph tags:**
   - `og:title` — can match the title tag or be slightly more descriptive (up to 95 chars for social)
   - `og:description` — can match the meta description or be more conversational for social sharing (up to 200 chars)
   - `og:image` — use the provided URL; add `og:image:width` (1200) and `og:image:height` (630) for proper display
   - `og:image:alt` — descriptive alt text for the image (not "image of..." — just describe what's in it)
   - `og:url` — the canonical page URL
   - `og:type` — `article` for blog posts, `website` for all other pages, `product` for e-commerce
   - `og:site_name` — the site name

5. **Generate Twitter Card tags:**
   - `twitter:card` — use `summary_large_image` for pages with a meaningful OG image; `summary` otherwise
   - `twitter:title` — same as `og:title`
   - `twitter:description` — same as `og:description`
   - `twitter:image` — same as `og:image`
   - `twitter:image:alt` — same as `og:image:alt`
   - `twitter:site` — `@twitterhandle` (use placeholder `@yourbrand` if not provided)

6. **Generate JSON-LD structured data.** Choose the schema type based on page type:
   - Blog post / article → `Article` schema (with `author`, `datePublished`, `dateModified`, `headline`, `image`)
   - Product page → `Product` schema (with `name`, `description`, `offers`, `brand`)
   - FAQ page → `FAQPage` schema (with `mainEntity` array of `Question`/`Answer` pairs)
   - How-to page → `HowTo` schema (with `step` array)
   - Tool/software page → `SoftwareApplication` schema
   - General page → `WebPage` schema (with `name`, `description`, `url`)
   - Homepage → `WebSite` schema + `Organization` schema

   Always include `@context: "https://schema.org"` and `@type`. Use realistic values, not `"string"` placeholders.

7. **Add a canonical link tag.**

8. **Output as a single, complete HTML snippet** ready to paste into the `<head>` section. Add comments to separate sections. Do not include `<html>`, `<head>`, or `<body>` tags — just the meta tags and script.

9. **Flag any issues or assumptions** (e.g., "I used a placeholder OG image URL — replace before deploying", "Publication date assumed to be today").

## Example

**Input to Agent:**
> "Use the SEO Metadata Generator skill. Page: a blog post titled 'How to Optimize React Performance'. Primary keyword: 'react performance optimization'. URL: https://devblog.example.com/blog/react-performance-optimization. Site: DevBlog. Author: Sarah Chen. Published: 2026-03-15. OG image: https://devblog.example.com/images/react-perf-og.png"

**Output from Agent:**
> ```html
> <!-- Primary Meta Tags -->
> <title>React Performance Optimization: A Complete Guide — DevBlog</title>
> <meta name="description" content="Learn proven React performance optimization techniques — memoization, lazy loading, bundle splitting, and more. Cut your app's render time today.">
> <link rel="canonical" href="https://devblog.example.com/blog/react-performance-optimization">
>
> <!-- Open Graph / Facebook -->
> <meta property="og:type" content="article">
> <meta property="og:url" content="https://devblog.example.com/blog/react-performance-optimization">
> <meta property="og:site_name" content="DevBlog">
> <meta property="og:title" content="React Performance Optimization: A Complete Guide">
> <meta property="og:description" content="Proven techniques to speed up your React app — memoization, lazy loading, bundle splitting, and profiling. Cut render time and improve user experience.">
> <meta property="og:image" content="https://devblog.example.com/images/react-perf-og.png">
> <meta property="og:image:width" content="1200">
> <meta property="og:image:height" content="630">
> <meta property="og:image:alt" content="Code editor showing React component optimization with useMemo highlighted">
>
> <!-- Twitter Card -->
> <meta name="twitter:card" content="summary_large_image">
> <meta name="twitter:site" content="@devblog">
> <meta name="twitter:title" content="React Performance Optimization: A Complete Guide">
> <meta name="twitter:description" content="Proven techniques to speed up your React app — memoization, lazy loading, bundle splitting, and profiling. Cut render time and improve user experience.">
> <meta name="twitter:image" content="https://devblog.example.com/images/react-perf-og.png">
> <meta name="twitter:image:alt" content="Code editor showing React component optimization with useMemo highlighted">
>
> <!-- JSON-LD Structured Data -->
> <script type="application/ld+json">
> {
>   "@context": "https://schema.org",
>   "@type": "Article",
>   "headline": "How to Optimize React Performance",
>   "description": "Learn proven React performance optimization techniques — memoization, lazy loading, bundle splitting, and more.",
>   "image": "https://devblog.example.com/images/react-perf-og.png",
>   "url": "https://devblog.example.com/blog/react-performance-optimization",
>   "datePublished": "2026-03-15",
>   "dateModified": "2026-03-15",
>   "author": {
>     "@type": "Person",
>     "name": "Sarah Chen"
>   },
>   "publisher": {
>     "@type": "Organization",
>     "name": "DevBlog",
>     "url": "https://devblog.example.com"
>   },
>   "mainEntityOfPage": {
>     "@type": "WebPage",
>     "@id": "https://devblog.example.com/blog/react-performance-optimization"
>   }
> }
> </script>
> ```
>
> **Notes:**
> - Title is 57 characters — within the 50–60 target.
> - Meta description is 154 characters — within the 150–160 target.
> - Replace `@devblog` with your actual Twitter handle.
> - Update `dateModified` whenever the post is significantly updated.
