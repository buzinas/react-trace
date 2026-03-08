import Editor from '@monaco-editor/react'
import { useProjectRoot, useSelectedSource } from '@react-trace/core'
import {
  Button,
  CollapseIcon,
  ExpandIcon,
  IconButton,
  panelPopupStyle,
  SaveIcon,
} from '@react-trace/ui-components'
import { useAtom } from 'jotai'
import type { editor } from 'monaco-types'
import { useRef, useState } from 'react'

import { FolderAccessPrompt, handleGrantAccess } from './FolderAccessPrompt'
import { fileSystemService } from './fs'
import { ensureHighlightStyle } from './highlight'
import { configureBefore } from './monaco'
import { previewSettingsAtom } from './store'
import {
  EDITOR_WIDTH,
  INLINE_HEIGHT,
  LINE_HEIGHT,
  TOOLBAR_HEIGHT,
} from './styles'
import type { PreviewPluginOptions } from './types'
import { cleanPath, detectLanguage, pathToUri, shortName } from './utils'

type LoadState = 'needs-access' | 'loading' | 'ready'

type SourcePreviewProps = {
  options: PreviewPluginOptions
}
export function SourcePreview({ options }: SourcePreviewProps) {
  let { theme = 'one-dark-pro', disabled = false } = options
  const [persistedOptions, setPreviewSettings] = useAtom(previewSettingsAtom)
  if (!persistedOptions) {
    setPreviewSettings({ theme, disabled })
  }
  theme = persistedOptions?.theme || theme
  disabled = persistedOptions?.disabled ?? disabled

  const root = useProjectRoot()
  const source = useSelectedSource()
  const [expanded, setExpanded] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [loadState, setLoadState] = useState<LoadState>(
    fileSystemService.hasAccess ? 'loading' : 'needs-access',
  )
  const editorRef = useRef<editor.ICodeEditor>(null)

  if (!source) return null

  const currentPath = cleanPath(source.fileName)

  const handleGrant = async () => {
    const granted = await handleGrantAccess(root, () =>
      fileSystemService.requestAccess(),
    )
    if (granted) setLoadState('loading')
  }

  const handleSave = () => {
    const val = editorRef.current?.getValue()
    if (val != null) {
      fileSystemService
        .write(currentPath, val)
        .then(() => setDirty(false))
        .catch(() => {})
    }
  }

  const editorHeight = expanded
    ? `calc(80vh - ${!disabled ? TOOLBAR_HEIGHT : 0}px)`
    : INLINE_HEIGHT - (!disabled ? TOOLBAR_HEIGHT : 0)

  const toolbar = !disabled ? (
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
          <Button variant="accent" onClick={handleSave} title="Save (⌘S)">
            <SaveIcon /> Save
          </Button>
        )}
        <IconButton
          onClick={() => setExpanded((prev) => !prev)}
          title={expanded ? 'Collapse (Esc)' : 'Expand'}
        >
          {expanded ? <CollapseIcon /> : <ExpandIcon />}
        </IconButton>
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
          readOnly: disabled,
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
          if (!disabled) {
            editor.addCommand(
              monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
              handleSave,
            )
            editor.addCommand(monaco.KeyCode.Escape, () => setExpanded(false))
          }
          editor.updateOptions({ theme })

          const key = cleanPath(source.fileName)
          const uri = pathToUri(monaco, key)
          fileSystemService
            .read(key)
            .then((fileContent) => {
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
                      className: 'react-trace-highlighted-line',
                    },
                  },
                ])
              }
            })
            .catch(() => {})
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
          ...panelPopupStyle,
          position: 'fixed',
          top: '10vw',
          left: '10vw',
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
