import { useVaultStore } from '../stores/vaultStore'
import { backlinksFor, resolveWikiLink, type WikiResolution } from '../services/knowledge/index'
import { useState } from 'react'

export function PropertiesPanel() {
  const { selectedPath, notesByPath, draftMetadata, setDraftMetadata, knowledgeIndex, navigateToNote, createFromTemplate } = useVaultStore()
  const note = selectedPath ? notesByPath[selectedPath] : undefined
  const [ambiguous, setAmbiguous] = useState<{ target: string; candidates: Extract<WikiResolution, { status: 'ambiguous' }> } | null>(null)
  const metadata = draftMetadata
  if (!note) return <aside className="properties-panel"><div className="panel-heading"><span>PROPERTIES</span></div><div className="properties-note">Select a note to view its metadata.</div></aside>
  const update = (key: string, value: string) => setDraftMetadata({ ...metadata, [key]: value })
  const indexed = knowledgeIndex.find((item) => item.relativePath === note.relativePath)
  const outgoing = indexed?.outgoingLinks ?? []
  const backlinks = indexed ? backlinksFor(indexed, knowledgeIndex) : []
  const createMissing = (target: string) => { if (!window.confirm(`Create "${target}"?`)) return; const safe = target.replace(/[\\/:*?"<>|]/g, '').trim() || 'Untitled'; void createFromTemplate(safe, '00-Inbox') }
  return <aside className="properties-panel"><div className="panel-heading"><span>PROPERTIES</span><span className="panel-muted">FRONTMATTER</span></div><div className="property-form">
    <label>Title<input value={String(metadata.title ?? note.title)} onChange={(e) => update('title', e.target.value)} /></label>
    <label>Category<input value={String(metadata.category ?? '')} onChange={(e) => update('category', e.target.value)} /></label>
    <label>Topic<input value={String(metadata.topic ?? '')} onChange={(e) => update('topic', e.target.value)} /></label>
    <label>Type<select value={String(metadata.type ?? '')} onChange={(e) => update('type', e.target.value)}><option>knowledge</option><option>reference</option><option>project</option></select></label>
    <label>Status<select value={String(metadata.status ?? '')} onChange={(e) => update('status', e.target.value)}><option>draft</option><option>inbox</option><option>processed</option></select></label>
    <label>Tags<div className="tag-list">{(metadata.tags as string[]).map((tag) => <span className="tag" key={tag}>#{tag}</span>)}</div></label>
    <label>Source<input placeholder="Add a source URL" value={String(metadata.source ?? '')} onChange={(e) => update('source', e.target.value)} /></label>
  </div><div className="knowledge-links"><div className="link-heading">OUTGOING LINKS</div>{outgoing.length ? outgoing.map((link) => { const resolution = resolveWikiLink(link.target, knowledgeIndex); return <button className="knowledge-link" key={link.raw} onClick={() => resolution.status === 'resolved' ? void navigateToNote(resolution.note.relativePath) : resolution.status === 'unresolved' ? createMissing(link.target) : setAmbiguous({ target: link.target, candidates: resolution })}>{link.alias ?? link.target}{resolution.status === 'ambiguous' ? ' · choose' : resolution.status === 'unresolved' ? ' · create' : ''}</button> }) : <span className="link-empty">No outgoing links</span>}{ambiguous && ambiguous.candidates.status === 'ambiguous' && <div className="candidate-list"><div className="link-heading">CHOOSE NOTE · {ambiguous.target}</div>{ambiguous.candidates.candidates.map((candidate) => <button className="knowledge-link" key={candidate.runtimeKey} onClick={() => { void navigateToNote(candidate.relativePath); setAmbiguous(null) }}><strong>{candidate.title}</strong><small>{candidate.relativePath}</small></button>)}</div>}<div className="link-heading">BACKLINKS</div>{backlinks.length ? backlinks.map((item) => <button className="knowledge-link" key={item.runtimeKey} onClick={() => void navigateToNote(item.relativePath)}>{item.title}</button>) : <span className="link-empty">No backlinks</span>}</div></aside>
}
