# Data Model

## Vault

`Vault` identifies a user-selected knowledge directory with a stable application id, display name, and root path. The current demo store contains a non-persistent placeholder Vault.

## KnowledgeNote

`KnowledgeNote` represents a Markdown note. Its stable `id` is independent of the path and is reserved for future indexing, chunking, and RAG references. `path` is the relative path inside a Vault. `metadata` is extensible and is not coupled to React state.

## Metadata

`NoteMetadata` is a string-keyed map of strings, numbers, booleans, string arrays, or null. This supports frontmatter-compatible values while leaving room for custom properties. The current Properties panel edits demo metadata in memory only.

## FileTreeNode

`FileTreeNode` describes a folder, Markdown note, or asset. It is a view-neutral representation that can later be produced by the filesystem service. The current tree is demonstration data and is not read from disk.
