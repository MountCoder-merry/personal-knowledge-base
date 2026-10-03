import { useVaultStore } from '../stores/vaultStore'

export function StatusBar() { const { dirty, indexFailures } = useVaultStore(); return <footer className="statusbar"><span><i className="status-dot" />Local-first workspace · {dirty ? 'Unsaved' : 'Saved'}{indexFailures.length ? ` · ${indexFailures.length} note${indexFailures.length === 1 ? '' : 's'} could not be indexed` : ''}</span><span>Navigation v0.4.0</span></footer> }
