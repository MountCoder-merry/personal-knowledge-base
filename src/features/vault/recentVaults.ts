import type { RecentVault } from '../../types/domain'

const KEY = 'pkb.recentVaults'
export function getRecentVaults(): RecentVault[] { try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') as RecentVault[] } catch { return [] } }
export function rememberVault(vault: RecentVault): RecentVault[] { const next = [vault, ...getRecentVaults().filter((item) => item.path !== vault.path)].slice(0, 5); localStorage.setItem(KEY, JSON.stringify(next)); return next }
export function forgetVault(path: string): void { localStorage.setItem(KEY, JSON.stringify(getRecentVaults().filter((item) => item.path !== path))) }
