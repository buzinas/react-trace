import { createOpencodeClient } from '@opencode-ai/sdk'
import type { Session } from '@opencode-ai/sdk'
import { Button } from '@react-xray/ui-components'
import { useEffect, useRef, useState } from 'react'

import { clearAllComments, getStoreSnapshot } from './store'
import { formatCommentNote } from './utils'

// ---------------------------------------------------------------------------
// SendToOpencodeForm
// ---------------------------------------------------------------------------

type Status =
  | 'idle'
  | 'loading-sessions'
  | 'ready'
  | 'sending'
  | 'sent'
  | 'error'

export function SendToOpencodeForm({
  root,
  onDone,
}: {
  root: string | undefined
  onDone(): void
}) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedId, setSelectedId] = useState<string>('__new__')
  const [generalComment, setGeneralComment] = useState('')
  const [status, setStatus] = useState<Status>('loading-sessions')
  const [errorMsg, setErrorMsg] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Lazily create the client — only when the form mounts
  const [client] = useState(() =>
    createOpencodeClient({
      baseUrl: 'http://localhost:4096',
      ...(root ? { directory: root } : {}),
    }),
  )

  useEffect(() => {
    client.session
      .list()
      .then((res) => {
        // Sort most-recently-updated first and filter out child sessions
        const list = (res.data ?? [])
          .filter((s) => !s.parentID)
          .toSorted((a, b) => (b.time?.updated ?? 0) - (a.time?.updated ?? 0))
        setSessions(list)
        setStatus('ready')
        // Pre-select the most recent session if one exists
        if (list.length > 0) setSelectedId(list[0]!.id)
        requestAnimationFrame(() => textareaRef.current?.focus())
      })
      .catch(() => {
        setStatus('error')
        setErrorMsg('Could not connect to OpenCode. Is it running?')
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = async () => {
    const comments = getStoreSnapshot()
    if (!comments.length) return

    setStatus('sending')
    setErrorMsg('')

    try {
      // Fetch line previews for all comments in parallel
      const previews = await Promise.all(
        comments.map(async (c) => {
          try {
            const res = await client.file.read({ query: { path: c.filePath } })
            const lines = (res.data?.content ?? '').split('\n')
            return lines[c.lineNumber - 1] ?? ''
          } catch {
            return ''
          }
        }),
      )

      // Build structured parts
      type Part =
        | {
            type: 'text'
            text: string
            synthetic?: boolean
            metadata?: Record<string, unknown>
          }
        | { type: 'file'; mime: string; filename: string; url: string }

      const parts: Part[] = []

      // Optional general comment — omit entirely if empty
      const trimmed = generalComment.trim()
      if (trimmed) parts.push({ type: 'text', text: trimmed })

      // One synthetic text + one file part per comment
      for (let i = 0; i < comments.length; i++) {
        const c = comments[i]!
        const preview = previews[i]!
        const absUrl = root
          ? `file://${root.replace(/\/$/, '')}/${c.filePath}?start=${c.lineNumber}&end=${c.lineNumber}`
          : `file:///${c.filePath}?start=${c.lineNumber}&end=${c.lineNumber}`
        const filename = c.filePath.split('/').pop() ?? c.filePath

        parts.push({
          type: 'text',
          text: formatCommentNote(c.filePath, c.lineNumber, c.comment),
          synthetic: true,
          metadata: {
            opencodeComment: {
              path: c.filePath,
              selection: {
                startLine: c.lineNumber,
                endLine: c.lineNumber,
                startChar: 0,
                endChar: 0,
              },
              comment: c.comment,
              preview,
              origin: 'file',
            },
          },
        })

        parts.push({ type: 'file', mime: 'text/plain', filename, url: absUrl })
      }

      // Resolve the target session ID
      let sessionId = selectedId
      if (sessionId === '__new__') {
        const res = await client.session.create({ body: {} })
        if (!res.data?.id) throw new Error('Failed to create session')
        sessionId = res.data.id
      }

      await client.session.promptAsync({
        path: { id: sessionId },
        body: { parts },
      })

      clearAllComments()
      setStatus('sent')
      setTimeout(onDone, 1200)
    } catch (e) {
      setStatus('error')
      setErrorMsg(e instanceof Error ? e.message : 'Failed to send to OpenCode')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onDone()
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  if (status === 'sent') {
    return (
      <div
        style={{
          padding: '12px',
          textAlign: 'center',
          fontSize: 12,
          color: '#4ade80',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        Sent to OpenCode!
      </div>
    )
  }

  const loading = status === 'loading-sessions'
  const sending = status === 'sending'
  const disabled = loading || sending

  return (
    <div
      style={{
        padding: '10px 12px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {/* Session selector */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: 11,
            color: '#71717a',
            fontFamily: 'system-ui, sans-serif',
            marginBottom: 4,
          }}
        >
          Session
        </label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          disabled={disabled}
          style={{
            width: '100%',
            background: '#0f0f11',
            border: '1px solid #3f3f46',
            borderRadius: 5,
            color: '#fafafa',
            fontSize: 12,
            fontFamily: 'system-ui, sans-serif',
            padding: '5px 8px',
            outline: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            boxSizing: 'border-box',
          }}
        >
          <option value="__new__">+ New session</option>
          {loading ? (
            <option disabled>Loading sessions…</option>
          ) : (
            sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title || `Session ${s.id.slice(0, 8)}`}
              </option>
            ))
          )}
        </select>
      </div>

      {/* General comment */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: 11,
            color: '#71717a',
            fontFamily: 'system-ui, sans-serif',
            marginBottom: 4,
          }}
        >
          Message <span style={{ color: '#52525b' }}>(optional)</span>
        </label>
        <textarea
          ref={textareaRef}
          value={generalComment}
          onChange={(e) => setGeneralComment(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Left the comments below, please address"
          rows={2}
          disabled={disabled}
          style={{
            width: '100%',
            background: '#0f0f11',
            border: '1px solid #3f3f46',
            borderRadius: 5,
            outline: 'none',
            resize: 'vertical',
            color: '#fafafa',
            fontSize: 12,
            fontFamily: 'system-ui, sans-serif',
            lineHeight: 1.4,
            padding: '5px 8px',
            boxSizing: 'border-box',
            caretColor: '#3b82f6',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
          onBlur={(e) => (e.target.style.borderColor = '#3f3f46')}
        />
      </div>

      {/* Error */}
      {status === 'error' && errorMsg && (
        <p
          style={{
            margin: 0,
            fontSize: 11,
            color: '#f87171',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {errorMsg}
        </p>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
        <Button variant="secondary" onClick={onDone} disabled={sending}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSend} disabled={disabled}>
          {sending ? 'Sending…' : 'Send'}
        </Button>
      </div>
    </div>
  )
}
