import type { KnowledgeNote } from './domain'

/** The source used to create a new note. `blank` is always available. */
export type NoteTemplateRef = 'blank' | string

export type CreateNoteKind = 'new' | 'capture' | 'wiki'
export type CreateConflictStrategy = 'error' | 'suffix'

/**
 * Input shared by the New Note dialog, Quick Capture and missing Wiki Links.
 * The request deliberately contains no UI state or Vault root path.
 */
export interface CreateKnowledgeNoteRequest {
  title?: string
  location?: string
  template?: NoteTemplateRef | null
  kind?: CreateNoteKind
  content?: string
  now?: Date | string
  conflict?: CreateConflictStrategy
}

export interface CreateCaptureRequest {
  content: string
  now?: Date | string
  conflict?: CreateConflictStrategy
}

export interface CreatedKnowledgeNote {
  path: string
  note: KnowledgeNote
  templatePath?: string
}

export interface TemplateOption {
  id: string
  name: string
  path?: string
}
