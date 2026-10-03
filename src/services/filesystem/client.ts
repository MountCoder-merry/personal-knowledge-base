import { invoke } from '@tauri-apps/api/core'
import type { FileTreeNode, IndexedNote, KnowledgeNote, RawNote, VaultSnapshot } from '../../types/domain'
import { indexedNote } from '../knowledge/index'
import { parseMarkdown, serializeMarkdown } from '../../lib/markdown'

export async function openVault(path: string, create = false, name?: string): Promise<VaultSnapshot> {
  return invoke<VaultSnapshot>('open_vault', { path, create, name })
}

export async function readNote(rootPath: string, path: string): Promise<KnowledgeNote> {
  const raw = await invoke<RawNote>('read_note', { rootPath, path })
  return parseMarkdown(raw)
}

export async function refreshTree(rootPath: string): Promise<FileTreeNode[]> {
  return invoke<FileTreeNode[]>('read_file_tree', { rootPath })
}

export async function writeNote(rootPath: string, note: KnowledgeNote): Promise<void> {
  await invoke('write_note', { rootPath, path: note.relativePath, content: serializeMarkdown(note) })
}

export async function createNote(rootPath: string, path: string, note: KnowledgeNote): Promise<void> {
  await invoke('create_note', { rootPath, path, content: serializeMarkdown(note) })
}

export async function renamePath(rootPath: string, path: string, newName: string): Promise<void> {
  await invoke('rename_path', { rootPath, path, newName })
}

export async function movePath(rootPath: string, path: string, destination: string): Promise<void> {
  await invoke('move_path', { rootPath, path, destination })
}

export async function trashPath(rootPath: string, path: string): Promise<void> {
  await invoke('trash_path', { rootPath, path })
}

function notePaths(nodes: FileTreeNode[]): string[] { return nodes.flatMap((node) => node.kind === 'note' ? [node.path] : node.children ? notePaths(node.children) : []) }
export async function buildKnowledgeIndex(rootPath: string, tree: FileTreeNode[]): Promise<{ index: IndexedNote[]; failures: string[] }> {
  const results = await Promise.all(notePaths(tree).map(async (path) => { try { return indexedNote(await readNote(rootPath, path)) } catch { return { failure: path } } }))
  return { index: results.filter((item): item is IndexedNote => 'runtimeKey' in item), failures: results.filter((item): item is { failure: string } => 'failure' in item).map((item) => item.failure) }
}
