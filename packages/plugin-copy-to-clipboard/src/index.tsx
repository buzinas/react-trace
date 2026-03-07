import type { XRayPlugin } from '@react-xray/core'
import {
  resolveSource,
  toRelativePath,
  useClearSelectedContext,
  useProjectRoot,
  useSelectedSource,
} from '@react-xray/core'
import { ClipboardIcon, DropdownMenu } from '@react-xray/ui-components'

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

export function CopyToClipboardPlugin(): XRayPlugin {
  return {
    name: 'copy-to-clipboard',
    actionPanel: CopyToClipboardActionPanel,
  }
}
