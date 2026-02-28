import Editor from '@monaco-editor/react'
import type { ComponentContext, RVEServices } from '@react-xray/core'
import { IS_MAC, toAbsolutePath } from '@react-xray/core'
import type { editor } from 'monaco-types'
import { useRef, useState } from 'react'

import { ensureHighlightStyle } from './highlight'
import { CollapseIcon, ExpandIcon, SaveIcon } from './icons'
import { configureBefore } from './monaco'
import {
  actionButtonStyle,
  EDITOR_WIDTH,
  iconButtonStyle,
  INLINE_HEIGHT,
  LINE_HEIGHT,
  TOOLBAR_HEIGHT,
} from './styles'
import { cleanPath, detectLanguage, pathToUri, shortName } from './utils'

// ---------------------------------------------------------------------------
// FolderAccessPrompt — shown when fs.hasAccess is false
// ---------------------------------------------------------------------------

function FolderIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1 3.5a1 1 0 0 1 1-1h3l1.5 1.5H12a1 1 0 0 1 1 1V10.5a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3.5z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FolderAccessPrompt({
  root,
  onGrant,
  onCancel,
}: {
  root: string | undefined
  onGrant(): void
  onCancel(): void
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: '20px 16px',
        height: '100%',
        boxSizing: 'border-box',
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <span style={{ color: '#52525b' }}>
        <FolderIcon />
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#fafafa' }}>
          Folder access needed
        </span>
        <span style={{ fontSize: 12, color: '#71717a', lineHeight: 1.5 }}>
          {root ? (
            <>
              The project root path will be copied to your clipboard.
              <br />
              Navigate to it in the folder picker
              {IS_MAC && (
                <>
                  {' ('}
                  <kbd
                    style={{
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: 11,
                    }}
                  >
                    ⌘⇧G
                  </kbd>
                  {' to paste the path directly)'}
                </>
              )}
              .
            </>
          ) : (
            'Grant access to your project folder to preview source files.'
          )}
        </span>
        {root && (
          <span
            style={{
              fontSize: 11,
              fontFamily: 'ui-monospace, monospace',
              color: '#3b82f6',
              wordBreak: 'break-all',
            }}
          >
            {root}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            height: 28,
            padding: '0 12px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            background: 'transparent',
            border: '1px solid #3f3f46',
            color: '#d4d4d8',
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onGrant}
          style={{
            height: 28,
            padding: '0 12px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            background: '#fafafa',
            border: 'none',
            color: '#18181b',
          }}
        >
          Grant access
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SourcePreview
// ---------------------------------------------------------------------------

type LoadState = 'needs-access' | 'loading' | 'ready'

export function SourcePreview({
  ctx,
  services,
  editable,
  theme,
  root,
}: {
  ctx: ComponentContext
  services: RVEServices
  editable: boolean
  theme: string
  root?: string
}) {
  const source = ctx.source
  const [expanded, setExpanded] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [loadState, setLoadState] = useState<LoadState>(
    services.fs.hasAccess ? 'loading' : 'needs-access',
  )
  const editorRef = useRef<editor.ICodeEditor>(null)

  if (!source) return null

  const currentPath = cleanPath(source.fileName)

  const handleGrant = async () => {
    if (root) {
      const absPath = toAbsolutePath(root, undefined) ?? root
      navigator.clipboard.writeText(absPath).catch(() => {})
    }
    const granted = await services.fs.requestAccess()
    if (granted) setLoadState('loading')
  }

  const handleSave = () => {
    const val = editorRef.current?.getValue()
    if (val != null) {
      services.fs.write(currentPath, val)
      setDirty(false)
    }
  }

  const editorHeight = expanded
    ? `calc(80vh - ${editable ? TOOLBAR_HEIGHT : 0}px)`
    : INLINE_HEIGHT - (editable ? TOOLBAR_HEIGHT : 0)

  const toolbar = editable ? (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: TOOLBAR_HEIGHT,
        padding: '0 10px',
        borderBottom: '1px solid #27272a',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontFamily: 'ui-monospace, monospace',
          color: '#52525b',
        }}
      >
        {shortName(source.fileName)}
        <span style={{ color: '#3f3f46' }}>:{source.lineNumber}</span>
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {dirty && (
          <button
            onClick={handleSave}
            title="Save (⌘S)"
            style={actionButtonStyle}
          >
            <SaveIcon /> Save
          </button>
        )}
        <button
          onClick={() => setExpanded((prev) => !prev)}
          title={expanded ? 'Collapse (Esc)' : 'Expand'}
          style={iconButtonStyle}
        >
          {expanded ? <CollapseIcon /> : <ExpandIcon />}
        </button>
      </div>
    </div>
  ) : null

  const [dismissed, setDismissed] = useState(false)

  const content =
    loadState === 'needs-access' && !dismissed ? (
      <FolderAccessPrompt
        root={root}
        onGrant={handleGrant}
        onCancel={() => setDismissed(true)}
      />
    ) : (
      <Editor
        height={editorHeight}
        width="100%"
        theme={theme}
        options={{
          readOnly: !editable,
          minimap: { enabled: false },
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          fontSize: 12,
          lineHeight: LINE_HEIGHT,
          folding: false,
          glyphMargin: false,
          automaticLayout: true,
          padding: { top: 6, bottom: 6 },
          fixedOverflowWidgets: true,
        }}
        beforeMount={configureBefore}
        onMount={(editor, monaco) => {
          editorRef.current = editor
          if (editable) {
            editor.addCommand(
              monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
              handleSave,
            )
            editor.addCommand(monaco.KeyCode.Escape, () => setExpanded(false))
          }

          const key = cleanPath(source.fileName)
          const uri = pathToUri(monaco, key)
          services.fs.read(key).then((fileContent) => {
            if (!monaco.editor.getModel(uri)) {
              monaco.editor.createModel(fileContent, detectLanguage(key), uri)
            }
            const model = monaco.editor.getModel(uri)
            if (model) {
              const { lineNumber } = source
              editor.setModel(model)
              editor.revealLineInCenter(lineNumber)

              ensureHighlightStyle()
              const highlight = editor.createDecorationsCollection()
              highlight.set([
                {
                  range: new monaco.Range(lineNumber, 1, lineNumber, 1),
                  options: {
                    isWholeLine: true,
                    className: 'xray-highlighted-line',
                  },
                },
              ])
            }
          })
        }}
        onChange={() => setDirty(true)}
        loading={
          <div style={{ padding: '8px 12px', color: '#52525b', fontSize: 11 }}>
            Loading…
          </div>
        }
      />
    )

  // stopPropagation on keydown prevents Base UI's Menu from capturing letter
  // keys for its typeahead navigation (which would swallow 'a', 'b', etc.)
  const panel = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: '#18181b',
        overflow: 'hidden',
      }}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {toolbar}
      {content}
    </div>
  )

  if (!expanded) {
    return (
      <div onClick={(e) => e.stopPropagation()} style={{ width: EDITOR_WIDTH }}>
        {panel}
      </div>
    )
  }

  return (
    <div
      ref={(el) => {
        const parentElement = el?.parentElement?.parentElement
        if (!parentElement) return
        const transform = parentElement.style.transform
        parentElement.style.transform = ''
        return () => {
          parentElement.style.transform = transform
        }
      }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 9999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={() => setExpanded(false)}
    >
      <div
        style={{
          position: 'fixed',
          top: '10vw',
          left: '10vw',
          border: '1px solid #27272a',
          borderRadius: 10,
          boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
          overflow: 'hidden',
          width: '80vw',
          height: '80vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {panel}
      </div>
    </div>
  )
}
