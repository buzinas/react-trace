import type { TracePlugin } from '@react-trace/core'
import {
  resolveSource,
  toRelativePath,
  useClearSelectedContext,
  useProjectRoot,
  useSelectedSource,
} from '@react-trace/core'
import { ClipboardIcon, DropdownMenu } from '@react-trace/ui-components'

function CopyToClipboardActionPanel() {
  const selectedSource = useSelectedSource()
  const projectRoot = useProjectRoot()
  const clearSelectedContext = useClearSelectedContext()

  if (!selectedSource) return null

  const handleCopy = async () => {
    clearSelectedContext()

    try {
      const resolved = await resolveSource(selectedSource)
      const path = toRelativePath(resolved.fileName, projectRoot)

      await navigator.clipboard.writeText(`${path}:${resolved.lineNumber}`)
    } catch {}
  }

  return (
    <DropdownMenu.Item onClick={handleCopy}>
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <ClipboardIcon />
      </span>
      Copy path
    </DropdownMenu.Item>
  )
}

export function CopyToClipboardPlugin(): TracePlugin {
  return {
    name: 'copy-to-clipboard',
    actionPanel: CopyToClipboardActionPanel,
  }
}
