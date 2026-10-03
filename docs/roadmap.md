# Roadmap

## Phase 1 — Foundation (complete)

- Tauri 2, React, TypeScript, Vite, npm
- Domain types and Zustand UI state
- Three-column UI skeleton
- Theme preference support
- Filesystem service contract

## Phase 2 — Knowledge Editor (current)

- Create or open a local Vault
- Recursive Markdown and asset tree
- Frontmatter parsing and Markdown source editing
- Atomic note writes
- Safe rename/move operations and `.trash` deletion

## Phase 3 — Knowledge Organization

- Tags, Wiki Links, templates, Inbox workflows, and assets

## Phase 4 — Knowledge Navigation (current)

- In-memory full-text index and ranked search
- Tag counts and tag navigation
- Wiki Links with resolved, unresolved, and ambiguous states
- Derived backlinks
- Index failures isolated per note

Known compatibility debt: `PropertyValue` currently supports only string, number, boolean, string array, and null. Future versions should preserve unknown/nested YAML values instead of normalizing them away. Rename does not automatically rewrite Wiki Link references, and there is no file watcher yet.

## Phase 4 — Search

- Full-text indexing and search UI

## Phase 5 — Knowledge Graph

- Backlinks, outgoing links, and graph view

## Phase 6 — AI

- Parsing, chunking, embeddings, vector store, retrieval, and optional LLM assistant
