import type { FileTreeNode, KnowledgeNote } from '../../types/domain'

export const demoFileTree: FileTreeNode[] = [
  { id: 'inbox', name: 'Inbox', kind: 'folder', path: '00-Inbox' },
  {
    id: 'programming', name: 'Programming', kind: 'folder', path: '01-Programming', children: [
      { id: 'react', name: 'React', kind: 'folder', path: '01-Programming/React' },
      { id: 'typescript', name: 'TypeScript', kind: 'folder', path: '01-Programming/TypeScript' },
      { id: 'ai', name: 'AI', kind: 'folder', path: '01-Programming/AI' },
    ],
  },
  {
    id: 'outdoor', name: 'Outdoor', kind: 'folder', path: '02-Outdoor', children: [
      { id: 'hiking', name: 'Hiking', kind: 'folder', path: '02-Outdoor/Hiking' },
      { id: 'mountaineering', name: 'Mountaineering', kind: 'folder', path: '02-Outdoor/Mountaineering' },
    ],
  },
  { id: 'photography', name: 'Photography', kind: 'folder', path: '03-Photography' },
]

export const demoNote: KnowledgeNote = {
  id: 'welcome-note',
  runtimeKey: 'path:00-Inbox/welcome.md',
  relativePath: '00-Inbox/welcome.md',
  title: 'Welcome',
  metadata: {
    category: 'Getting Started',
    topic: 'Personal Knowledge Base',
    type: 'knowledge',
    status: 'draft',
    tags: ['welcome', 'foundation'],
    source: null,
  },
  content: '# Welcome\n\nThis is your Personal Knowledge Base.\n\nUse the sidebar to organise ideas, references, and things you want to remember.',
  createdAt: '2026-10-03T00:00:00.000Z',
  updatedAt: '2026-10-03T00:00:00.000Z',
}
