export type PropertyValue = string | number | boolean | string[] | null

export interface NoteMetadata {
  [key: string]: PropertyValue
}

export interface KnowledgeNote {
  id: string | null
  runtimeKey: string
  relativePath: string
  title: string
  metadata: NoteMetadata
  content: string
  createdAt: string
  updatedAt: string
}

export interface NoteDescriptor {
  relativePath: string
  fileName: string
  title: string
  runtimeKey: string
}

export interface Vault {
  id: string
  name: string
  rootPath: string
}

export interface RecentVault {
  path: string
  name: string
  lastOpenedAt: string
}

export interface WikiLinkReference { raw: string; target: string; alias?: string }
export interface IndexedNote {
  runtimeKey: string
  id: string | null
  relativePath: string
  fileName: string
  title: string
  metadata: NoteMetadata
  content: string
  tags: string[]
  outgoingLinks: WikiLinkReference[]
}

export type FileTreeNodeKind = 'folder' | 'note' | 'asset'

export interface FileTreeNode {
  id: string
  name: string
  kind: FileTreeNodeKind
  path: string
  children?: FileTreeNode[]
}

export interface VaultSnapshot {
  vault: Vault
  tree: FileTreeNode[]
}

export interface RawNote {
  path: string
  content: string
  createdAt: string
  updatedAt: string
}
