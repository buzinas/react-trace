import type { RVEServices } from '@react-xray/core'

// ---------------------------------------------------------------------------
// Folder button DOM ref — used by FolderAccessOverlay to anchor itself
// ---------------------------------------------------------------------------

export let folderButtonEl: HTMLButtonElement | null = null

export function setFolderButtonEl(el: HTMLButtonElement | null) {
  folderButtonEl = el
}

// ---------------------------------------------------------------------------
// Folder prompt open/close state
// ---------------------------------------------------------------------------

let folderPromptOpen = false
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((fn) => fn())
}

export function subscribeFolderPrompt(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function getFolderPromptSnapshot(): boolean {
  return folderPromptOpen
}

export function setFolderPromptOpen(value: boolean) {
  folderPromptOpen = value
  notify()
}

// ---------------------------------------------------------------------------
// Services reference — set on each toolbar click, used by the overlay
// ---------------------------------------------------------------------------

export let pluginServices: RVEServices | null = null

export function setPluginServices(s: RVEServices) {
  pluginServices = s
}
