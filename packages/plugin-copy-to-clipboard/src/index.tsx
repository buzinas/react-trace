import type { TracePlugin } from '@react-trace/core'
import { useClearSelectedContext, useSelectedSource } from '@react-trace/core'
import { ClipboardIcon, DropdownMenu } from '@react-trace/ui-components'

function CopyToClipboardActionPanel() {
  const selectedSource = useSelectedSource()
  const clearSelectedContext = useClearSelectedContext()

  if (!selectedSource) return null

  const handleCopy = () => {
    clearSelectedContext()
    navigator.clipboard
      .writeText(`${selectedSource.relativePath}:${selectedSource.lineNumber}`)
      .catch(() => {})
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
