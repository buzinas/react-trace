import type { CSSProperties } from 'react'
import { useEffect, useRef, useSyncExternalStore } from 'react'

import { FolderAccessPrompt, handleGrantAccess } from './FolderAccessPrompt'
import {
  folderButtonEl,
  getFolderPromptSnapshot,
  pluginServices,
  setFolderPromptOpen,
  subscribeFolderPrompt,
} from './folderPrompt'

export function FolderAccessOverlay() {
  const isOpen = useSyncExternalStore(
    subscribeFolderPrompt,
    getFolderPromptSnapshot,
  )
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on outside click or Escape
  useEffect(() => {
    if (!isOpen) return

    function onPointerDown(e: PointerEvent) {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(e.target as Node)
      ) {
        setFolderPromptOpen(false)
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setFolderPromptOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  if (!isOpen || !pluginServices) return null

  const services = pluginServices

  // Anchor above the folder button, right-aligned to the button's right edge
  let style: CSSProperties = {
    position: 'fixed',
    bottom: 72,
    right: 32,
    zIndex: 9999999,
  }

  if (folderButtonEl) {
    const rect = folderButtonEl.getBoundingClientRect()
    style = {
      position: 'fixed',
      bottom: window.innerHeight - rect.top + 8,
      right: window.innerWidth - rect.right,
      zIndex: 9999999,
    }
  }

  const handleGrant = async () => {
    const granted = await handleGrantAccess(services.root, () =>
      services.fs.requestAccess(),
    )
    if (granted) setFolderPromptOpen(false)
  }

  return (
    <div
      ref={overlayRef}
      style={{
        ...style,
        width: 280,
        background: '#18181b',
        border: '1px solid #27272a',
        borderRadius: 8,
        boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
        pointerEvents: 'auto',
        overflow: 'hidden',
      }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <FolderAccessPrompt
        root={services.root}
        onGrant={handleGrant}
        onCancel={() => setFolderPromptOpen(false)}
      />
    </div>
  )
}
