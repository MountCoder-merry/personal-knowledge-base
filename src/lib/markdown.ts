import { parse, stringify } from 'yaml'
import type { KnowledgeNote, NoteMetadata, PropertyValue, RawNote } from '../types/domain'

export type VaultErrorCode = 'NOT_FOUND' | 'PERMISSION_DENIED' | 'PATH_OUTSIDE_VAULT' | 'ALREADY_EXISTS' | 'INVALID_NAME' | 'IO_ERROR' | 'INVALID_MARKDOWN' | 'UNSUPPORTED_METADATA'

export class MarkdownError extends Error {
  constructor(public readonly code: VaultErrorCode, message: string) { super(message); this.name = 'MarkdownError' }
}

function toPropertyValue(value: unknown, key: string): PropertyValue {
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value
  if (Array.isArray(value) && value.every((item) => typeof item === 'string')) return value as string[]
  throw new MarkdownError('UNSUPPORTED_METADATA', `Unsupported frontmatter value for '${key}'`)
}

function splitFrontmatter(content: string): { metadata: NoteMetadata; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!match) return { metadata: {}, body: content }
  let parsed: unknown
  try { parsed = parse(match[1]) } catch (error) { throw new MarkdownError('INVALID_MARKDOWN', `Invalid YAML frontmatter: ${String(error)}`) }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) throw new MarkdownError('INVALID_MARKDOWN', 'Frontmatter must be a YAML mapping')
  const metadata: NoteMetadata = {}
  for (const [key, value] of Object.entries(parsed)) metadata[key] = toPropertyValue(value, key)
  return { metadata, body: content.slice(match[0].length) }
}

export function parseMarkdown(raw: RawNote): KnowledgeNote {
  const { metadata, body } = splitFrontmatter(raw.content)
  const heading = body.match(/^#\s+(.+)$/m)
  const title = String(metadata.title ?? heading?.[1] ?? raw.path.split(/[\\/]/).pop()?.replace(/\.md$/i, '') ?? 'Untitled')
  const permanentId = typeof metadata.id === 'string' && metadata.id.trim() ? metadata.id : null
  return { id: permanentId, runtimeKey: `path:${raw.path.replaceAll('\\', '/')}`, relativePath: raw.path, title, metadata, content: body.replace(/^\r?\n/, ''), createdAt: raw.createdAt, updatedAt: raw.updatedAt }
}

export function serializeMarkdown(note: KnowledgeNote): string {
  const metadata: NoteMetadata = { ...note.metadata, title: note.title }
  if (note.id) metadata.id = note.id
  const frontmatter = stringify(metadata, { lineWidth: 0 }).trimEnd()
  return `---\n${frontmatter}\n---\n\n${note.content.replace(/^\s+/, '')}\n`
}

export function ensurePermanentId(note: KnowledgeNote): KnowledgeNote { return note.id ? note : { ...note, id: crypto.randomUUID() } }
