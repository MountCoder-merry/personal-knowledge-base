import { useEffect } from 'react'
import { EditorPane } from '../components/EditorPane'
import { PropertiesPanel } from '../components/PropertiesPanel'
import { Sidebar } from '../components/Sidebar'
import { StatusBar } from '../components/StatusBar'
import { TopBar } from '../components/TopBar'
import { useUIStore } from '../stores/uiStore'
import type { ResolvedTheme } from '../types/ui'
import { VaultDialog } from '../components/VaultDialog'
import { useVaultStore } from '../stores/vaultStore'
import { getRecentVaults } from '../features/vault/recentVaults'
import { CreateNoteDialog } from '../components/CreateNoteDialog'
import { QuickCaptureDialog } from '../components/QuickCaptureDialog'
import { InboxView } from '../components/InboxView'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'

export function AppShell() {
  const { sidebarOpen, propertiesPanelOpen, theme, vaultDialogOpen, createNoteDialogOpen, quickCaptureDialogOpen, inboxOpen, setCreateNoteDialogOpen, setQuickCaptureDialogOpen } = useUIStore()
  const currentVault = useVaultStore((state) => state.currentVault)
  const openVault = useVaultStore((state) => state.open)
  useKeyboardShortcuts()
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => { const resolved: ResolvedTheme = theme === 'system' ? (media.matches ? 'dark' : 'light') : theme; document.documentElement.dataset.theme = resolved }
    update(); media.addEventListener('change', update); return () => media.removeEventListener('change', update)
  }, [theme])
  useEffect(() => { const recent = getRecentVaults()[0]; if (recent) void openVault(recent.path).catch(() => undefined) }, [openVault])
  return <div className="app-shell"><TopBar /><div className="workspace"><div className={sidebarOpen ? 'sidebar-wrap' : 'sidebar-wrap is-hidden'}><Sidebar /></div>{inboxOpen ? <InboxView /> : <EditorPane />}<div className={propertiesPanelOpen ? 'properties-wrap' : 'properties-wrap is-hidden'}><PropertiesPanel /></div></div><StatusBar />{(!currentVault || vaultDialogOpen) && <VaultDialog />}{createNoteDialogOpen && <CreateNoteDialog onClose={() => setCreateNoteDialogOpen(false)} />}{quickCaptureDialogOpen && <QuickCaptureDialog onClose={() => setQuickCaptureDialogOpen(false)} />}</div>
}
