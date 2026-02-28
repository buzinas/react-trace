import { createRoot } from 'react-dom/client'

import { FolderAccessOverlay } from './FolderAccessOverlay'

function PreviewRoot() {
  return <FolderAccessOverlay />
}

// ---------------------------------------------------------------------------
// Singleton mount — idempotent, safe to call multiple times
// ---------------------------------------------------------------------------

let overlayMounted = false

function getXRayPortal(): HTMLElement | null {
  return document.querySelector('[data-react-xray]')
}

export function ensurePreviewOverlayMounted() {
  if (overlayMounted) return
  overlayMounted = true

  const mount = () => {
    const container = document.createElement('div')
    container.setAttribute('data-react-xray-preview', '')
    container.style.cssText =
      'position:fixed;inset:0;pointer-events:none;z-index:999998;'

    const xrayPortal = getXRayPortal()
    if (xrayPortal) {
      xrayPortal.appendChild(container)
    } else {
      document.body.appendChild(container)
      const observer = new MutationObserver(() => {
        const portal = getXRayPortal()
        if (portal && container.parentElement !== portal) {
          portal.appendChild(container)
          observer.disconnect()
        }
      })
      observer.observe(document.body, { childList: true })
    }

    const root = createRoot(container)
    root.render(<PreviewRoot />)
  }

  if (document.body) {
    mount()
  } else {
    document.addEventListener('DOMContentLoaded', mount, { once: true })
  }
}
