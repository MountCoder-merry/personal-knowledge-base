import { FolderInput, Pencil, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FileTreeNode } from '../types/domain'

export type FileAction = 'rename' | 'move' | 'delete'

interface FileActionDialogProps {
  action: FileAction
  node: FileTreeNode
  onClose: () => void
  onSubmit: (value: string) => Promise<void>
}

const actionCopy: Record<FileAction, { title: string; description: string; submit: string }> = {
  rename: { title: 'Rename item', description: 'Choose a new name for this item.', submit: 'Rename' },
  move: { title: 'Move item', description: 'Enter a folder path relative to this Vault.', submit: 'Move' },
  delete: { title: 'Move to trash', description: 'This item will be moved to the Vault trash. You can recover it from the file system if needed.', submit: 'Move to trash' },
}

export function FileActionDialog({ action, node, onClose, onSubmit }: FileActionDialogProps) {
  const copy = actionCopy[action]
  const [value, setValue] = useState(action === 'rename' ? node.name : '')
  const [error, setError] = useState<string | null>(null)
  const Icon = action === 'rename' ? Pencil : action === 'move' ? FolderInput : Trash2

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const submit = async () => {
    if (action !== 'delete' && !value.trim()) { setError(action === 'rename' ? 'Enter a name.' : 'Enter a destination folder.'); return }
    try { await onSubmit(value.trim()); onClose() } catch (submitError) { setError(String(submitError).replace(/^Error: /, '')) }
  }

  return <div className="vault-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="vault-dialog file-action-dialog" role="dialog" aria-modal="true" aria-labelledby="file-action-title">
      <div className="vault-dialog-heading"><div><div className="dialog-kicker">FILE ACTION</div><h1 id="file-action-title">{copy.title}</h1><p>{copy.description}</p></div><button className="icon-button" aria-label="Close" onClick={onClose}><X size={17} /></button></div>
      <div className="file-action-target"><Icon size={15} /><span>{node.path}</span></div>
      {action !== 'delete' && <label>{action === 'rename' ? 'New name' : 'Destination folder'}<input autoFocus value={value} placeholder={action === 'move' ? 'e.g. Programming' : node.name} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void submit() }} /></label>}
      {error && <div className="dialog-error">{error}</div>}
      <div className="dialog-actions"><button className="secondary-button" onClick={onClose}>Cancel</button><button className={action === 'delete' ? 'danger-button' : 'primary-button'} onClick={() => void submit()}>{copy.submit}</button></div>
    </section>
  </div>
}
