import { FolderOpen, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { open as pickFolder } from '@tauri-apps/plugin-dialog'
import { useVaultStore } from '../stores/vaultStore'
import { useUIStore } from '../stores/uiStore'
import { forgetVault, getRecentVaults, rememberVault } from '../features/vault/recentVaults'

declare global { interface Window { __TAURI_INTERNALS__?: unknown } }

export function VaultDialog() {
  const open = useVaultStore((state) => state.open)
  const error = useVaultStore((state) => state.error)
  const dirty = useVaultStore((state) => state.dirty)
  const saveSelected = useVaultStore((state) => state.saveSelected)
  const clearError = useVaultStore((state) => state.clearError)
  const setVaultDialogOpen = useUIStore((state) => state.setVaultDialogOpen)
  const [mode, setMode] = useState<'open' | 'create'>('open')
  const [path, setPath] = useState('')
  const [name, setName] = useState('Personal Knowledge Base')
  const [pickerError, setPickerError] = useState('')
  const recent = getRecentVaults()

  const submit = async () => {
    if (!path.trim()) return
    if (dirty) { const choice = window.prompt('You have unsaved changes. Type Save, Discard, or Cancel.')?.toLowerCase(); if (choice === 'save') await saveSelected(); else if (choice !== 'discard') return }
    const target = mode === 'create' ? `${path.replace(/[\\/]$/, '')}\\${name.trim()}` : path.trim()
    try { await open(target, mode === 'create', mode === 'create' ? name : undefined); rememberVault({ path: target, name: mode === 'create' ? name : target.split(/[\\/]/).pop() ?? target, lastOpenedAt: new Date().toISOString() }); setVaultDialogOpen(false) } catch { /* store exposes the error */ }
  }

  const pick = async () => {
    setPickerError('')
    if (!window.__TAURI_INTERNALS__) { setPickerError('原生文件夹选择器只能在 Tauri 桌面应用中使用。当前是浏览器预览，请直接输入路径，或运行 npm run tauri dev。'); return }
    try { const selected = await pickFolder({ directory: true, multiple: false, title: mode === 'create' ? 'Choose parent folder' : 'Choose Vault folder' }); if (typeof selected === 'string') setPath(selected) } catch (cause) { setPickerError(`无法打开文件夹选择器：${String(cause)}`) }
  }

  return <div className="vault-overlay"><section className="vault-dialog"><div className="vault-dialog-heading"><div><div className="dialog-kicker">PERSONAL KNOWLEDGE BASE</div><h1>{mode === 'open' ? 'Open a Vault' : 'Create a Vault'}</h1><p>{mode === 'open' ? 'Choose a local folder containing your Markdown knowledge.' : 'Choose a parent folder and create a new Vault.'}</p></div><button className="icon-button" aria-label="Close" onClick={() => { clearError(); setVaultDialogOpen(false) }}><X size={17} /></button></div>{recent.length > 0 && <div className="recent-list"><div className="recent-title">RECENT VAULTS</div>{recent.map((item) => <div className="recent-item" key={item.path}><button onClick={() => { setPath(item.path); setMode('open') }}><strong>{item.name}</strong><span>{item.path}</span></button><button className="recent-remove" onClick={() => { forgetVault(item.path); window.location.reload() }}>Remove</button></div>)}</div>}<div className="dialog-tabs"><button className={mode === 'open' ? 'active' : ''} onClick={() => setMode('open')}><FolderOpen size={15} />Open Existing</button><button className={mode === 'create' ? 'active' : ''} onClick={() => setMode('create')}><Plus size={15} />Create New</button></div>{mode === 'create' && <label>Vault name<input value={name} onChange={(e) => setName(e.target.value)} /></label>}<label>{mode === 'create' ? 'Parent folder' : 'Vault folder'}<div className="path-picker"><input autoFocus value={path} onChange={(e) => setPath(e.target.value)} placeholder="Choose a local folder" onKeyDown={(e) => e.key === 'Enter' && void submit()} /><button type="button" onClick={() => void pick()}><FolderOpen size={15} /></button></div></label>{(pickerError || error) && <div className="dialog-error">{pickerError || error?.replace(/^Error: /, '')}</div>}<button className="primary-button" onClick={() => void submit()}>{mode === 'open' ? 'Open Vault' : 'Create Vault'}</button><p className="dialog-hint">The folder remains ordinary Markdown files on your local disk.</p></section></div>
}
