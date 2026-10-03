import type { KnowledgeNote } from '../../types/domain'
import type { CreateCaptureRequest, CreateKnowledgeNoteRequest, CreatedKnowledgeNote } from '../../types/create'
import { inheritedTemplateMetadata, parseTemplate, renderTemplate, templateContext, type TemplateDocument } from '../templates'

export function sanitizeFilename(title: string): string { const value = title.replace(/[<>:"/\\|?*]/g, '').replace(/[. ]+$/g, '').trim(); if (!value) throw new Error('A title is required'); return value.slice(0, 180) }
export function quickCaptureRequest(request: CreateCaptureRequest): CreateKnowledgeNoteRequest { const title = request.content.trim().split(/\r?\n/)[0].slice(0, 80) || 'Capture'; return { title, content: request.content.trim(), location: '00-Inbox', kind: 'capture', conflict: request.conflict ?? 'suffix', now: request.now } }
export function buildKnowledgeNote(request: CreateKnowledgeNoteRequest, template?: TemplateDocument): CreatedKnowledgeNote {
  const title = request.title?.trim() || 'Untitled'; const id = crypto.randomUUID(); const now = request.now ?? new Date(); const location = (request.location?.replace(/[\\/]+$/, '') || '00-Inbox').replaceAll('\\', '/')
  const base = template ? parseTemplate(template) : { metadata: {}, content: `# {{title}}\n` }
  const metadata = { ...inheritedTemplateMetadata(base.metadata), id, title, createdAt: templateContext(title, id, now).datetime, updatedAt: templateContext(title, id, now).datetime, ...(request.kind === 'capture' ? { type: 'capture', status: 'inbox' } : {}) }
  const content = request.content?.trim() ? `# ${title}\n\n${request.content.trim()}\n` : renderTemplate(base.content, templateContext(title, id, now))
  const filename = sanitizeFilename(title)
  return { path: `${location}/${filename}.md`, templatePath: template?.path, note: { id, runtimeKey: `path:${location}/${filename}.md`, relativePath: `${location}/${filename}.md`, title, metadata, content, createdAt: metadata.createdAt, updatedAt: metadata.updatedAt } }
}
