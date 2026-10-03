import { FileText, Save } from 'lucide-react'
import { useVaultStore } from '../stores/vaultStore'

export function EditorPane() {
  const { selectedPath, notesByPath, draftContent, setDraftContent, saveSelected, loading } = useVaultStore()
  const note = selectedPath ? notesByPath[selectedPath] : undefined
  if (!selectedPath || !note) return <main className="editor-pane empty-editor"><FileText size={31} /><h2>{loading ? 'Loading note…' : 'Select a Markdown note'}</h2><p>Open a note from the Vault tree to begin editing.</p></main>
  return <main className="editor-pane">
    <div className="editor-header"><div className="note-tab"><FileText size={15} /><span>{note.title}.md</span></div><div className="editor-mode"><button className="save-button" onClick={() => void saveSelected()}><Save size={14} />Save</button><span>Atomic write</span></div></div>
    <div className="editor-body"><div className="line-numbers">{draftContent.split('\n').map((_, index) => <span key={index}>{index + 1}</span>)}</div><textarea aria-label="Markdown editor" value={draftContent} onChange={(event) => setDraftContent(event.target.value)} spellCheck={false} /></div>
    <div className="editor-footer"><span>Markdown</span><span>UTF-8</span><span>Ln {draftContent.split('\n').length}, Col 1</span></div>
  </main>
}
