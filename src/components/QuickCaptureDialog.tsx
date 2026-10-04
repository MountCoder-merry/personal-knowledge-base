import { Inbox, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useVaultStore } from '../stores/vaultStore'

export function QuickCaptureDialog({ onClose }: { onClose: () => void }) {
  const createCapture = useVaultStore((s) => s.createCapture)
  const [content, setContent] = useState('')
  useEffect(() => { const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }; window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown) }, [onClose])
  const submit = () => { if (content.trim()) { void createCapture(content); onClose() } }
  return <div className="vault-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="vault-dialog capture-dialog" role="dialog" aria-modal="true" aria-labelledby="quick-capture-title"><div className="vault-dialog-heading"><div><div className="dialog-kicker">QUICK CAPTURE</div><h1 id="quick-capture-title">Capture an idea</h1><p>Save a thought to Inbox and shape it into a note later.</p></div><button className="icon-button" aria-label="Close" onClick={onClose}><X size={17} /></button></div><label>Content<textarea value={content} onChange={(e) => setContent(e.target.value)} onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') submit() }} autoFocus placeholder="Write a thought, question, or link…" /></label><div className="dialog-actions"><button className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" onClick={submit}><Inbox size={15} />Save to Inbox</button></div></section></div>
}
