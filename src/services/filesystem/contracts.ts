import type { KnowledgeNote, Vault } from '../../types/domain'

/** Boundary for future local filesystem integration. Implementations belong outside the UI layer. */
export interface FileSystemService {
  openVault(path: string): Promise<Vault>
  readNote(path: string): Promise<KnowledgeNote>
  writeNote(note: KnowledgeNote): Promise<void>
  renameNote(noteId: string, nextPath: string): Promise<void>
  moveNote(noteId: string, nextDirectory: string): Promise<void>
  deleteNote(noteId: string): Promise<void>
}
