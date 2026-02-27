import Editor, { loader } from '@monaco-editor/react'
import type { ComponentContext, RVEPlugin, RVEServices } from '@react-xray/core'
import { shikiToMonaco } from '@shikijs/monaco'
import type { editor } from 'monaco-types'
import type { CSSProperties } from 'react'
import { useRef, useState } from 'react'
import { createHighlighter } from 'shiki'

// Start Monaco CDN download immediately when the plugin is imported
loader.init()

const langs = ['typescript', 'javascript', 'graphql', 'css']
const highlighterPromise = createHighlighter({
  themes: ['one-dark-pro'],
  langs,
})

function cleanPath(fileName: string): string {
  return fileName.split('?')[0]!
}

function detectLanguage(fileName: string): string {
  const ext = cleanPath(fileName).split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    mjs: 'javascript',
    cjs: 'javascript',
  }
  return map[ext] ?? 'plaintext'
}

function shortName(fileName: string): string {
  const path = cleanPath(fileName)
  try {
    return new URL(path).pathname.split('/').slice(-2).join('/')
  } catch {
    return path.replace(/\\/g, '/').split('/').slice(-2).join('/')
  }
}

/** Convert a file path (URL or absolute) to a monaco file:// URI */
function pathToUri(
  monaco: any,
  path: string,
): ReturnType<typeof monaco.Uri.parse> {
  try {
    const { pathname } = new URL(path) // Vite URL → extract pathname
    return monaco.Uri.parse(`file://${pathname}`)
  } catch {
    const normalized = path.replace(/\\/g, '/')
    return monaco.Uri.parse(
      normalized.startsWith('/')
        ? `file://${normalized}`
        : `file:///${normalized}`,
    )
  }
}

const LINE_HEIGHT = 19
const INLINE_LINES = 12
const INLINE_HEIGHT = INLINE_LINES * LINE_HEIGHT
const EDITOR_WIDTH = 480
const TOOLBAR_HEIGHT = 33

function SourcePreview({
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

  // All files for the current owner chain: Record<cleanPath, content>
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

  // Wait for files before rendering Monaco — no empty editor flash,
  // and onMount is guaranteed to have files ready.
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
      beforeMount={(monaco) => {
        // Disable the language server — proper TS type checking requires
        // loading all project types which is a rabbit hole. Shiki handles
        // syntax highlighting instead.
        const noValidation = {
          noSemanticValidation: true,
          noSyntaxValidation: true,
        }
        const { typescriptDefaults, javascriptDefaults } =
          monaco.languages.typescript

        typescriptDefaults.setDiagnosticsOptions(noValidation)
        javascriptDefaults.setDiagnosticsOptions(noValidation)

        // Minimal compiler options so Monaco's tokeniser doesn't trip on JSX
        const compilerOptions = {
          jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
          allowJs: true,
        }
        typescriptDefaults.setCompilerOptions(compilerOptions)
        javascriptDefaults.setCompilerOptions(compilerOptions)

        // Register language IDs then wire Shiki for highlighting
        for (const id of langs) monaco.languages.register({ id })
        highlighterPromise.then((h) => shikiToMonaco(h, monaco))
      }}
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
        services.fs.read(key).then((content) => {
          if (!monaco.editor.getModel(uri)) {
            monaco.editor.createModel(content, detectLanguage(key), uri)
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
      // Shown while Monaco CDN loads; files are ready so we can show the pre
      loading={
        <div style={{ padding: '8px 12px', color: '#52525b', fontSize: 11 }}>
          Loading…
        </div>
      }
    />
  )

  const panel = (
    // stopPropagation on keydown prevents Base UI's Menu from capturing letter
    // keys for its typeahead navigation feature (which would swallow 'a', 'b', etc.)
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

// ---------------------------------------------------------------------------
// Styles & icons
// ---------------------------------------------------------------------------

const actionButtonStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  background: 'rgba(59,130,246,0.15)',
  border: '1px solid rgba(59,130,246,0.3)',
  borderRadius: 5,
  color: '#93c5fd',
  cursor: 'pointer',
  fontSize: 11,
  padding: '3px 8px',
  fontFamily: 'system-ui, sans-serif',
}

const iconButtonStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: 'none',
  color: '#52525b',
  cursor: 'pointer',
  padding: 4,
  borderRadius: 4,
  lineHeight: 1,
}

function SaveIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 1h7l2 2v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M3 1v3h5V1M3 11V7h6v4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ExpandIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5.5 2H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M8 1h4m0 0v4M12 1 6.5 6.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CollapseIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 2v4h4M5 11H1V7"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 1 7.5 5.5M1 12l4.5-4.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export interface PreviewPluginOptions {
  /** Allow editing. Shows Save (⌘S) + Expand buttons. Saves via FileSystemService. @default false */
  editable?: boolean
  /** Shiki theme ID. @default 'one-dark-pro' — any https://shiki.style/themes value works. */
  theme?: string
}

export function PreviewPlugin(options: PreviewPluginOptions = {}): RVEPlugin {
  const { editable = false, theme = 'one-dark-pro' } = options

  function BoundSourcePreview({
    ctx,
    services,
  }: {
    ctx: ComponentContext
    services: RVEServices
  }) {
    return (
      <SourcePreview
        ctx={ctx}
        services={services}
        editable={editable}
        theme={theme}
      />
    )
  }

  return { name: 'preview', subpanel: BoundSourcePreview }
}
function ensureHighlightStyle() {
  if (document.getElementById('xray-highlighted-line')) return

  const style = document.createElement('style')
  style.id = 'xray-highlighted-line'
  style.textContent = `
    .xray-highlighted-line {
      background-color: rgba(0, 200, 255, 0.25);
      animation: xray-highlight-flash 1.2s ease-out;
    }

    @keyframes xray-highlight-flash {
      from { background-color: rgba(0, 200, 255, 0.6); }
      to   { background-color: rgba(0, 200, 255, 0.25); }
    }
  `
  document.head.appendChild(style)
}
