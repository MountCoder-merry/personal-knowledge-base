import { create } from 'zustand'
import type { Vault } from '../types/domain'
import type { EditorMode, ThemePreference } from '../types/ui'

interface UIState {
  currentVault: Vault | null
  selectedNoteId: string | null
  sidebarOpen: boolean
  propertiesPanelOpen: boolean
  editorMode: EditorMode
  theme: ThemePreference
  vaultDialogOpen: boolean
  createNoteDialogOpen: boolean
  quickCaptureDialogOpen: boolean
  inboxOpen: boolean
  setTheme: (theme: ThemePreference) => void
  toggleSidebar: () => void
  togglePropertiesPanel: () => void
  selectNote: (noteId: string | null) => void
  setVaultDialogOpen: (open: boolean) => void
  setCreateNoteDialogOpen: (open: boolean) => void
  setQuickCaptureDialogOpen: (open: boolean) => void
  setInboxOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  currentVault: {
    id: 'demo-vault',
    name: 'Personal Knowledge Base',
    rootPath: '',
  },
  selectedNoteId: 'welcome-note',
  sidebarOpen: true,
  propertiesPanelOpen: true,
  editorMode: 'source',
  theme: 'system',
  vaultDialogOpen: false,
  createNoteDialogOpen: false,
  quickCaptureDialogOpen: false,
  inboxOpen: false,
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  togglePropertiesPanel: () => set((state) => ({ propertiesPanelOpen: !state.propertiesPanelOpen })),
  selectNote: (selectedNoteId) => set({ selectedNoteId }),
  setVaultDialogOpen: (vaultDialogOpen) => set({ vaultDialogOpen }),
  setCreateNoteDialogOpen: (createNoteDialogOpen) => set({ createNoteDialogOpen }),
  setQuickCaptureDialogOpen: (quickCaptureDialogOpen) => set({ quickCaptureDialogOpen }),
  setInboxOpen: (inboxOpen) => set({ inboxOpen }),
}))
