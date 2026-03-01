import { Popover } from '@react-xray/ui-components'
import { useSyncExternalStore } from 'react'

import { FolderAccessPrompt, handleGrantAccess } from './FolderAccessPrompt'
import {
  folderButtonEl,
  getFolderPromptSnapshot,
  pluginServices,
  setFolderPromptOpen,
  subscribeFolderPrompt,
  xrayPortalEl,
} from './folderPrompt'

export function FolderAccessOverlay() {
  const isOpen = useSyncExternalStore(
    subscribeFolderPrompt,
    getFolderPromptSnapshot,
  )

  const services = pluginServices
  if (!services) return null

  const handleGrant = async () => {
    const granted = await handleGrantAccess(services.root, () =>
      services.fs.requestAccess(),
    )
    if (granted) setFolderPromptOpen(false)
  }

  return (
    <Popover.Root
      open={isOpen}
      onOpenChange={(open: boolean) => {
        if (!open) setFolderPromptOpen(false)
      }}
    >
      <Popover.Portal container={xrayPortalEl}>
        <Popover.Positioner
          anchor={folderButtonEl}
          side="top"
          align="end"
          sideOffset={8}
          collisionPadding={8}
          positionMethod="fixed"
          style={{ zIndex: 9999999, pointerEvents: 'auto' }}
        >
          <Popover.Popup
            style={{ width: 280, overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <FolderAccessPrompt
              root={services.root}
              onGrant={handleGrant}
              onCancel={() => setFolderPromptOpen(false)}
            />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
