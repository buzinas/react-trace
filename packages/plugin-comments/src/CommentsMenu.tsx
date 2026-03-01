import {
  Button,
  ClipboardIcon,
  IconButton,
  OpencodeIcon,
  PanelHeader,
  Textarea,
  TrashIcon,
  XIcon,
} from '@react-xray/ui-components'
import type { CSSProperties } from 'react'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { SendToOpencodeForm } from './SendToOpencode'
import {
  clearAllComments,
  type CommentEntry,
  getMenuSnapshot,
  getStoreSnapshot,
  pluginRoot,
  removeComment,
  setMenuOpen,
  subscribeMenu,
  subscribeStore,
  toolbarButtonEl,
  updateComment,
} from './store'
import { formatCommentNote } from './utils'

// ---------------------------------------------------------------------------
// HoverButton — stateful button with hover-dependent style
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

// ---------------------------------------------------------------------------
// CommentRow
// ---------------------------------------------------------------------------

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
          <IconButton
            onClick={onDelete}
            title="Remove comment"
            style={{ padding: 0, flexShrink: 0 }}
          >
            <XIcon />
          </IconButton>
        )}
      </div>

      {editing ? (
        <div style={{ marginTop: 4 }}>
          <Textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 6,
              marginTop: 4,
            }}
          >
            <Button
              variant="secondary"
              onClick={handleCancel}
              style={{ height: 24, fontSize: 11 }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!draft.trim()}
              style={{ height: 24, fontSize: 11 }}
            >
              Save
            </Button>
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

const menuItemStyle = (hover: boolean): CSSProperties => ({
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

export function CommentsMenuOverlay() {
  const isOpen = useSyncExternalStore(subscribeMenu, getMenuSnapshot)
  const comments = useSyncExternalStore(subscribeStore, getStoreSnapshot)
  const menuRef = useRef<HTMLDivElement>(null)
  const [copyFeedback, setCopyFeedback] = useState(false)
  const [showSendForm, setShowSendForm] = useState(false)

  // Close on outside click or Escape
  useEffect(() => {
    if (!isOpen) return

    function onPointerDown(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  if (!isOpen) return null

  // Anchor to the toolbar button; fall back to a sensible fixed position
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
      <PanelHeader
        title={
          <>
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
          </>
        }
        actionsRender={
          <IconButton onClick={() => setMenuOpen(false)} title="Close">
            <XIcon />
          </IconButton>
        }
      />

      {/* Comment list */}
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
        <div style={{ maxHeight: 280, overflowY: 'auto', paddingBlock: 6 }}>
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
          {showSendForm ? (
            <SendToOpencodeForm
              root={pluginRoot}
              onDone={() => {
                setShowSendForm(false)
                setMenuOpen(false)
              }}
            />
          ) : (
            <div style={{ padding: '4px 6px' }}>
              <HoverButton
                style={menuItemStyle}
                onClick={() => setShowSendForm(true)}
              >
                <OpencodeIcon size={13} />
                Send to OpenCode
              </HoverButton>
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
          )}
        </>
      )}
    </div>
  )
}
