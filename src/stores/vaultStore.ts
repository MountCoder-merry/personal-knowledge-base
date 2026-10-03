import { create } from 'zustand'
import type { FileTreeNode, IndexedNote, KnowledgeNote, Vault } from '../types/domain'
import { buildKnowledgeIndex, createNote, movePath, openVault, readNote, refreshTree, renamePath, trashPath, writeNote } from '../services/filesystem/client'
import { searchNotes, type SearchResult } from '../services/knowledge/index'
import { ensurePermanentId, serializeMarkdown } from '../lib/markdown'
import { buildKnowledgeNote, quickCaptureRequest } from '../services/knowledge/create'

interface VaultState {
  currentVault: Vault | null
  fileTree: FileTreeNode[]
  notesByPath: Record<string, KnowledgeNote>
  selectedPath: string | null
  draftContent: string
  draftMetadata: KnowledgeNote['metadata']
  dirty: boolean
  knowledgeIndex: IndexedNote[]
  indexFailures: string[]
  loading: boolean
  error: string | null
  open: (path: string, create?: boolean, name?: string) => Promise<void>
  selectPath: (path: string) => Promise<void>
  setDraftContent: (content: string) => void
  setDraftMetadata: (metadata: KnowledgeNote['metadata']) => void
  saveSelected: () => Promise<void>
  create: (path: string, title: string) => Promise<void>
  createFromTemplate: (title: string, location: string, templatePath?: string) => Promise<void>
  createCapture: (content: string) => Promise<void>
  rename: (path: string, newName: string) => Promise<void>
  move: (path: string, destination: string) => Promise<void>
  remove: (path: string) => Promise<void>
  clearError: () => void
  navigateToNote: (path: string) => Promise<void>
  search: (query: string) => SearchResult[]
}

export const useVaultStore = create<VaultState>((set, get) => ({
  currentVault: null, fileTree: [], notesByPath: {}, selectedPath: null, draftContent: '', draftMetadata: {}, dirty: false, knowledgeIndex: [], indexFailures: [], loading: false, error: null,
  open: async (path, create = false, name) => {
    set({ loading: true, error: null })
    try { const snapshot = await openVault(path, create, name); const built = await buildKnowledgeIndex(snapshot.vault.rootPath, snapshot.tree); set({ currentVault: snapshot.vault, fileTree: snapshot.tree, knowledgeIndex: built.index, indexFailures: built.failures, selectedPath: null, notesByPath: {}, loading: false }) }
    catch (error) { set({ loading: false, error: String(error) }); throw error }
  },
  selectPath: async (path) => {
    const vault = get().currentVault
    if (!vault) return
    if (!path.toLowerCase().endsWith('.md')) return
    set({ loading: true, error: null, selectedPath: path })
    try { const note = await readNote(vault.rootPath, path); set((state) => ({ notesByPath: { ...state.notesByPath, [path]: note }, draftContent: note.content, draftMetadata: note.metadata, dirty: false, loading: false })) }
    catch (error) { set({ loading: false, error: String(error) }) }
  },
  setDraftContent: (draftContent) => set({ draftContent, dirty: true }),
  setDraftMetadata: (draftMetadata) => set({ draftMetadata, dirty: true }),
  saveSelected: async () => {
    const { currentVault, selectedPath, notesByPath, draftContent, draftMetadata } = get(); if (!currentVault || !selectedPath) return
    const note = notesByPath[selectedPath]; if (!note) return
    const next = { ...ensurePermanentId(note), title: typeof draftMetadata.title === 'string' ? draftMetadata.title : note.title, content: draftContent, metadata: draftMetadata, updatedAt: new Date().toISOString() }
    await writeNote(currentVault.rootPath, next); const tree = await refreshTree(currentVault.rootPath); const built = await buildKnowledgeIndex(currentVault.rootPath, tree); set({ fileTree: tree, knowledgeIndex: built.index, indexFailures: built.failures, notesByPath: { ...notesByPath, [selectedPath]: next }, draftContent: next.content, draftMetadata: next.metadata, dirty: false })
  },
  create: async (path, title) => {
    const vault = get().currentVault; if (!vault) return
    const note: KnowledgeNote = { id: crypto.randomUUID(), runtimeKey: `path:${path}`, relativePath: path, title, metadata: { type: 'knowledge', status: 'draft', tags: [] }, content: `# ${title}\n\n`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    await createNote(vault.rootPath, path, note); const tree = await refreshTree(vault.rootPath); const built = await buildKnowledgeIndex(vault.rootPath, tree); set({ fileTree: tree, knowledgeIndex: built.index, indexFailures: built.failures, notesByPath: { ...get().notesByPath, [path]: note }, selectedPath: path, draftContent: note.content, draftMetadata: note.metadata, dirty: false })
  },
  createCapture: async (content) => { const vault = get().currentVault; if (!vault) return; const built = buildKnowledgeNote(quickCaptureRequest({ content })); await createNote(vault.rootPath, built.path, built.note); const tree = await refreshTree(vault.rootPath); const indexed = await buildKnowledgeIndex(vault.rootPath, tree); set({ fileTree: tree, knowledgeIndex: indexed.index, indexFailures: indexed.failures }) },
  createFromTemplate: async (title, location, templatePath) => { const vault = get().currentVault; if (!vault) return; const template = templatePath ? await readNote(vault.rootPath, templatePath) : undefined; const built = buildKnowledgeNote({ title, location, template: templatePath ?? 'blank' }, template ? { path: templatePath!, content: serializeMarkdown(template) } : undefined); await createNote(vault.rootPath, built.path, built.note); const tree = await refreshTree(vault.rootPath); const indexed = await buildKnowledgeIndex(vault.rootPath, tree); set({ fileTree: tree, knowledgeIndex: indexed.index, indexFailures: indexed.failures, selectedPath: built.path, notesByPath: { ...get().notesByPath, [built.path]: built.note }, draftContent: built.note.content, draftMetadata: built.note.metadata, dirty: false }) },
  rename: async (path, newName) => { const vault = get().currentVault; if (!vault) return; await renamePath(vault.rootPath, path, newName); const tree = await refreshTree(vault.rootPath); const built = await buildKnowledgeIndex(vault.rootPath, tree); set({ fileTree: tree, knowledgeIndex: built.index, indexFailures: built.failures, selectedPath: get().selectedPath === path ? `${path.split('/').slice(0, -1).join('/')}/${newName}` : get().selectedPath }) },
  move: async (path, destination) => { const vault = get().currentVault; if (!vault) return; await movePath(vault.rootPath, path, destination); const tree = await refreshTree(vault.rootPath); const built = await buildKnowledgeIndex(vault.rootPath, tree); set({ fileTree: tree, knowledgeIndex: built.index, indexFailures: built.failures, selectedPath: null }) },
  remove: async (path) => { const vault = get().currentVault; if (!vault) return; await trashPath(vault.rootPath, path); const tree = await refreshTree(vault.rootPath); const built = await buildKnowledgeIndex(vault.rootPath, tree); set({ fileTree: tree, knowledgeIndex: built.index, indexFailures: built.failures, selectedPath: null }) },
  clearError: () => set({ error: null }),
  navigateToNote: async (path) => { const state = get(); if (state.dirty) { const choice = window.prompt('You have unsaved changes. Type Save, Discard, or Cancel.')?.toLowerCase(); if (choice === 'save') await state.saveSelected(); else if (choice !== 'discard') return } await get().selectPath(path) },
  search: (query) => searchNotes(query, get().knowledgeIndex),
}))
