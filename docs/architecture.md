# Architecture

Personal Knowledge Base is a local-first desktop application. The frontend is intentionally split into UI, feature, domain, and service boundaries so filesystem and AI capabilities can grow without coupling them to React components.

```text
React UI
  ↓
Feature Layer
  ↓
Domain Types / State
  ↓
Services (filesystem boundary)
  ↓
Tauri Commands
  ↓
Local File System
```

The Foundation phase only implements the UI shell, demo state, domain types, and service contract. No filesystem operation is faked: the `FileSystemService` interface documents the future boundary and has no implementation yet.

Future retrieval architecture:

```text
Markdown → Parser → Chunker → Embedding → Vector Store → Retriever → LLM
```

The application remains Markdown-first and vendor-neutral. AI and retrieval are intentionally outside the current runtime.
