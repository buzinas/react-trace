import { Button } from '@react-xray/ui-components'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

import {
  addComment,
  getPendingSnapshot,
  setPending,
  subscribePending,
} from './store'

/**
 * Floating textarea overlay shown after the user clicks "Add comment" on a
 * component. Anchors itself to the inspected element's bounding rect.
 */
export function CommentEditorOverlay() {
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
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!text.trim()}
          >
            Comment
          </Button>
        </div>
      </div>
    </div>
  )
}
