import { createOpencodeClient } from '@opencode-ai/sdk'
import type { Session } from '@opencode-ai/sdk'
import { Button, Select, Textarea } from '@react-xray/ui-components'
import { useEffect, useRef, useState } from 'react'

import type { CommentEntry } from './store'
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
  comments,
  onClearComments,
  onDone,
}: {
  root: string | undefined
  comments: CommentEntry[]
  onClearComments(): void
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
  }, [client])

  const handleSend = async () => {
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

      onClearComments()
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
      onKeyDown={(e) => e.stopPropagation()}
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
        <Select.Root
          value={selectedId}
          onValueChange={(v) => v && setSelectedId(v)}
          disabled={disabled}
        >
          <Select.Trigger style={{ borderRadius: 4 }}>
            <Select.Value placeholder="Select a session…" />
          </Select.Trigger>
          <Select.Positioner style={{ zIndex: 9999999 }}>
            <Select.Popup>
              <Select.Item value="__new__">
                <Select.ItemText>+ New session</Select.ItemText>
              </Select.Item>
              {loading ? (
                <Select.Item value="__loading__" disabled>
                  <Select.ItemText>Loading sessions…</Select.ItemText>
                </Select.Item>
              ) : (
                sessions.map((s) => (
                  <Select.Item key={s.id} value={s.id}>
                    <Select.ItemText>
                      {s.title || `Session ${s.id.slice(0, 8)}`}
                    </Select.ItemText>
                  </Select.Item>
                ))
              )}
            </Select.Popup>
          </Select.Positioner>
        </Select.Root>
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
        <Textarea
          ref={textareaRef}
          value={generalComment}
          onChange={(e) => setGeneralComment(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Left the comments below, please address"
          rows={2}
          disabled={disabled}
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
