import { describe, expect, it } from 'vitest'
import { parseMarkdown, serializeMarkdown } from './markdown'

const raw = { path: 'notes/test.md', content: `---\nid: abc\ntitle: Test\ntags:\n  - react\n  - tauri\ndraft: false\nrating: 5\nsource: null\n---\n\n# Test\n\nBody`, createdAt: '1', updatedAt: '2' }

describe('markdown frontmatter', () => {
  it('parses common YAML property types', () => {
    const note = parseMarkdown(raw)
    expect(note.id).toBe('abc')
    expect(note.metadata.tags).toEqual(['react', 'tauri'])
    expect(note.metadata.draft).toBe(false)
    expect(note.metadata.rating).toBe(5)
    expect(note.metadata.source).toBeNull()
  })
  it('round trips unchanged metadata when one property changes', () => {
    const note = parseMarkdown(raw)
    const next = parseMarkdown({ ...raw, content: serializeMarkdown({ ...note, title: 'Changed' }) })
    expect(next.title).toBe('Changed')
    expect(next.id).toBe('abc')
    expect(next.metadata.tags).toEqual(['react', 'tauri'])
    expect(next.metadata.rating).toBe(5)
    expect(next.metadata.source).toBeNull()
  })
  it('keeps missing ids runtime-only until save', () => {
    const note = parseMarkdown({ ...raw, content: '# No id\n\nBody' })
    expect(note.id).toBeNull()
    expect(note.runtimeKey).toBe('path:notes/test.md')
    expect(serializeMarkdown(note)).not.toContain('id:')
  })
  it('supports notes without frontmatter', () => {
    expect(parseMarkdown({ ...raw, content: '# Plain note\n\nBody' }).title).toBe('Plain note')
  })
})
