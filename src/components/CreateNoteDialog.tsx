import { Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useVaultStore } from '../stores/vaultStore'
import { listTemplateDescriptors } from '../services/templates'

export function CreateNoteDialog({ onClose }: { onClose: () => void }) {
  const { fileTree, createFromTemplate } = useVaultStore()
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('00-Inbox')
  const [template, setTemplate] = useState('')
  const templates = listTemplateDescriptors(fileTree)
  useEffect(() => { const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }; window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown) }, [onClose])
  const submit = () => { if (title.trim()) { void createFromTemplate(title.trim(), location, template || undefined); onClose() } }
  return <div className="vault-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="vault-dialog" role="dialog" aria-modal="true" aria-labelledby="new-note-title"><div className="vault-dialog-heading"><div><div className="dialog-kicker">NOTE CREATION</div><h1 id="new-note-title">New Note</h1><p>Start with a clean page or a reusable template.</p></div><button className="icon-button" aria-label="Close" onClick={onClose}><X size={17} /></button></div><label>Title<input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="e.g. React 学习笔记" /></label><label>Location<input value={location} onChange={(e) => setLocation(e.target.value)} /></label><label>Template<select value={template} onChange={(e) => setTemplate(e.target.value)}><option value="">Blank</option>{templates.map((item) => <option key={item.path} value={item.path}>{item.name}</option>)}</select></label><p className="dialog-hint">A permanent ID is generated for every new note.</p><button className="primary-button" onClick={submit}><Plus size={15} />Create Note</button></section></div>
}
