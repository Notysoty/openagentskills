# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-03-28

### Added
- CLI tool (`bin/cli.js`) — search, list, and inspect skills from the terminal via `npx openagentskills`
- `package.json` — makes the repo installable as an npm package (`npm install -g openagentskills`)
- `registry.json` — auto-generated machine-readable index of all skills for programmatic access
- `CODE_OF_CONDUCT.md` — community standards using the Contributor Covenant
- `SECURITY.md` — responsible disclosure policy
- `LICENSE` — MIT license file
- `CHANGELOG.md` — this file

### Changed
- README updated with CLI usage section and installation instructions

### Fixed
- Resolves [#1](https://github.com/Notysoty/openagentskills/issues/1) — CLI search command for local skill discovery

---

## [1.0.0] - 2026-03-01

### Added
- Initial library of 50 AI agent skills across 6 categories (coding, writing, data, devops, research, productivity)
- Consistent `SKILL.md` format with YAML frontmatter (`name`, `description`, `category`, `tags`, `author`)
- `CONTRIBUTING.md` with contribution guidelines and skill quality standards
- `scripts/validate-skills.js` — CI validation of skill frontmatter on every PR
- Skills work across Claude Code, Cursor, Codex, Cline, Antigravity, and more
