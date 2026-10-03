# Personal Knowledge Base

Local-first desktop knowledge management built with Tauri 2, React, TypeScript, Vite, and Zustand. Notes remain portable Markdown files; the current release includes Vault and filesystem-backed Markdown editing foundations.

## Run

```bash
npm install
npm run dev
```

To open the desktop shell with Tauri:

```bash
npm run tauri dev
```

## Build and checks

```bash
npm run typecheck
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```

## Structure

- `src/app` — application shell
- `src/components` — reusable UI pieces
- `src/features` — feature-owned demo data and future behavior
- `src/services` — integration boundaries, currently contracts only
- `src/stores` — UI state (Zustand)
- `src/types` — domain and UI types
- `src-tauri` — Tauri 2 desktop host
- `docs` — architecture, data model, and roadmap

## Current functionality

- Runnable three-column light/dark/system themed shell
- Create/open Vault dialog, recursive Markdown file tree, Markdown source editor, and Properties panel
- Core Vault, note, metadata, and file-tree domain types
- Tauri filesystem commands with path containment checks, atomic writes, and `.trash` moves for deletion

The Vault is selected by a local folder path. Markdown frontmatter is parsed into note metadata. Database, search, tags, Wiki Links, templates, and AI features are not implemented yet.

## Roadmap

See [`docs/roadmap.md`](docs/roadmap.md). The next step is the Vault picker and filesystem-backed editor, after Foundation is reviewed.
