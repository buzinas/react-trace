import { Trace as CoreTrace } from '@react-trace/core'
import type { TraceProps } from '@react-trace/core'
import { CommentsPlugin } from '@react-trace/plugin-comments'
import { CopyToClipboardPlugin } from '@react-trace/plugin-copy-to-clipboard'
import { OpenEditorPlugin } from '@react-trace/plugin-open-editor'
import type { EditorPreset } from '@react-trace/plugin-open-editor'
import { PreviewPlugin } from '@react-trace/plugin-preview'

export interface TraceAllInOneProps extends TraceProps {
  /**
   * Disable inline file editing in the preview panel.
   * Hides the Save button (⌘S) and the expand button.
   * @default false
   */
  editingDisabled?: boolean
  /**
   * The editor to open files in via the "Open in Editor" action.
   * @default 'vscode'
   */
  editor?: EditorPreset
}

/**
 * Batteries-included Trace with all official plugins pre-wired:
 * - preview (inline Monaco editor)
 * - copy-to-clipboard
 * - open-editor
 * - comments (with Send to OpenCode)
 *
 * For granular control, use the individual `@react-trace/*` packages instead.
 */
export default function Trace({
  editingDisabled = false,
  editor = 'vscode',
  plugins = [],
  ...rest
}: TraceAllInOneProps) {
  return (
    <CoreTrace
      {...rest}
      plugins={[
        PreviewPlugin({ disabled: editingDisabled }),
        CopyToClipboardPlugin(),
        OpenEditorPlugin({ editor }),
        CommentsPlugin(),
        ...plugins,
      ]}
    />
  )
}

// Re-export useful types for consumers
export type { EditorPreset }
