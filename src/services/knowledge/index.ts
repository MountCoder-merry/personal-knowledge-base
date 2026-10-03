import type { IndexedNote, KnowledgeNote, NoteMetadata, WikiLinkReference } from '../../types/domain'

export function extractWikiLinks(content: string): WikiLinkReference[] {
  return [...content.matchAll(/\[\[([^\]|#^]+)(?:\|([^\]]+))?\]\]/g)].map((match) => ({ raw: match[0], target: match[1].trim(), alias: match[2]?.trim() }))
}

export function normalizeTag(tag: string): string { return tag.replace(/^#/, '').trim().toLocaleLowerCase() }
export function noteTags(metadata: NoteMetadata): string[] { const tags = metadata.tags; return Array.isArray(tags) ? tags.filter((tag): tag is string => typeof tag === 'string') : typeof tags === 'string' ? tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [] }
export function indexedNote(note: KnowledgeNote): IndexedNote { return { runtimeKey: note.runtimeKey, id: note.id, relativePath: note.relativePath, fileName: note.relativePath.split(/[\\/]/).pop() ?? note.relativePath, title: note.title, metadata: note.metadata, content: note.content, tags: noteTags(note.metadata), outgoingLinks: extractWikiLinks(note.content) } }

export type WikiResolution = { status: 'resolved'; note: IndexedNote } | { status: 'unresolved' } | { status: 'ambiguous'; candidates: IndexedNote[] }
export function resolveWikiLink(target: string, notes: IndexedNote[]): WikiResolution {
  const normalized = target.trim().toLocaleLowerCase()
  const title = notes.filter((note) => note.title.trim().toLocaleLowerCase() === normalized)
  if (title.length === 1) return { status: 'resolved', note: title[0] }
  if (title.length > 1) return { status: 'ambiguous', candidates: title }
  const stem = notes.filter((note) => note.fileName.replace(/\.md$/i, '').toLocaleLowerCase() === normalized)
  if (stem.length === 1) return { status: 'resolved', note: stem[0] }
  if (stem.length > 1) return { status: 'ambiguous', candidates: stem }
  return { status: 'unresolved' }
}

export function backlinksFor(note: IndexedNote, notes: IndexedNote[]): IndexedNote[] { return notes.filter((candidate) => candidate.runtimeKey !== note.runtimeKey && candidate.outgoingLinks.some((link) => resolveWikiLink(link.target, notes).status === 'resolved' && (resolveWikiLink(link.target, notes) as { status: 'resolved'; note: IndexedNote }).note.runtimeKey === note.runtimeKey)) }

export interface SearchResult { note: IndexedNote; score: number; snippet: string }
export function searchNotes(query: string, notes: IndexedNote[]): SearchResult[] {
  const q = query.trim().toLocaleLowerCase(); if (!q) return []
  return notes.flatMap((note) => { const title = note.title.toLocaleLowerCase(); const tags = note.tags.map(normalizeTag); const haystack = `${note.content}\n${note.relativePath}\n${Object.values(note.metadata).join(' ')}`.toLocaleLowerCase(); let score = 0; if (title === q) score += 100; else if (title.includes(q)) score += 50; if (tags.some((tag) => tag.includes(q))) score += 30; if (haystack.includes(q)) score += 10; if (!score) return []; const index = haystack.indexOf(q); const snippet = index >= 0 ? haystack.slice(Math.max(0, index - 40), index + q.length + 80) : note.content.slice(0, 120); return [{ note, score, snippet }] }).sort((a, b) => b.score - a.score)
}
