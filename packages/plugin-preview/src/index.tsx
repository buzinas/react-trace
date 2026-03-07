import type { XRayPlugin } from '@react-xray/core'
import {
  useDeactivateInspector,
  useProjectRoot,
  useWidgetPortalContainer,
  useWidgetServices,
} from '@react-xray/core'
import {
  FolderIcon,
  Popover,
  ToolbarButton,
  Tooltip,
} from '@react-xray/ui-components'
import { useRef, useState, useSyncExternalStore } from 'react'

import { FolderAccessPrompt, handleGrantAccess } from './FolderAccessPrompt'
import { PreviewSettings } from './PreviewSettings'
import { SourcePreview } from './SourcePreview'
import type { PreviewPluginOptions } from './types'

export type { PreviewPluginOptions }

function FolderToolbarIcon({ hasAccess }: { hasAccess: boolean }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <FolderIcon />
      {hasAccess && (
        <span
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#22c55e',
            border: '1.5px solid #18181b',
            pointerEvents: 'none',
          }}
        />
      )}
    </span>
  )
}

function PreviewToolbar() {
  const services = useWidgetServices()
  const projectRoot = useProjectRoot()
  const portalContainer = useWidgetPortalContainer()
  const deactivateInspector = useDeactivateInspector()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [isPromptOpen, setIsPromptOpen] = useState(false)
  const hasAccess = useSyncExternalStore(
    services.fs.subscribe.bind(services.fs),
    () => services.fs.hasAccess,
    () => false,
  )

  const handleClick = () => {
    deactivateInspector()

    if (services.fs.hasAccess) {
      services.fs.requestAccess().catch(() => {})
      return
    }

    setIsPromptOpen(true)
  }

  const handleGrant = async () => {
    const granted = await handleGrantAccess(projectRoot, () =>
      services.fs.requestAccess(),
    )
    if (granted) setIsPromptOpen(false)
  }

  return (
    <>
      <Tooltip
        label={hasAccess ? 'Project folder connected' : 'Select project folder'}
        container={portalContainer}
        render={<ToolbarButton ref={buttonRef} />}
        aria-label="Project folder"
        style={{
          color: hasAccess ? '#22c55e' : '#52525b',
        }}
        onClick={handleClick}
      >
        <FolderToolbarIcon hasAccess={hasAccess} />
      </Tooltip>

      <Popover.Root
        open={isPromptOpen}
        onOpenChange={(open: boolean) => {
          if (!open) setIsPromptOpen(false)
        }}
      >
        <Popover.Portal container={portalContainer}>
          <Popover.Positioner
            anchor={buttonRef.current}
            side="top"
            align="end"
            sideOffset={8}
            collisionPadding={8}
            positionMethod="fixed"
            style={{ zIndex: 9999999, pointerEvents: 'auto' }}
          >
            <Popover.Popup
              style={{ width: 280, overflow: 'hidden' }}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <FolderAccessPrompt
                root={projectRoot}
                onGrant={handleGrant}
                onCancel={() => setIsPromptOpen(false)}
              />
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </>
  )
}

export function PreviewPlugin(options: PreviewPluginOptions = {}): XRayPlugin {
  function PreviewActionPanel() {
    return <SourcePreview options={options} />
  }

  return {
    name: 'preview',
    toolbar: PreviewToolbar,
    actionPanel: PreviewActionPanel,
    settings: PreviewSettings,
  }
}
