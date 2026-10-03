import { describe, expect, it } from 'vitest'
import { sanitizeFilename } from '../knowledge/create'
import { inheritedTemplateMetadata, renderTemplate, templateContext } from './index'

describe('templates and creation helpers', () => {
  it('renders supported variables and preserves unknown ones', () => { const out = renderTemplate('{{title}} {{date}} {{unknown}}', templateContext('Test', 'id', '2026-10-03T20:00:00Z')); expect(out).toContain('Test'); expect(out).toContain('2026-10-03'); expect(out).toContain('{{unknown}}') })
  it('does not inherit template identity metadata', () => expect(inheritedTemplateMetadata({ id: 'old', createdAt: 'x', type: 'video' })).toEqual({ type: 'video' }))
  it('sanitizes filenames', () => expect(sanitizeFilename('A:B?.md')).toBe('AB.md'))
})
