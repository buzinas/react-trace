import { useProjectRoot } from '@react-xray/core'
import {
  Button,
  ClipboardIcon,
  DropdownMenu,
  IconButton,
  OpencodeIcon,
  PanelHeader,
  Textarea,
  TrashIcon,
  XIcon,
} from '@react-xray/ui-components'
import { useEffect, useRef, useState } from 'react'

import { SendToOpencodeForm } from './SendToOpencode'
import {
  type CommentEntry,
  useCommentEntries,
  useCommentsActions,
} from './store'
import { formatCommentNote } from './utils'

function CommentRow({
  comment,
  onDelete,
  onUpdate,
}: {
  comment: CommentEntry
  onDelete(): void
  onUpdate(text: string): void
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
    if (trimmed && trimmed !== comment.comment) onUpdate(trimmed)
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
            <XIcon size={12} />
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

export function CommentsMenu({ onClose }: { onClose(): void }) {
  const root = useProjectRoot()
  const comments = useCommentEntries()
  const { clearAllComments, removeComment, updateComment } =
    useCommentsActions()
  const [copyFeedback, setCopyFeedback] = useState(false)
  const [showSendForm, setShowSendForm] = useState(false)

  useEffect(() => {
    if (!comments.length) setShowSendForm(false)
  }, [comments.length])

  const handleCopy = () => {
    if (!comments.length) return
    const text = comments
      .map((c) => formatCommentNote(c.filePath, c.lineNumber, c.comment))
      .join('\n\n')

    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopyFeedback(true)
        setTimeout(() => setCopyFeedback(false), 1500)
      })
      .catch(() => {})
  }

  const handleClear = () => {
    clearAllComments()
    onClose()
  }

  return (
    <div
      style={{
        width: 320,
        overflow: 'hidden',
      }}
      onClick={(e) => e.stopPropagation()}
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
          <IconButton onClick={onClose} title="Close">
            <XIcon />
          </IconButton>
        }
      />

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
          style={{ maxHeight: 280, overflowY: 'auto', paddingBlock: 6 }}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {comments.map((c) => (
            <CommentRow
              key={c.id}
              comment={c}
              onDelete={() => removeComment(c.id)}
              onUpdate={(text) => updateComment({ id: c.id, text })}
            />
          ))}
        </div>
      )}

      {comments.length > 0 && (
        <>
          <div style={{ borderTop: '1px solid #27272a', margin: '4px 0 0' }} />
          {showSendForm ? (
            <SendToOpencodeForm
              root={root}
              comments={comments}
              onClearComments={clearAllComments}
              onDone={() => {
                setShowSendForm(false)
                onClose()
              }}
            />
          ) : (
            <div style={{ padding: '4px 6px' }}>
              <DropdownMenu.Item
                closeOnClick={false}
                onClick={() => setShowSendForm(true)}
              >
                <OpencodeIcon size={13} />
                Send to OpenCode
              </DropdownMenu.Item>
              <DropdownMenu.Item closeOnClick={false} onClick={handleCopy}>
                <ClipboardIcon />
                {copyFeedback ? 'Copied!' : 'Copy to clipboard'}
              </DropdownMenu.Item>
              <DropdownMenu.Item
                style={{ color: '#ef4444' }}
                onClick={handleClear}
              >
                <TrashIcon />
                Clear all
              </DropdownMenu.Item>
            </div>
          )}
        </>
      )}
    </div>
  )
}
