import { resolveSource } from '@react-xray/core'
import type { ComponentContext, RVEPlugin, RVEServices } from '@react-xray/core'
export type EditorPreset =
  | 'vscode'
  | 'cursor'
  | 'windsurf'
  | 'webstorm'
  | 'intellij'
export interface OpenEditorOptions {
  /**
   * The editor to open files in.
   * @default 'vscode'
   */
  editor?: EditorPreset
  /**
   * Absolute path to the project root.
   * Only needed for React 19 + Vite when source map paths are relative
   * (e.g. /src/App.tsx). Not required for React 18 (absolute paths from
   * _debugSource) or Vite's /@fs/ convention.
   */
  root?: string
}
const EDITOR_LABELS: Record<EditorPreset, string> = {
  vscode: 'VS Code',
  cursor: 'Cursor',
  windsurf: 'Windsurf',
  webstorm: 'WebStorm',
  intellij: 'IntelliJ',
}
/**
 * Resolves a source fileName (which may be a Vite dev URL or an absolute path)
 * to an absolute filesystem path suitable for editor URL schemes.
 *
 * Handles:
 *   - Absolute paths (React 18 / _debugSource)       → used as-is
 *   - Vite /@fs/ URLs                                → strip /@fs prefix
 *   - Vite relative URLs (/src/App.tsx)              → prepend root if provided
 */
function toAbsolutePath(fileName: string, root?: string): string | null {
  // Strip Vite HMR timestamp (?t=...)
  const clean = (fileName.split('?')[0] ?? fileName).trim()
  if (!clean) return null
  try {
    const { pathname } = new URL(clean)
    // Vite embeds the absolute path after /@fs/
    if (pathname.startsWith('/@fs/')) return pathname.slice('/@fs'.length)
    // Standard Vite URL — resolve against root if provided
    return root ? root.replace(/\/$/, '') + pathname : pathname
  } catch {
    // Not a URL — already an absolute filesystem path (React 18)
    return clean
  }
}
/**
 * Builds the editor-specific URL to open a file at a given line/column.
 *
 * VS Code family uses:  {editor}://file/{path}:{line}:{col}
 * JetBrains uses:       {editor}://open?file={path}&line={line}
 */
function buildEditorUrl(
  editor: EditorPreset,
  path: string,
  line: number,
  col: number,
): string {
  if (editor === 'webstorm') {
    return `webstorm://open?file=${encodeURIComponent(path)}&line=${line}`
  }
  if (editor === 'intellij') {
    return `idea://open?file=${encodeURIComponent(path)}&line=${line}`
  }
  // VS Code family: vscode, cursor, windsurf — identical format, different protocol
  return `${editor}://file/${path}:${line}:${col}`
}
function OpenInEditorIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      aria-hidden="true"
    >
      {/* Box (file/window) */}
      <path
        d="M5 1.5H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V8"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      {/* Arrow pointing out */}
      <path
        d="M8 1h4m0 0v4M12 1 6.5 6.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
export function OpenEditorPlugin(options: OpenEditorOptions = {}): RVEPlugin {
  const { editor = 'vscode', root } = options
  const editorLabel = EDITOR_LABELS[editor]
  return {
    name: 'open-editor',
    actions(ctx: ComponentContext, _services: RVEServices) {
      if (!ctx.source) return []
      return [
        {
          id: 'open-in-editor',
          label: `Open in ${editorLabel}`,
          icon: <OpenInEditorIcon />,
          onClick(ctx: ComponentContext) {
            // resolveSource is a cache hit at click time (already ran during hover)
            resolveSource(ctx.source!).then((resolved) => {
              const path = toAbsolutePath(resolved.fileName, root)
              if (!path) return
              const url = buildEditorUrl(
                editor,
                path,
                resolved.lineNumber,
                resolved.columnNumber,
              )
              window.open(url)
            })
          },
        },
      ]
    },
  }
}
