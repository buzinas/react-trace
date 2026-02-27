import { useEffect, useRef, useState } from 'react'
import type { ComponentContext, RVEPlugin, RVEServices } from '@react-xray/core'

// ---------------------------------------------------------------------------
// Source preview component
// ---------------------------------------------------------------------------

// Lines visible above and below the target line
const LINES_BEFORE = 5
const LINES_AFTER = 6
const LINE_HEIGHT_PX = 11 * 1.6 // font-size × line-height
const VISIBLE_LINES = LINES_BEFORE + 1 + LINES_AFTER
const SCROLL_HEIGHT = Math.round(VISIBLE_LINES * LINE_HEIGHT_PX)

function SourcePreview({ ctx, services }: { ctx: ComponentContext; services: RVEServices }) {
  const source = ctx.source
  const [lines, setLines] = useState<string[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const requestId = useRef(0)

  // Load the entire file
  useEffect(() => {
    if (!source) return

    const id = ++requestId.current
    setLoading(true)
    setLines(null)
    setError(null)

    services.fs
      .read(source.fileName)
      .then((text) => {
        if (requestId.current !== id) return
        setLines(text.split('\n'))
      })
      .catch((err: unknown) => {
        if (requestId.current !== id) return
        setError(err instanceof Error ? err.message : 'Failed to read file')
      })
      .finally(() => {
        if (requestId.current === id) setLoading(false)
      })
  }, [source?.fileName, services.fs])

  // Scroll to keep the target line at LINES_BEFORE rows from the top
  useEffect(() => {
    if (!lines || !source || !scrollRef.current) return
    const targetRow = source.lineNumber - 1 // 0-indexed
    const scrollTo = Math.max(0, targetRow - LINES_BEFORE) * LINE_HEIGHT_PX
    scrollRef.current.scrollTop = scrollTo
  }, [lines, source?.lineNumber])

  if (!source) return null

  const lineCount = lines?.length ?? 0
  const gutterWidth = `${String(lineCount).length}ch`

  return (
    <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, lineHeight: 1.6 }}>
      {loading && (
        <div style={{ padding: '8px 12px', color: '#52525b' }}>Loading…</div>
      )}

      {error && (
        <div
          style={{
            padding: '8px 12px',
            color: '#71717a',
            fontStyle: 'italic',
            maxWidth: 300,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {error}
        </div>
      )}

      {lines && (
        <div
          ref={scrollRef}
          style={{
            maxHeight: SCROLL_HEIGHT,
            overflowY: 'auto',
            overflowX: 'auto',
            maxWidth: 480,
          }}
        >
          <pre style={{ margin: 0, padding: '6px 0', color: '#d4d4d8' }}>
            {lines.map((line, i) => {
              const lineNum = i + 1
              const isTarget = lineNum === source.lineNumber
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: 10,
                    paddingInline: 12,
                    background: isTarget ? 'rgba(59,130,246,0.12)' : 'transparent',
                    borderLeft: isTarget ? '2px solid #3b82f6' : '2px solid transparent',
                  }}
                >
                  <span
                    style={{
                      color: isTarget ? '#6b9dfa' : '#3f3f46',
                      userSelect: 'none',
                      minWidth: gutterWidth,
                      textAlign: 'right',
                      flexShrink: 0,
                    }}
                  >
                    {lineNum}
                  </span>
                  <span style={{ color: isTarget ? '#fafafa' : '#a1a1aa', whiteSpace: 'pre' }}>
                    {line || ' '}
                  </span>
                </div>
              )
            })}
          </pre>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function PreviewPlugin(): RVEPlugin {
  return {
    name: 'preview',
    subpanel: SourcePreview,
  }
}
