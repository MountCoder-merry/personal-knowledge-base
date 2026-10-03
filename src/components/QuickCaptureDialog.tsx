import { useState } from 'react'
import { useVaultStore } from '../stores/vaultStore'

export function QuickCaptureDialog({ onClose }: { onClose: () => void }) { const createCapture = useVaultStore((s) => s.createCapture); const [content, setContent] = useState(''); return <div className="vault-overlay"><section className="vault-dialog"><h1>Quick Capture</h1><label>Capture<textarea value={content} onChange={(e) => setContent(e.target.value)} autoFocus /></label><button className="primary-button" onClick={() => { if (content.trim()) { void createCapture(content); onClose() } }}>Save to Inbox</button></section></div> }
