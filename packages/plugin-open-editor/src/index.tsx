import type { XRayPlugin } from '@react-xray/core'
import {
  resolveSource,
  toAbsolutePath,
  useClearSelectedContext,
  useProjectRoot,
  useSelectedSource,
} from '@react-xray/core'
import { DropdownMenu, OpenInEditorIcon } from '@react-xray/ui-components'

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
}: OpenEditorOptions = {}): XRayPlugin {
  const editorLabel = EDITOR_LABELS[editor]

  function OpenEditorActionPanel() {
    const selectedSource = useSelectedSource()
    const projectRoot = useProjectRoot()
    const clearSelectedContext = useClearSelectedContext()

    if (!selectedSource) return null

    const handleOpenEditor = async () => {
      clearSelectedContext()

      try {
        const resolved = await resolveSource(selectedSource)
        const path = toAbsolutePath(resolved.fileName, projectRoot)
        if (!path) return

        const url = buildEditorUrl(
          editor,
          path,
          resolved.lineNumber,
          resolved.columnNumber,
        )
        window.open(url)
      } catch {}
    }

    return (
      <DropdownMenu.Item onClick={handleOpenEditor}>
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <OpenInEditorIcon />
        </span>
        {`Open in ${editorLabel}`}
      </DropdownMenu.Item>
    )
  }

  return {
    name: 'open-editor',
    actionPanel: OpenEditorActionPanel,
  }
}
