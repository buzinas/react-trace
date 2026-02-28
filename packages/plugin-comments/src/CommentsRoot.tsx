import { createRoot } from 'react-dom/client'

import { CommentEditorOverlay } from './CommentEditor'
import { CommentsMenuOverlay } from './CommentsMenu'

/**
 * Root component that renders all plugin overlays. Mounted once into a
 * dedicated container inside the [data-react-xray] portal so the inspector's
 * "skip portal clicks" guard covers our overlays automatically.
 */
function CommentsRoot() {
  return (
    <>
      <CommentEditorOverlay />
      <CommentsMenuOverlay />
    </>
  )
}

let overlayMounted = false

function getXRayPortal(): HTMLElement | null {
  return document.querySelector('[data-react-xray]')
}

export function ensureOverlayMounted() {
  if (overlayMounted) return
  overlayMounted = true

  const mount = () => {
    const container = document.createElement('div')
    container.setAttribute('data-react-xray-comments', '')
    // pointer-events:none on the container; individual overlays opt in with auto
    container.style.cssText =
      'position:fixed;inset:0;pointer-events:none;z-index:999998;'

    const xrayPortal = getXRayPortal()
    if (xrayPortal) {
      xrayPortal.appendChild(container)
    } else {
      // XRay portal is created in a useEffect, so it may not exist yet.
      // Append to body first, then move it once the portal appears.
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
    root.render(<CommentsRoot />)
  }

  if (document.body) {
    mount()
  } else {
    document.addEventListener('DOMContentLoaded', mount, { once: true })
  }
}
