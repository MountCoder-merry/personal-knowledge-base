import { describe, expect, it } from 'vitest'
import { metadataTags } from './metadata'

describe('metadataTags', () => {
  it('returns an empty list when tags are absent', () => {
    expect(metadataTags({ title: 'Untitled' })).toEqual([])
  })

  it('keeps valid string tags and ignores malformed values', () => {
    expect(metadataTags({ tags: ['react', 42 as never, null as never] })).toEqual(['react'])
  })
})
