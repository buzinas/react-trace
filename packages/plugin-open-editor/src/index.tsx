import { resolveSource, toAbsolutePath } from '@react-xray/core'
import type { ComponentContext, RVEPlugin, RVEServices } from '@react-xray/core'
import { OpenInEditorIcon } from '@react-xray/ui-components'

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
