import Editor from '@monaco-editor/react'
import type { ComponentContext, RVEServices } from '@react-xray/core'
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

export function SourcePreview({
  ctx,
  services,
  editable,
  theme,
}: {
  ctx: ComponentContext
  services: RVEServices
  editable: boolean
  theme: string
}) {
  const source = ctx.source
  const [expanded, setExpanded] = useState(false)
  const [dirty, setDirty] = useState(false)
  const editorRef = useRef<editor.ICodeEditor>(null)

  if (!source) return null

  const currentPath = cleanPath(source.fileName)

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

  const content = (
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
          top: 0,
          left: 0,
          border: '1px solid #27272a',
          borderRadius: 10,
          boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
          overflow: 'hidden',
          transform: 'translate(-50%, -25%)',
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
