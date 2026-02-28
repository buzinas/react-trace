import { resolveSource } from '@react-xray/core'
import type { ComponentContext, RVEPlugin, RVEServices } from '@react-xray/core'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { createRoot } from 'react-dom/client'

// ---------------------------------------------------------------------------
// Options
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
// Comment store (module-level — shared across instances, survives re-mounts)
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

function subscribeStore(fn: () => void) {
  storeListeners.add(fn)
  return () => storeListeners.delete(fn)
}

function getStoreSnapshot(): CommentEntry[] {
  return storeSnapshot
}

function addComment(entry: Omit<CommentEntry, 'id' | 'createdAt'>) {
  const id = crypto.randomUUID()
  const full: CommentEntry = { ...entry, id, createdAt: Date.now() }
  commentStore.set(id, full)
  storeSnapshot = [...commentStore.values()]
  notifyStore()
  return id
}

function updateComment(id: string, text: string) {
  const existing = commentStore.get(id)
  if (!existing) return
  commentStore.set(id, { ...existing, comment: text })
  storeSnapshot = [...commentStore.values()]
  notifyStore()
}

function removeComment(id: string) {
  commentStore.delete(id)
  storeSnapshot = [...commentStore.values()]
  notifyStore()
}

function clearAllComments() {
  commentStore.clear()
  storeSnapshot = []
  notifyStore()
}

// ---------------------------------------------------------------------------
// Pending-comment state
// ---------------------------------------------------------------------------

interface PendingComment {
  filePath: string
  lineNumber: number
  anchorEl: HTMLElement
}

let pendingComment: PendingComment | null = null
const pendingListeners = new Set<() => void>()

function notifyPending() {
  pendingListeners.forEach((fn) => fn())
}

function subscribePending(fn: () => void) {
  pendingListeners.add(fn)
  return () => pendingListeners.delete(fn)
}

function getPendingSnapshot(): PendingComment | null {
  return pendingComment
}

function setPending(value: PendingComment | null) {
  pendingComment = value
  notifyPending()
}

// ---------------------------------------------------------------------------
// Toolbar menu state
// ---------------------------------------------------------------------------

let menuOpen = false
const menuListeners = new Set<() => void>()

function notifyMenu() {
  menuListeners.forEach((fn) => fn())
}

function subscribeMenu(fn: () => void) {
  menuListeners.add(fn)
  return () => menuListeners.delete(fn)
}

function getMenuSnapshot(): boolean {
  return menuOpen
}

function setMenuOpen(value: boolean) {
  menuOpen = value
  notifyMenu()
}

// Toolbar button DOM reference for menu positioning
let toolbarButtonEl: HTMLButtonElement | null = null

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------

function toRelativePath(fileName: string, root?: string): string {
  const clean = fileName.split('?')[0]!

  try {
    const { pathname } = new URL(clean)

    if (pathname.startsWith('/@fs/')) {
      const absPath = pathname.slice('/@fs'.length)
      if (root) {
        const normalizedRoot = root.replace(/\\/g, '/').replace(/\/$/, '')
        if (absPath.startsWith(normalizedRoot + '/')) {
          return absPath.slice(normalizedRoot.length + 1)
        }
      }
      return absPath
    }

    return pathname.replace(/^\//, '')
  } catch {
    const normalized = clean.replace(/\\/g, '/')
    if (root) {
      const normalizedRoot = root.replace(/\\/g, '/').replace(/\/$/, '')
      if (normalized.startsWith(normalizedRoot + '/')) {
        return normalized.slice(normalizedRoot.length + 1)
      }
    }
    return normalized
  }
}

// ---------------------------------------------------------------------------
// Format helper (mirrors OpenCode's formatCommentNote)
// ---------------------------------------------------------------------------

function formatCommentNote(
  filePath: string,
  lineNumber: number,
  comment: string,
): string {
  return `The user made the following comment regarding line ${lineNumber} of ${filePath}: ${comment}`
}

// ---------------------------------------------------------------------------
// SVG Icons
// ---------------------------------------------------------------------------

function ChatBubbleIcon({ size = 13 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 13 13"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M11 1H2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2l2 3 2-3h3a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 3.5h9M5 3.5V2.5h3v1M4 3.5l.5 7h4l.5-7"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ClipboardIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="1"
        width="8"
        height="10"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M4 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function XIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// CommentsToolbarIcon — chat bubble with optional badge
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
// CommentEditorOverlay — the textarea shown after "Add comment" is clicked
// ---------------------------------------------------------------------------

const editorButtonBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 28,
  padding: '0 12px',
  borderRadius: 6,
  fontSize: 12,
  fontFamily: 'system-ui, sans-serif',
  fontWeight: 500,
  cursor: 'pointer',
  border: 'none',
  outline: 'none',
  transition: 'opacity 0.15s',
}

function CommentEditorOverlay() {
  const pending = useSyncExternalStore(subscribePending, getPendingSnapshot)
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (pending) {
      setText('')
      requestAnimationFrame(() => {
        textareaRef.current?.focus()
      })
    }
  }, [pending])

  const handleCancel = useCallback(() => {
    setPending(null)
  }, [])

  const handleSubmit = useCallback(() => {
    if (!pending || !text.trim()) return
    addComment({
      filePath: pending.filePath,
      lineNumber: pending.lineNumber,
      comment: text.trim(),
    })
    setPending(null)
  }, [pending, text])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleCancel()
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleCancel, handleSubmit],
  )

  if (!pending) return null

  const EDITOR_WIDTH = 480
  const rect = pending.anchorEl.getBoundingClientRect()
  const left = Math.min(rect.left, window.innerWidth - EDITOR_WIDTH - 16)
  const top = Math.min(rect.bottom + 8, window.innerHeight - 200)

  return (
    <div
      style={{
        position: 'fixed',
        left,
        top,
        width: EDITOR_WIDTH,
        background: '#18181b',
        border: '1px solid #3b82f6',
        pointerEvents: 'auto',
        borderRadius: 8,
        padding: 8,
        boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
        zIndex: 9999999,
        fontFamily: 'system-ui, sans-serif',
        boxSizing: 'border-box',
      }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add comment"
        rows={3}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          resize: 'vertical',
          color: '#fafafa',
          fontSize: 13,
          fontFamily: 'system-ui, sans-serif',
          lineHeight: 1.5,
          padding: '4px 2px',
          boxSizing: 'border-box',
          caretColor: '#3b82f6',
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 4,
          borderTop: '1px solid #27272a',
          paddingTop: 8,
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: '#71717a',
            fontFamily: 'ui-monospace, monospace',
          }}
        >
          Commenting on line {pending.lineNumber}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            onClick={handleCancel}
            style={{
              ...editorButtonBase,
              background: 'transparent',
              border: '1px solid #3f3f46',
              color: '#d4d4d8',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim()}
            style={{
              ...editorButtonBase,
              background: text.trim() ? '#fafafa' : '#3f3f46',
              color: text.trim() ? '#18181b' : '#71717a',
              cursor: text.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            Comment
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// CommentsMenuOverlay — shown when the toolbar icon is clicked
// ---------------------------------------------------------------------------

function HoverButton({
  children,
  style,
  onClick,
  color,
}: {
  children: React.ReactNode
  style: (hover: boolean) => React.CSSProperties
  onClick(): void
  color?: string
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      type="button"
      style={{ ...style(hovered), color: color ?? '#d4d4d8' }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  )
}

function CommentRow({
  comment,
  onDelete,
}: {
  comment: CommentEntry
  onDelete(): void
}) {
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(comment.comment)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Keep draft in sync if the comment is updated externally
  useEffect(() => {
    if (!editing) setDraft(comment.comment)
  }, [comment.comment, editing])

  const startEditing = () => {
    setDraft(comment.comment)
    setEditing(true)
    requestAnimationFrame(() => {
      const el = textareaRef.current
      if (!el) return
      el.focus()
      // Place cursor at end
      el.selectionStart = el.selectionEnd = el.value.length
    })
  }

  const handleSave = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== comment.comment)
      updateComment(comment.id, trimmed)
    setEditing(false)
  }

  const handleCancel = () => {
    setDraft(comment.comment)
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    }
  }

  return (
    <div
      style={{
        padding: '6px 12px',
        background: hovered ? 'rgba(255,255,255,0.03)' : 'transparent',
        transition: 'background 0.1s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header row: file:line + delete button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontFamily: 'ui-monospace, monospace',
            color: '#3b82f6',
            flexShrink: 0,
          }}
        >
          {comment.filePath}:{comment.lineNumber}
        </span>
        {hovered && !editing && (
          <button
            type="button"
            onClick={onDelete}
            title="Remove comment"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#71717a',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <XIcon />
          </button>
        )}
      </div>

      {/* Comment body — click to edit, textarea when editing */}
      {editing ? (
        <div style={{ marginTop: 4 }}>
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            style={{
              width: '100%',
              background: '#0f0f11',
              border: '1px solid #3b82f6',
              borderRadius: 4,
              outline: 'none',
              resize: 'vertical',
              color: '#fafafa',
              fontSize: 12,
              fontFamily: 'system-ui, sans-serif',
              lineHeight: 1.4,
              padding: '4px 6px',
              boxSizing: 'border-box',
              caretColor: '#3b82f6',
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 6,
              marginTop: 4,
            }}
          >
            <button
              type="button"
              onClick={handleCancel}
              style={{
                ...editorButtonBase,
                height: 24,
                fontSize: 11,
                background: 'transparent',
                border: '1px solid #3f3f46',
                color: '#d4d4d8',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!draft.trim()}
              style={{
                ...editorButtonBase,
                height: 24,
                fontSize: 11,
                background: draft.trim() ? '#fafafa' : '#3f3f46',
                color: draft.trim() ? '#18181b' : '#71717a',
                cursor: draft.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p
          onClick={startEditing}
          title="Click to edit"
          style={{
            margin: '3px 0 0',
            fontSize: 12,
            color: '#d4d4d8',
            fontFamily: 'system-ui, sans-serif',
            lineHeight: 1.4,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            cursor: 'text',
          }}
        >
          {comment.comment}
        </p>
      )}
    </div>
  )
}

function CommentsMenuOverlay() {
  const isOpen = useSyncExternalStore(subscribeMenu, getMenuSnapshot)
  const comments = useSyncExternalStore(subscribeStore, getStoreSnapshot)
  const menuRef = useRef<HTMLDivElement>(null)
  const [copyFeedback, setCopyFeedback] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    function onPointerDown(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  if (!isOpen) return null

  // Position anchored to toolbar button (bottom-right by default)
  let menuStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 72,
    right: 32,
    zIndex: 9999999,
  }

  if (toolbarButtonEl) {
    const rect = toolbarButtonEl.getBoundingClientRect()
    menuStyle = {
      position: 'fixed',
      bottom: window.innerHeight - rect.top + 8,
      right: window.innerWidth - rect.right,
      zIndex: 9999999,
    }
  }

  const menuItemStyle = (hover: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '7px 12px',
    cursor: 'pointer',
    fontSize: 12,
    color: '#d4d4d8',
    fontFamily: 'system-ui, sans-serif',
    background: hover ? 'rgba(59,130,246,0.15)' : 'transparent',
    borderRadius: 4,
    userSelect: 'none',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    boxSizing: 'border-box',
    transition: 'background 0.1s',
  })

  const handleCopy = () => {
    if (!comments.length) return
    const text = comments
      .map((c) => formatCommentNote(c.filePath, c.lineNumber, c.comment))
      .join('\n\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(true)
      setTimeout(() => setCopyFeedback(false), 1500)
    })
  }

  const handleClear = () => {
    clearAllComments()
    setMenuOpen(false)
  }

  return (
    <div
      ref={menuRef}
      style={{
        ...menuStyle,
        width: 320,
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
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px 8px',
          borderBottom: '1px solid #27272a',
        }}
      >
        <span
          style={{
            color: '#fafafa',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          Comments
          {comments.length > 0 && (
            <span
              style={{
                marginLeft: 6,
                fontSize: 11,
                color: '#71717a',
                fontWeight: 400,
              }}
            >
              ({comments.length})
            </span>
          )}
        </span>
        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          title="Close"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#52525b',
            cursor: 'pointer',
            padding: '0 2px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <XIcon />
        </button>
      </div>

      {/* Comments list */}
      {comments.length === 0 ? (
        <div
          style={{
            padding: '16px 12px',
            fontSize: 12,
            lineHeight: 1.5,
            color: '#97979b',
            fontFamily: 'system-ui, sans-serif',
            textAlign: 'center',
            textWrap: 'balance',
          }}
        >
          No comments yet. Inspect an element and click &quot;Add comment&quot;.
        </div>
      ) : (
        <div
          style={{
            maxHeight: 280,
            overflowY: 'auto',
            paddingBlock: 6,
          }}
        >
          {comments.map((c) => (
            <CommentRow
              key={c.id}
              comment={c}
              onDelete={() => removeComment(c.id)}
            />
          ))}
        </div>
      )}

      {/* Actions */}
      {comments.length > 0 && (
        <>
          <div style={{ borderTop: '1px solid #27272a', margin: '4px 0 0' }} />
          <div style={{ padding: '4px 6px' }}>
            <HoverButton style={menuItemStyle} onClick={handleCopy}>
              <ClipboardIcon />
              {copyFeedback ? 'Copied!' : 'Copy to clipboard'}
            </HoverButton>
            <HoverButton
              style={menuItemStyle}
              onClick={handleClear}
              color="#ef4444"
            >
              <TrashIcon />
              Clear all
            </HoverButton>
          </div>
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Root overlay component — mounted once per plugin instance
// ---------------------------------------------------------------------------

function CommentsRoot() {
  return (
    <>
      <CommentEditorOverlay />
      <CommentsMenuOverlay />
    </>
  )
}

// ---------------------------------------------------------------------------
// Mount the overlays inside the existing [data-react-xray] portal so that
// the inspector's "skip portal clicks" check covers our overlays too.
// Falls back to document.body if the XRay portal isn't found yet.
// ---------------------------------------------------------------------------

let overlayMounted = false

function getXRayPortal(): HTMLElement | null {
  return document.querySelector('[data-react-xray]')
}

function ensureOverlayMounted() {
  if (overlayMounted) return
  overlayMounted = true

  const mount = () => {
    const container = document.createElement('div')
    container.setAttribute('data-react-xray-comments', '')
    // pointer-events:auto so our overlays are interactive even inside the
    // portal which has pointer-events:none on its root
    container.style.cssText =
      'position:fixed;inset:0;pointer-events:none;z-index:999998;'

    // Prefer appending inside [data-react-xray] so the inspector skips our clicks
    const xrayPortal = getXRayPortal()
    if (xrayPortal) {
      xrayPortal.appendChild(container)
    } else {
      document.body.appendChild(container)
      // Retry once XRay portal exists (it's added in a useEffect)
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

// ---------------------------------------------------------------------------
// CommentsPlugin
// ---------------------------------------------------------------------------

export function CommentsPlugin(options: CommentsPluginOptions = {}): RVEPlugin {
  const { root } = options

  // Mount overlays eagerly (idempotent)
  ensureOverlayMounted()

  // The ToolbarIconWrapper captures the parent button element so we can
  // position the menu overlay relative to it.
  function ToolbarIconWrapper() {
    const wrapperRef = useRef<HTMLSpanElement>(null)

    useEffect(() => {
      if (wrapperRef.current) {
        let el: HTMLElement | null = wrapperRef.current
        while (el && el.tagName !== 'BUTTON') {
          el = el.parentElement
        }
        if (el instanceof HTMLButtonElement) {
          toolbarButtonEl = el
        }
      }
    })

    return (
      <span ref={wrapperRef}>
        <CommentsToolbarIcon />
      </span>
    )
  }

  return {
    name: 'comments',

    toolbarItems: [
      {
        id: 'comments',
        icon: <ToolbarIconWrapper />,
        label: 'Comments',
        onClick(_ctx, _services) {
          setMenuOpen(!menuOpen)
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
            setPending({
              filePath,
              lineNumber,
              anchorEl: ctx.element,
            })
            return true
          },
        },
      ]
    },
  }
}
