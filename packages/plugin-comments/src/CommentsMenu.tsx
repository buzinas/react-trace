import type { CSSProperties } from 'react'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { ClipboardIcon, TrashIcon, XIcon } from './icons'
import {
  clearAllComments,
  type CommentEntry,
  getMenuSnapshot,
  getStoreSnapshot,
  removeComment,
  setMenuOpen,
  subscribeMenu,
  subscribeStore,
  toolbarButtonEl,
  updateComment,
} from './store'
import { formatCommentNote } from './utils'

const editorButtonBase: CSSProperties = {
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

  // Keep draft in sync if the comment text changes externally
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
      {/* Header: file:line + delete button */}
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

      {/* Body — click to edit, textarea when editing */}
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

export function CommentsMenuOverlay() {
  const isOpen = useSyncExternalStore(subscribeMenu, getMenuSnapshot)
  const comments = useSyncExternalStore(subscribeStore, getStoreSnapshot)
  const menuRef = useRef<HTMLDivElement>(null)
  const [copyFeedback, setCopyFeedback] = useState(false)

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
