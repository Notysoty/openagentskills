#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const SKILLS_DIR = path.join(__dirname, "..", "skills");

const VALID_CATEGORIES = ["coding", "writing", "data", "devops", "research", "productivity"];
const MIN_TAGS = 2;
const MAX_TAGS = 7;

function computeQualityScore(fm, body) {
  let score = 0;
  if (fm.name && fm.name.trim()) score += 8;
  if (fm.description && fm.description.trim().split(/\s+/).length >= 5) score += 8;
  if (fm.category && VALID_CATEGORIES.includes(fm.category)) score += 8;
  if (Array.isArray(fm.tags) && fm.tags.length >= MIN_TAGS && fm.tags.length <= MAX_TAGS) score += 8;
  if (fm.author && fm.author.trim()) score += 8;
  if (/^##\s+Examples?/im.test(body)) score += 20;
  if (/^##\s+The Prompt/im.test(body)) score += 20;
  const wc = body.trim().split(/\s+/).filter(Boolean).length;
  if (wc >= 300) score += 20;
  else if (wc >= 100) score += 10;
  return score;
}

function scoreLabel(score) {
  if (score === 100) return `${C.green}${score}/100 ★ Excellent${C.reset}`;
  if (score >= 80)  return `${C.yellow}${score}/100 Good${C.reset}`;
  return `${C.magenta}${score}/100 Needs work${C.reset}`;
}

// ── ANSI colours ────────────────────────────────────────────────────────────
const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
};

function bold(s) { return `${C.bold}${s}${C.reset}`; }
function dim(s)  { return `${C.dim}${s}${C.reset}`; }
function cyan(s) { return `${C.cyan}${s}${C.reset}`; }
function green(s){ return `${C.green}${s}${C.reset}`; }
function yellow(s){ return `${C.yellow}${s}${C.reset}`; }

// ── Frontmatter parser ───────────────────────────────────────────────────────
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const result = {};
  let currentKey = null;
  for (const line of match[1].split("\n")) {
    const kvMatch = line.match(/^(\w+):\s*(.*)$/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      result[currentKey] = kvMatch[2].trim();
    } else if (line.match(/^\s+-\s+(.+)$/) && currentKey) {
      const val = line.match(/^\s+-\s+(.+)$/)[1].trim();
      if (!Array.isArray(result[currentKey])) result[currentKey] = [];
      result[currentKey].push(val);
    }
  }
  return result;
}

// ── Load all skills ──────────────────────────────────────────────────────────
function loadSkills() {
  return fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const skillFile = path.join(SKILLS_DIR, d.name, "SKILL.md");
      if (!fs.existsSync(skillFile)) return null;
      const content = fs.readFileSync(skillFile, "utf8");
      const fm = parseFrontmatter(content);
      return {
        slug: d.name,
        name: fm.name || d.name,
        description: fm.description || "",
        category: fm.category || "uncategorized",
        tags: Array.isArray(fm.tags) ? fm.tags : [],
        author: fm.author || "",
        content,
        fm,
      };
    })
    .filter(Boolean);
}

// ── Commands ─────────────────────────────────────────────────────────────────

function cmdList(args) {
  const catFlag = args.indexOf("--category");
  const filterCat = catFlag !== -1 ? args[catFlag + 1] : null;

  const skills = loadSkills();
  const filtered = filterCat
    ? skills.filter((s) => s.category.toLowerCase() === filterCat.toLowerCase())
    : skills;

  if (filtered.length === 0) {
    console.log(`No skills found${filterCat ? ` in category "${filterCat}"` : ""}.`);
    return;
  }

  // Group by category
  const byCategory = {};
  for (const s of filtered) {
    (byCategory[s.category] = byCategory[s.category] || []).push(s);
  }

  console.log("");
  for (const [cat, items] of Object.entries(byCategory).sort()) {
    console.log(bold(cyan(`● ${cat.toUpperCase()}`)));
    for (const s of items.sort((a, b) => a.slug.localeCompare(b.slug))) {
      console.log(`  ${green(s.slug.padEnd(40))} ${dim(s.description)}`);
    }
    console.log("");
  }
  console.log(dim(`${filtered.length} skill(s) total`));
}

function cmdSearch(args) {
  const query = args.join(" ").toLowerCase().trim();
  if (!query) {
    console.error("Usage: openagentskills search <query>");
    process.exit(1);
  }

  const skills = loadSkills();
  const results = skills.filter((s) => {
    const haystack = [s.slug, s.name, s.description, s.category, ...s.tags]
      .join(" ")
      .toLowerCase();
    return query.split(/\s+/).every((word) => haystack.includes(word));
  });

  if (results.length === 0) {
    console.log(`No skills matched "${query}".`);
    return;
  }

  console.log("");
  for (const s of results) {
    const tagStr = s.tags.length ? dim(` [${s.tags.join(", ")}]`) : "";
    console.log(`${green(s.slug)}${tagStr}`);
    console.log(`  ${s.description}`);
    console.log(`  ${dim("Category:")} ${yellow(s.category)}`);
    console.log("");
  }
  console.log(dim(`${results.length} result(s) for "${query}"`));
}

function cmdInfo(args) {
  const slug = args[0];
  if (!slug) {
    console.error("Usage: openagentskills info <skill-name>");
    process.exit(1);
  }

  const skills = loadSkills();
  const skill = skills.find(
    (s) => s.slug === slug || s.name.toLowerCase() === slug.toLowerCase()
  );

  if (!skill) {
    console.error(`Skill "${slug}" not found. Run "openagentskills list" to see all skills.`);
    process.exit(1);
  }

  // Strip frontmatter and print the markdown body
  const body = skill.content.replace(/^---[\s\S]*?---\n/, "").trim();
  const score = computeQualityScore(skill.fm, body);

  console.log("");
  console.log(bold(cyan(`● ${skill.name}`)));
  console.log(`${dim("Slug:")}     ${skill.slug}`);
  console.log(`${dim("Category:")} ${yellow(skill.category)}`);
  console.log(`${dim("Tags:")}     ${skill.tags.join(", ") || "—"}`);
  console.log(`${dim("Author:")}   ${skill.author || "—"}`);
  console.log(`${dim("Quality:")}  ${scoreLabel(score)}`);
  console.log("");
  console.log(body);
}

function cmdHelp() {
  console.log(`
${bold("openagentskills")} — browse and search AI agent skills from your terminal

${bold("USAGE")}
  openagentskills <command> [options]
  npx openagentskills <command> [options]

${bold("COMMANDS")}
  ${cyan("list")} [--category <cat>]    List all skills, optionally filtered by category
  ${cyan("search")} <query>             Search skills by name, description, or tags
  ${cyan("info")} <skill-name>          Show full details for a skill

${bold("EXAMPLES")}
  openagentskills list
  openagentskills list --category coding
  openagentskills search "api test"
  openagentskills info api-docs-generator

${bold("CATEGORIES")}
  coding · writing · productivity · devops · research · data

${bold("MORE")}
  Browse online: https://simplyutils.com/ai-resources
  GitHub:        https://github.com/Notysoty/openagentskills
`);
}

// ── Entry point ───────────────────────────────────────────────────────────────
const [, , command, ...rest] = process.argv;

switch (command) {
  case "list":    cmdList(rest);   break;
  case "search":  cmdSearch(rest); break;
  case "info":    cmdInfo(rest);   break;
  case "help":
  case "--help":
  case "-h":
  case undefined: cmdHelp();       break;
  default:
    console.error(`Unknown command: "${command}". Run "openagentskills --help" for usage.`);
    process.exit(1);
}
