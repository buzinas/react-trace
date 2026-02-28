import { resolveSource, toAbsolutePath } from '@react-xray/core'
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
}
const EDITOR_LABELS: Record<EditorPreset, string> = {
  vscode: 'VS Code',
  cursor: 'Cursor',
  windsurf: 'Windsurf',
  webstorm: 'WebStorm',
  intellij: 'IntelliJ',
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
export function OpenEditorPlugin({
  editor = 'vscode',
}: OpenEditorOptions = {}): RVEPlugin {
  const editorLabel = EDITOR_LABELS[editor]
  return {
    name: 'open-editor',
    actions(ctx: ComponentContext, services: RVEServices) {
      if (!ctx.source) return []
      const root = services.root
      return [
        {
          id: 'open-in-editor',
          label: `Open in ${editorLabel}`,
          icon: <OpenInEditorIcon />,
          onClick(ctx: ComponentContext) {
            // resolveSource is a cache hit at click time (already ran during hover)
            resolveSource(ctx.source!)
              .then((resolved) => {
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
              .catch(() => {})
          },
        },
      ]
    },
  }
}
