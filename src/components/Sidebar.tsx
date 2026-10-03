import { ChevronDown, ChevronRight, FileText, Folder, Inbox, Plus } from 'lucide-react'
import { useState } from 'react'
import { useVaultStore } from '../stores/vaultStore'
import { useUIStore } from '../stores/uiStore'
import type { FileTreeNode } from '../types/domain'

function TreeNode({ node, depth = 0, onSelect, onRename, onMove, onDelete }: { node: FileTreeNode; depth?: number; onSelect: (path: string) => void; onRename: (path: string, name: string) => void; onMove: (path: string, destination: string) => void; onDelete: (path: string) => void }) {
  const [expanded, setExpanded] = useState(depth === 0)
  const isFolder = node.kind === 'folder'
  return <div>
    <button className="tree-row" style={{ paddingLeft: `${12 + depth * 16}px` }} onClick={() => isFolder ? setExpanded(!expanded) : onSelect(node.path)} onContextMenu={(event) => { event.preventDefault(); const action = window.prompt(`Action for ${node.name}: rename, move, delete`); if (action === 'rename') { const name = window.prompt('New name', node.name); if (name) onRename(node.path, name) } else if (action === 'move') { const destination = window.prompt('Destination folder path relative to Vault', ''); if (destination !== null) onMove(node.path, destination) } else if (action === 'delete' && window.confirm('Move this item to the Vault trash?')) onDelete(node.path) }}>
      {isFolder ? (expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <FileText size={14} />}
      {isFolder ? <Folder size={15} className="folder-icon" /> : null}<span>{node.name}</span>
    </button>
    {expanded && node.children?.map((child) => <TreeNode key={child.id} node={child} depth={depth + 1} onSelect={onSelect} onRename={onRename} onMove={onMove} onDelete={onDelete} />)}
  </div>
}

export function Sidebar() {
  const { currentVault, fileTree, selectedPath, loading, create, rename, move, remove, knowledgeIndex, navigateToNote } = useVaultStore()
  const setInboxOpen = useUIStore((state) => state.setInboxOpen)
  const tagCounts = knowledgeIndex.flatMap((note) => note.tags).reduce<Record<string, number>>((counts, tag) => { const key = tag.toLocaleLowerCase(); counts[key] = (counts[key] ?? 0) + 1; return counts }, {})
  const createDemoNote = () => { const title = window.prompt('Note title'); if (title) void create(`${title.replace(/[^a-z0-9-_ ]/gi, '').trim().replaceAll(' ', '-') || 'untitled'}.md`, title.trim()) }
  return <aside className="sidebar">
    <div className="sidebar-heading"><span>EXPLORER</span><button className="icon-button" aria-label="Create note" onClick={createDemoNote}><Plus size={16} /></button></div>
    <button className="inbox-link" onClick={() => setInboxOpen(true)}><Inbox size={15} /><span>Inbox</span><span className="item-count">{knowledgeIndex.filter((note) => note.relativePath.startsWith('00-Inbox/')).length}</span></button><div className="vault-label"><span>{currentVault?.name}</span></div>
    <div className="tree-root">{fileTree.map((node) => <TreeNode key={node.id} node={node} onSelect={(path) => void navigateToNote(path)} onRename={(path, name) => void rename(path, name)} onMove={(path, destination) => void move(path, destination)} onDelete={(path) => void remove(path)} />)}</div>
    <div className="nav-section"><div className="nav-title">TAGS</div>{Object.entries(tagCounts).sort().map(([tag, count]) => <button className="tag-nav" key={tag} onClick={() => { const note = knowledgeIndex.find((item) => item.tags.some((value) => value.toLocaleLowerCase() === tag)); if (note) void navigateToNote(note.relativePath) }}>#{tag}<span>{count}</span></button>)}</div>
    {loading && <div className="tree-status">Loading…</div>}
    {selectedPath && <div className="tree-status">{selectedPath}</div>}
  </aside>
}
