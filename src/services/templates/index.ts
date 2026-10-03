import { parseMarkdown } from '../../lib/markdown'
import type { FileTreeNode, KnowledgeNote, NoteMetadata, RawNote } from '../../types/domain'
import type { TemplateOption } from '../../types/create'

export const TEMPLATE_DIRECTORY = '90-Templates'

export interface TemplateContext {
  title: string
  date: string
  datetime: string
  id: string
}

export interface TemplateDocument {
  path: string
  content: string
}

export interface TemplateDescriptor extends TemplateOption {
  path: string
  relativePath: string
}

/** Values understood by the intentionally small, non-executable template language. */
export const TEMPLATE_VARIABLES = ['title', 'date', 'datetime', 'id'] as const

function asDate(value: Date | string | undefined): Date {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value ?? Date.now())
  if (Number.isNaN(date.getTime())) throw new TypeError(`Invalid date: ${String(value)}`)
  return date
}

const pad = (value: number): string => String(value).padStart(2, '0')

/** ISO calendar date used in template variables and capture titles. */
export function formatDate(value: Date | string | undefined = new Date()): string {
  // If a caller passes an ISO string with a date component, preserve that calendar date.
  // This avoids a surprising previous-day result when a +08:00 timestamp is parsed on UTC.
  if (typeof value === 'string') {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/)
    if (match) return match[1]
  }
  const date = asDate(value)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Canonical machine timestamp used in generated metadata. */
export function formatDateTime(value: Date | string | undefined = new Date()): string {
  return asDate(value).toISOString()
}

/** Windows-safe timestamp prefix for Quick Capture filenames. */
export function formatFilenameDateTime(value: Date | string | undefined = new Date()): string {
  const date = asDate(value)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}-${pad(date.getMinutes())}`
}

/**
 * Render only the four documented variables. Unknown variables stay untouched so
 * users do not lose future/custom placeholders when editing a template.
 */
export function renderTemplate(template: string, context: TemplateContext): string {
  return template.replace(/\{\{\s*([a-zA-Z][\w.-]*)\s*\}\}/g, (whole, name: string) => {
    if (!TEMPLATE_VARIABLES.includes(name as (typeof TEMPLATE_VARIABLES)[number])) return whole
    return context[name as keyof TemplateContext]
  })
}

export function templateContext(title: string, id: string, now: Date | string | undefined = new Date()): TemplateContext {
  return { title, id, date: formatDate(now), datetime: formatDateTime(now) }
}

function normalizePath(path: string): string {
  return path.replaceAll('\\', '/').replace(/^\.\//, '').replace(/\/+$/, '')
}

function isTemplatePath(path: string): boolean {
  const normalized = normalizePath(path)
  const prefix = `${TEMPLATE_DIRECTORY}/`
  return normalized.startsWith(prefix) && normalized.toLowerCase().endsWith('.md')
}

function flatten(nodes: FileTreeNode[]): FileTreeNode[] {
  return nodes.flatMap((node) => [node, ...(node.children ? flatten(node.children) : [])])
}

/** Return Markdown files under 90-Templates from the already-loaded Vault tree. */
export function listTemplateDescriptors(nodes: FileTreeNode[]): TemplateDescriptor[] {
  return flatten(nodes)
    .filter((node) => node.kind === 'note' && isTemplatePath(node.path))
    .map((node) => {
      const path = normalizePath(node.path)
      const name = path.split('/').pop() ?? path
      return { id: path, name: name.replace(/\.md$/i, ''), path, relativePath: path }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

/** Read and parse a template as a normal Markdown note without exposing its identity. */
export function parseTemplate(document: TemplateDocument): { metadata: NoteMetadata; content: string; title: string } {
  const raw: RawNote = { path: document.path, content: document.content, createdAt: '', updatedAt: '' }
  const note = parseMarkdown(raw)
  return { metadata: { ...note.metadata }, content: note.content, title: note.title }
}

/**
 * Remove fields that must never be copied from a template into a new note.
 * The caller adds a fresh identity and timestamps after inheritance.
 */
export function inheritedTemplateMetadata(metadata: NoteMetadata): NoteMetadata {
  const next: NoteMetadata = { ...metadata }
  delete next.id
  delete next.createdAt
  delete next.updatedAt
  delete next.title
  return next
}

export const DEFAULT_TEMPLATES: readonly TemplateDocument[] = [
  {
    path: `${TEMPLATE_DIRECTORY}/Knowledge Note.md`,
    content: `---\ntype: knowledge\nstatus: null\ntags: []\nsource: null\n---\n\n# {{title}}\n\n## Definition\n\n## Key Points\n\n## Examples\n\n## Common Mistakes\n\n## Related\n\n[[ ]]\n`,
  },
  {
    path: `${TEMPLATE_DIRECTORY}/Video Note.md`,
    content: `---\ntype: video\nstatus: inbox\ntags:\n  - youtube\nsource: null\nauthor: null\n---\n\n# {{title}}\n\n## Summary\n\n## Key Knowledge\n\n## What I Learned\n\n## Practical Use\n\n## Content Ideas\n\n## Related\n\n[[ ]]\n`,
  },
  {
    path: `${TEMPLATE_DIRECTORY}/Project Note.md`,
    content: `---\ntype: project\nstatus: active\ntags: []\n---\n\n# {{title}}\n\n## Goal\n\n## Current Status\n\n## Tasks\n\n## Decisions\n\n## Problems\n\n## Notes\n\n## Related\n`,
  },
]

export interface DefaultTemplateWriter {
  exists(path: string): boolean | Promise<boolean>
  write(path: string, content: string): Promise<void>
}

/** Explicit opt-in helper; it never overwrites an existing template. */
export async function createDefaultTemplates(writer: DefaultTemplateWriter): Promise<{ created: string[]; skipped: string[] }> {
  const created: string[] = []
  const skipped: string[] = []
  for (const template of DEFAULT_TEMPLATES) {
    if (await writer.exists(template.path)) {
      skipped.push(template.path)
      continue
    }
    await writer.write(template.path, template.content)
    created.push(template.path)
  }
  return { created, skipped }
}

/** Convert a loaded template to a descriptor useful for picker UIs. */
export function templateOption(path: string): TemplateOption {
  const normalized = normalizePath(path)
  const name = normalized.split('/').pop()?.replace(/\.md$/i, '') ?? normalized
  return { id: normalized, name, path: normalized }
}

export type { KnowledgeNote }
