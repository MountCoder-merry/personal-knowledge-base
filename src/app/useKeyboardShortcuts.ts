import { useEffect } from 'react'
import { useUIStore } from '../stores/uiStore'
import { useVaultStore } from '../stores/vaultStore'

export function useKeyboardShortcuts() {
  const saveSelected = useVaultStore((state) => state.saveSelected)
  const { setCreateNoteDialogOpen, setQuickCaptureDialogOpen } = useUIStore()
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        if (!((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's')) return
      }
      const modifier = event.ctrlKey || event.metaKey
      if (modifier && event.key.toLowerCase() === 'n' && event.shiftKey) { event.preventDefault(); setQuickCaptureDialogOpen(true) }
      else if (modifier && event.key.toLowerCase() === 'n') { event.preventDefault(); setCreateNoteDialogOpen(true) }
      else if (modifier && event.key.toLowerCase() === 's') { event.preventDefault(); void saveSelected() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [saveSelected, setCreateNoteDialogOpen, setQuickCaptureDialogOpen])
}
