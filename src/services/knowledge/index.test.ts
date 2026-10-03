import { describe, expect, it } from 'vitest'
import { backlinksFor, extractWikiLinks, indexedNote, normalizeTag, resolveWikiLink, searchNotes } from './index'
import type { KnowledgeNote } from '../../types/domain'

const make = (path: string, title: string, content: string, tags: string[] = []): KnowledgeNote => ({ id: path, runtimeKey: `path:${path}`, relativePath: path, title, metadata: { tags }, content, createdAt: '', updatedAt: '' })

describe('knowledge index helpers', () => {
  const ice = indexedNote(make('ice.md', 'Ice Axe', 'Self arrest technique', ['Hiking']))
  const basics = indexedNote(make('basics.md', 'Basics', 'Read [[Ice Axe|ice tool]]'))
  it('parses wiki links and aliases', () => expect(extractWikiLinks(basics.content)).toEqual([{ raw: '[[Ice Axe|ice tool]]', target: 'Ice Axe', alias: 'ice tool' }]))
  it('resolves existing and ambiguous titles', () => { expect(resolveWikiLink('Ice Axe', [ice]).status).toBe('resolved'); expect(resolveWikiLink('Missing', [ice]).status).toBe('unresolved'); expect(resolveWikiLink('Ice Axe', [ice, indexedNote(make('other.md', 'Ice Axe', ''))]).status).toBe('ambiguous') })
  it('builds backlinks and normalizes tags', () => { expect(backlinksFor(ice, [ice, basics]).map((note) => note.title)).toEqual(['Basics']); expect(normalizeTag('#HIKING')).toBe('hiking') })
  it('ranks title and finds content case-insensitively', () => { const result = searchNotes('ice axe', [ice, basics]); expect(result[0].note.title).toBe('Ice Axe'); expect(searchNotes('TECHNIQUE', [ice]).length).toBe(1); expect(searchNotes('', [ice])).toEqual([]) })
})
