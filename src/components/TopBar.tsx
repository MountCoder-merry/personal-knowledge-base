import { Search, PanelLeft, PanelRight, Sun, Moon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useUIStore } from '../stores/uiStore'
import { SearchResults } from './SearchResults'

export function TopBar() {
  const { toggleSidebar, togglePropertiesPanel, theme, setTheme, setVaultDialogOpen, setCreateNoteDialogOpen, setQuickCaptureDialogOpen } = useUIStore()
  const nextTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark'
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  useEffect(() => { const handler = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); searchRef.current?.focus() } if (event.key === 'Escape') setQuery('') }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler) }, [])
  return <header className="topbar">
    <button className="icon-button mobile-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar"><PanelLeft size={17} /></button>
    <div className="brand-mark">PK</div>
    <button className="workspace-name workspace-switcher" onClick={() => setVaultDialogOpen(true)}>Personal Knowledge Base <span className="beta-badge">VAULT</span></button>
    <div className="search-container"><div className="search-box"><Search size={16} /><input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your knowledge..." /><kbd>Ctrl K</kbd></div><SearchResults query={query} close={() => setQuery('')} /></div>
    <div className="topbar-actions">
      <button className="top-action" onClick={() => setCreateNoteDialogOpen(true)}>New Note</button>
      <button className="top-action" onClick={() => setQuickCaptureDialogOpen(true)}>Capture</button>
      <button className="icon-button" onClick={() => setTheme(nextTheme)} aria-label={`Switch theme (current: ${theme})`}>{theme === 'dark' ? <Moon size={17} /> : <Sun size={17} />}</button>
      <button className="icon-button" onClick={togglePropertiesPanel} aria-label="Toggle properties"><PanelRight size={17} /></button>
    </div>
  </header>
}
