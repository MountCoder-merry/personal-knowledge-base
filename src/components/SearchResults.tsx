import { Search, X } from 'lucide-react'
import { useVaultStore } from '../stores/vaultStore'
import { searchNotes } from '../services/knowledge/index'

export function SearchResults({ query, close }: { query: string; close: () => void }) {
  const index = useVaultStore((state) => state.knowledgeIndex)
  const navigate = useVaultStore((state) => state.navigateToNote)
  const results = searchNotes(query, index)
  if (!query.trim()) return null
  return <div className="search-results"><div className="search-results-heading"><span><Search size={14} />{results.length} result{results.length === 1 ? '' : 's'}</span><button onClick={close}><X size={14} /></button></div>{results.map(({ note, snippet }) => <button className="search-result" key={note.runtimeKey} onClick={() => { void navigate(note.relativePath); close() }}><strong>{note.title}</strong><span>{note.relativePath}</span><em>{snippet}</em></button>)}{results.length === 0 && <div className="search-empty">No matching notes</div>}</div>
}
