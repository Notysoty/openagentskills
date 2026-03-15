---
name: README Writer
description: Generates a professional, comprehensive README.md for any project from its codebase or description.
category: productivity
tags:
  - documentation
  - readme
  - open-source
author: simplyutils
---

# README Writer

## What this skill does

This skill directs the agent to read a project's structure, `package.json` (or equivalent manifest), source files, and any existing documentation, then generate a complete, professional README.md. The output adapts its tone and structure to the type of project — a CLI tool, a web app, a library, or a framework — and covers everything a new user or contributor needs to get started.

Use this when you have a new project without documentation, an outdated README, or an open-source project you want to present well.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/readme-writer/SKILL.md` in your project root.

Then ask:
- *"Use the README Writer skill to generate a README for this project."*
- *"Write a professional README.md for this repo using the README Writer skill."*

The agent will explore the project structure on its own. You can also provide a description of what the project does if the code alone isn't self-explanatory.

### Cursor

Add the "Prompt / Instructions" section to your `.cursorrules` file. Then open the relevant files (package.json, main entry point) and ask Cursor to write the README.

### Codex

Paste your `package.json` (or equivalent), the main entry file, and a brief description of the project. Then include the instructions below.

## The Prompt / Instructions for the Agent

When asked to write a README, follow these steps:

1. **Gather information.** Read:
   - `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, or equivalent manifest for name, description, version, dependencies, and scripts
   - The main entry point file to understand the project's purpose
   - Any existing `README.md`, `CHANGELOG.md`, or `docs/` folder
   - The directory structure (top level) to understand the project layout
   - `LICENSE` file to identify the license

2. **Determine the project type** and adapt accordingly:
   - **Library/Package** — focus on API reference, installation, and code examples
   - **CLI tool** — focus on installation, commands, flags, and usage examples
   - **Web application** — focus on features, setup, and deployment
   - **Framework/boilerplate** — focus on getting started, conventions, and architecture

3. **Write the README with these sections** (adapt as needed for project type):

   - **Title + Badges**: Project name as an H1. Add relevant badges (build status, npm version, license) using standard badge formats. Only add badges for things that actually exist.
   - **One-line description**: What the project does in one sentence.
   - **Features**: 4–8 bullet points of the most important capabilities.
   - **Tech Stack**: Brief list of core technologies used (language, framework, database, etc.).
   - **Prerequisites**: What the user needs installed before they can run the project.
   - **Quickstart / Installation**: The exact commands to install and run — copy-paste ready. Use code blocks with language tags.
   - **Usage**: How to use the project after setup. For libraries: code examples. For CLIs: command syntax and examples. For apps: how to navigate key features.
   - **Configuration**: Document environment variables, config files, or options. Use a table with columns: Variable, Default, Description.
   - **Project Structure**: A concise directory tree showing where things live. Only include meaningful directories, not every file.
   - **API Reference** (libraries/APIs only): Document public functions, methods, or endpoints with their signatures and descriptions.
   - **Contributing**: How to contribute — fork, branch, PR process, code style, running tests.
   - **License**: One line with the license name and a link to the LICENSE file.

4. **Write in plain, direct language.** Avoid filler phrases like "This project aims to..." — start with what it does.

5. **Make all code blocks runnable.** Every shell command must be accurate and complete. Test commands against the actual `scripts` in the manifest.

6. **Do not invent features** that don't exist in the code. Only document what is real.

## Example

**Input to Agent:**
> "Use the README Writer skill on this project. Here's the package.json:
> ```json
> {
>   "name": "snap-resize",
>   "version": "1.2.0",
>   "description": "Fast image resizing CLI for batch processing",
>   "bin": { "snap-resize": "./dist/cli.js" },
>   "scripts": { "build": "tsc", "test": "jest" },
>   "dependencies": { "sharp": "^0.33.0", "commander": "^12.0.0" }
> }
> ```"

**Output from Agent:**
> # snap-resize
>
> ![npm version](https://img.shields.io/npm/v/snap-resize)
> ![license](https://img.shields.io/npm/l/snap-resize)
>
> Fast image resizing CLI for batch processing — resize hundreds of images in seconds with a single command.
>
> ## Features
> - Batch resize entire directories of images
> - Output to JPEG, PNG, or WebP
> - Preserve or override aspect ratio
> - Set quality level per output format
> - Built on [sharp](https://sharp.pixelplumbing.com/) for native-speed processing
>
> ## Prerequisites
> - Node.js 18 or higher
> - npm 9 or higher
>
> ## Installation
> ```bash
> npm install -g snap-resize
> ```
>
> ## Usage
> ```bash
> # Resize all images in a folder to 800px wide
> snap-resize ./photos --width 800 --out ./resized
>
> # Convert to WebP at 80% quality
> snap-resize ./photos --format webp --quality 80 --out ./output
> ```
>
> ## Configuration
> | Option | Default | Description |
> |--------|---------|-------------|
> | `--width` | — | Output width in pixels |
> | `--height` | — | Output height in pixels |
> | `--format` | original | Output format: `jpeg`, `png`, `webp` |
> | `--quality` | 85 | Compression quality (1–100) |
> | `--out` | `./out` | Output directory |
>
> ## Contributing
> 1. Fork the repo and create a branch: `git checkout -b my-feature`
> 2. Make your changes and add tests
> 3. Run `npm test` — all tests must pass
> 4. Open a pull request
>
> ## License
> MIT — see [LICENSE](./LICENSE)
