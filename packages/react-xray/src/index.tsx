import { XRay as CoreXRay } from '@react-xray/core'
import type { XRayProps } from '@react-xray/core'
import { CommentsPlugin } from '@react-xray/plugin-comments'
import { CopyToClipboardPlugin } from '@react-xray/plugin-copy-to-clipboard'
import { OpenEditorPlugin } from '@react-xray/plugin-open-editor'
import type { EditorPreset } from '@react-xray/plugin-open-editor'
import { PreviewPlugin } from '@react-xray/plugin-preview'

export interface XRayAllInOneProps extends Pick<
  XRayProps,
  'root' | 'position'
> {
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
 * Batteries-included XRay with all official plugins pre-wired:
 * - preview (inline Monaco editor)
 * - copy-to-clipboard
 * - open-editor
 * - comments (with Send to OpenCode)
 *
 * For granular control, use the individual `@react-xray/*` packages instead.
 */
export default function XRay({
  editingDisabled = false,
  editor = 'vscode',
  ...rest
}: XRayAllInOneProps) {
  return (
    <CoreXRay
      {...rest}
      plugins={[
        PreviewPlugin({ disabled: editingDisabled }),
        CopyToClipboardPlugin(),
        OpenEditorPlugin({ editor }),
        CommentsPlugin(),
      ]}
    />
  )
}

// Re-export useful types for consumers
export type { EditorPreset, XRayProps }
