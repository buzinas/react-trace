// ---------------------------------------------------------------------------
// Comment store
// ---------------------------------------------------------------------------

export interface CommentEntry {
  id: string
  filePath: string
  lineNumber: number
  comment: string
  createdAt: number
}

const commentStore = new Map<string, CommentEntry>()
const storeListeners = new Set<() => void>()
let storeSnapshot: CommentEntry[] = []

function notifyStore() {
  storeListeners.forEach((fn) => fn())
}

export function subscribeStore(fn: () => void) {
  storeListeners.add(fn)
  return () => storeListeners.delete(fn)
}

export function getStoreSnapshot(): CommentEntry[] {
  return storeSnapshot
}

export function addComment(entry: Omit<CommentEntry, 'id' | 'createdAt'>) {
  const id = crypto.randomUUID()
  const full: CommentEntry = { ...entry, id, createdAt: Date.now() }
  commentStore.set(id, full)
  storeSnapshot = [...commentStore.values()]
  notifyStore()
  return id
}

export function updateComment(id: string, text: string) {
  const existing = commentStore.get(id)
  if (!existing) return
  commentStore.set(id, { ...existing, comment: text })
  storeSnapshot = [...commentStore.values()]
  notifyStore()
}

export function removeComment(id: string) {
  commentStore.delete(id)
  storeSnapshot = [...commentStore.values()]
  notifyStore()
}

export function clearAllComments() {
  commentStore.clear()
  storeSnapshot = []
  notifyStore()
}

// ---------------------------------------------------------------------------
// Pending-comment state (tracks the in-progress "Add comment" flow)
// ---------------------------------------------------------------------------

export interface PendingComment {
  filePath: string
  lineNumber: number
  anchorEl: HTMLElement
}

let pendingComment: PendingComment | null = null
const pendingListeners = new Set<() => void>()

function notifyPending() {
  pendingListeners.forEach((fn) => fn())
}

export function subscribePending(fn: () => void) {
  pendingListeners.add(fn)
  return () => pendingListeners.delete(fn)
}

export function getPendingSnapshot(): PendingComment | null {
  return pendingComment
}

export function setPending(value: PendingComment | null) {
  pendingComment = value
  notifyPending()
}

// ---------------------------------------------------------------------------
// Toolbar menu open/close state
// ---------------------------------------------------------------------------

let menuOpen = false
const menuListeners = new Set<() => void>()

function notifyMenu() {
  menuListeners.forEach((fn) => fn())
}

export function subscribeMenu(fn: () => void) {
  menuListeners.add(fn)
  return () => menuListeners.delete(fn)
}

export function getMenuSnapshot(): boolean {
  return menuOpen
}

export function setMenuOpen(value: boolean) {
  menuOpen = value
  notifyMenu()
}

export function toggleMenu() {
  setMenuOpen(!menuOpen)
}

// ---------------------------------------------------------------------------
// Toolbar button DOM ref — used by CommentsMenuOverlay to anchor itself
// ---------------------------------------------------------------------------

export let toolbarButtonEl: HTMLButtonElement | null = null

export function setToolbarButtonEl(el: HTMLButtonElement | null) {
  toolbarButtonEl = el
}

// ---------------------------------------------------------------------------
// Plugin root path — set at plugin init, read by SendToOpencodeForm
// ---------------------------------------------------------------------------

export let pluginRoot: string | undefined

export function setPluginRoot(root: string | undefined) {
  pluginRoot = root
}
