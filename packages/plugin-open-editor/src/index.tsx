import type { TracePlugin } from '@react-trace/core'
import {
  useClearSelectedContext,
  useSelectedSource,
  useWidgetPortalContainer,
} from '@react-trace/core'
import {
  DropdownMenu,
  OpenInEditorIcon,
  Select,
} from '@react-trace/ui-components'
import { useAtom, useAtomValue } from 'jotai'
import type { CSSProperties } from 'react'

import { openEditorSettingsAtom } from './store'
import type { EditorPreset } from './types'

export type { EditorPreset }

export interface OpenEditorPluginOptions {
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

const editors = Object.entries(EDITOR_LABELS).map(([value, label]) => ({
  value: value as EditorPreset,
  label,
}))

const LABEL_STYLE: CSSProperties = {
  fontSize: 12,
  color: '#d4d4d8',
  fontFamily: 'system-ui, sans-serif',
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
}: OpenEditorPluginOptions = {}): TracePlugin {
  function OpenEditorActionPanel() {
    const selectedSource = useSelectedSource()
    const clearSelectedContext = useClearSelectedContext()
    const editorSettings = useAtomValue(openEditorSettingsAtom)
    const currentEditor = editorSettings?.editor ?? editor

    if (!selectedSource) return null

    const handleOpenEditor = () => {
      clearSelectedContext()
      const url = buildEditorUrl(
        currentEditor,
        selectedSource.absolutePath,
        selectedSource.lineNumber,
        selectedSource.columnNumber,
      )
      window.open(url)
    }

    return (
      <DropdownMenu.Item onClick={handleOpenEditor}>
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <OpenInEditorIcon />
        </span>
        {`Open in ${EDITOR_LABELS[currentEditor]}`}
      </DropdownMenu.Item>
    )
  }

  function OpenEditorSettings() {
    const portalContainer = useWidgetPortalContainer()

    const [editorSettings = { editor }, setEditorSettings] = useAtom(
      openEditorSettingsAtom,
    )

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={LABEL_STYLE}>Default editor</label>
          <Select.Root
            value={editorSettings.editor}
            items={editors}
            onValueChange={(value) => {
              if (value) {
                setEditorSettings({ ...editorSettings, editor: value })
              }
            }}
          >
            <Select.Trigger onClick={(e) => e.stopPropagation()}>
              <Select.Value />
            </Select.Trigger>

            <Select.Portal container={portalContainer}>
              <Select.Positioner
                style={{ zIndex: 100000000, pointerEvents: 'auto' }}
              >
                <Select.Popup>
                  <Select.List>
                    {editors.map((option) => (
                      <Select.Item
                        key={option.value}
                        value={option.value}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Select.ItemText>{option.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.List>
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        </div>
      </div>
    )
  }

  return {
    name: 'open-editor',
    actionPanel: OpenEditorActionPanel,
    settings: OpenEditorSettings,
  }
}
