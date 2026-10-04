import type { NoteMetadata } from '../types/domain'

export function metadataTags(metadata: NoteMetadata): string[] {
  const value = metadata.tags
  return Array.isArray(value) ? value.filter((tag): tag is string => typeof tag === 'string') : []
}
