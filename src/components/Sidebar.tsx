import { ChevronDown, ChevronRight, FileText, Folder, Inbox, Plus, Pencil, FolderInput, Trash2 } from 'lucide-react'
import { useEffect, useState, type MouseEvent } from 'react'
import { useVaultStore } from '../stores/vaultStore'
import { useUIStore } from '../stores/uiStore'
import type { FileTreeNode } from '../types/domain'
import { FileActionDialog, type FileAction } from './FileActionDialog'

function TreeNode({ node, depth = 0, onSelect, onContextMenu }: { node: FileTreeNode; depth?: number; onSelect: (path: string) => void; onContextMenu: (event: MouseEvent, node: FileTreeNode) => void }) {
  const [expanded, setExpanded] = useState(depth === 0)
  const isFolder = node.kind === 'folder'
  return <div>
    <button className="tree-row" style={{ paddingLeft: `${12 + depth * 16}px` }} onClick={() => isFolder ? setExpanded(!expanded) : onSelect(node.path)} onContextMenu={(event) => onContextMenu(event, node)}>
      {isFolder ? (expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <FileText size={14} />}
      {isFolder ? <Folder size={15} className="folder-icon" /> : null}<span>{node.name}</span>
    </button>
    {expanded && node.children?.map((child) => <TreeNode key={child.id} node={child} depth={depth + 1} onSelect={onSelect} onContextMenu={onContextMenu} />)}
  </div>
}

export function Sidebar() {
  const { currentVault, fileTree, selectedPath, loading, create, rename, move, remove, knowledgeIndex, navigateToNote } = useVaultStore()
  const setInboxOpen = useUIStore((state) => state.setInboxOpen)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: FileTreeNode } | null>(null)
  const [fileAction, setFileAction] = useState<{ action: FileAction; node: FileTreeNode } | null>(null)
  const tagCounts = knowledgeIndex.flatMap((note) => note.tags).reduce<Record<string, number>>((counts, tag) => { const key = tag.toLocaleLowerCase(); counts[key] = (counts[key] ?? 0) + 1; return counts }, {})
  const createDemoNote = () => { const title = window.prompt('Note title'); if (title) void create(`${title.replace(/[^a-z0-9-_ ]/gi, '').trim().replaceAll(' ', '-') || 'untitled'}.md`, title.trim()) }
  useEffect(() => {
    const closeMenu = () => setContextMenu(null)
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setContextMenu(null); setFileAction(null) } }
    window.addEventListener('pointerdown', closeMenu)
    window.addEventListener('keydown', closeOnEscape)
    return () => { window.removeEventListener('pointerdown', closeMenu); window.removeEventListener('keydown', closeOnEscape) }
  }, [])
  const openContextMenu = (event: MouseEvent, node: FileTreeNode) => { event.preventDefault(); event.stopPropagation(); setContextMenu({ x: Math.max(8, Math.min(event.clientX, window.innerWidth - 204)), y: Math.max(8, Math.min(event.clientY, window.innerHeight - 150)), node }) }
  const startAction = (action: FileAction) => { if (!contextMenu) return; setFileAction({ action, node: contextMenu.node }); setContextMenu(null) }
  const submitFileAction = async (value: string) => {
    if (!fileAction) return
    const { action, node } = fileAction
    if (action === 'rename') {
      const trimmed = value.trim()
      const nextName = node.kind === 'note' && !trimmed.toLowerCase().endsWith('.md') ? `${trimmed}.md` : trimmed
      await rename(node.path, nextName)
    } else if (action === 'move') await move(node.path, value.trim())
    else await remove(node.path)
  }
  return <aside className="sidebar">
    <div className="sidebar-heading"><span>EXPLORER</span><button className="icon-button" aria-label="Create note" onClick={createDemoNote}><Plus size={16} /></button></div>
    <button className="inbox-link" onClick={() => setInboxOpen(true)}><Inbox size={15} /><span>Inbox</span><span className="item-count">{knowledgeIndex.filter((note) => note.relativePath.startsWith('00-Inbox/')).length}</span></button><div className="vault-label"><span>{currentVault?.name}</span></div>
    <div className="tree-root">{fileTree.map((node) => <TreeNode key={node.id} node={node} onSelect={(path) => void navigateToNote(path)} onContextMenu={openContextMenu} />)}</div>
    <div className="nav-section"><div className="nav-title">TAGS</div>{Object.entries(tagCounts).sort().map(([tag, count]) => <button className="tag-nav" key={tag} onClick={() => { const note = knowledgeIndex.find((item) => item.tags.some((value) => value.toLocaleLowerCase() === tag)); if (note) void navigateToNote(note.relativePath) }}>#{tag}<span>{count}</span></button>)}</div>
    {loading && <div className="tree-status">Loading…</div>}
    {selectedPath && <div className="tree-status">{selectedPath}</div>}
    {contextMenu && <div className="file-context-menu" style={{ left: contextMenu.x, top: contextMenu.y }} role="menu" onPointerDown={(event) => event.stopPropagation()}><button className="context-menu-item" onClick={() => startAction('rename')}><Pencil size={15} />Rename</button><button className="context-menu-item" onClick={() => startAction('move')}><FolderInput size={15} />Move</button><div className="context-menu-divider" /><button className="context-menu-item is-danger" onClick={() => startAction('delete')}><Trash2 size={15} />Move to trash</button></div>}
    {fileAction && <FileActionDialog action={fileAction.action} node={fileAction.node} onClose={() => setFileAction(null)} onSubmit={submitFileAction} />}
  </aside>
}
