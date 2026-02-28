import { resolveSource } from '@react-xray/core'
import type { ComponentContext, RVEPlugin, RVEServices } from '@react-xray/core'
import { useEffect, useRef, useSyncExternalStore } from 'react'

import { ensureOverlayMounted } from './CommentsRoot'
import { ChatBubbleIcon } from './icons'
import {
  getStoreSnapshot,
  setPending,
  setToolbarButtonEl,
  subscribeStore,
  toggleMenu,
} from './store'
import { toRelativePath } from './utils'

export type { CommentEntry } from './store'

// ---------------------------------------------------------------------------
// CommentsToolbarIcon — chat bubble with live badge count
// ---------------------------------------------------------------------------

function CommentsToolbarIcon() {
  const comments = useSyncExternalStore(subscribeStore, getStoreSnapshot)
  const count = comments.length

  return (
    <span
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 20,
        height: 20,
      }}
    >
      <ChatBubbleIcon size={16} />
      {count > 0 && (
        <span
          style={{
            position: 'absolute',
            top: -5,
            right: -5,
            background: '#ef4444',
            color: '#fff',
            fontSize: 9,
            fontWeight: 700,
            fontFamily: 'system-ui, sans-serif',
            lineHeight: 1,
            minWidth: 14,
            height: 14,
            borderRadius: 7,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 3px',
            boxSizing: 'border-box',
            pointerEvents: 'none',
          }}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </span>
  )
}

// ---------------------------------------------------------------------------
// ToolbarIconWrapper — captures the parent <button> ref for menu positioning
// ---------------------------------------------------------------------------

function ToolbarIconWrapper() {
  const wrapperRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!wrapperRef.current) return
    let el: HTMLElement | null = wrapperRef.current
    while (el && el.tagName !== 'BUTTON') el = el.parentElement
    if (el instanceof HTMLButtonElement) setToolbarButtonEl(el)
  })

  return (
    <span ref={wrapperRef}>
      <CommentsToolbarIcon />
    </span>
  )
}

// ---------------------------------------------------------------------------
// Public plugin options
// ---------------------------------------------------------------------------

export interface CommentsPluginOptions {
  /**
   * Absolute path to the project root, used to convert absolute filesystem
   * paths (React 18 / _debugSource) to relative paths.
   * Not needed for Vite dev URLs — the relative path is extracted from the URL.
   */
  root?: string
}

// ---------------------------------------------------------------------------
// CommentsPlugin
// ---------------------------------------------------------------------------

export function CommentsPlugin(options: CommentsPluginOptions = {}): RVEPlugin {
  const { root } = options

  // Mount overlays eagerly (idempotent — safe to call on every factory call)
  ensureOverlayMounted()

  return {
    name: 'comments',

    toolbarItems: [
      {
        id: 'comments',
        icon: <ToolbarIconWrapper />,
        label: 'Comments',
        onClick() {
          toggleMenu()
        },
      },
    ],

    actions(ctx: ComponentContext, _services: RVEServices) {
      if (!ctx.source) return []

      return [
        {
          id: 'add-comment',
          label: 'Add comment',
          icon: <ChatBubbleIcon />,
          async onClick(ctx: ComponentContext) {
            const { fileName, lineNumber } = await resolveSource(ctx.source!)
            const filePath = toRelativePath(fileName, root)
            setPending({ filePath, lineNumber, anchorEl: ctx.element })
            return true
          },
        },
      ]
    },
  }
}
