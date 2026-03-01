import type { ComponentContext, RVEPlugin, RVEServices } from '@react-xray/core'
import { FolderIcon } from '@react-xray/ui-components'
import { useEffect, useRef, useSyncExternalStore } from 'react'
import type { BundledTheme } from 'shiki'

import {
  setFolderButtonEl,
  setFolderPromptOpen,
  setPluginServices,
} from './folderPrompt'
import { ensurePreviewOverlayMounted } from './PreviewRoot'
import { SourcePreview } from './SourcePreview'

export interface PreviewPluginOptions {
  /** Allow editing. Shows Save (⌘S) + Expand buttons. Saves via FileSystemService. @default false */
  editable?: boolean
  /** Shiki theme ID. @default 'one-dark-pro' — any https://shiki.style/themes value works. */
  theme?: BundledTheme
}

// ---------------------------------------------------------------------------
// FolderToolbarIcon — folder icon with green dot badge when connected
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// FolderToolbarButton — subscribes to services.fs, captures button ref
// ---------------------------------------------------------------------------

function FolderToolbarButton({ services }: { services: RVEServices }) {
  const wrapperRef = useRef<HTMLSpanElement>(null)
  const hasAccess = useSyncExternalStore(
    services.fs.subscribe.bind(services.fs),
    () => services.fs.hasAccess,
    () => false,
  )

  useEffect(() => {
    if (!wrapperRef.current) return
    let el: HTMLElement | null = wrapperRef.current
    while (el && el.tagName !== 'BUTTON') el = el.parentElement
    if (el instanceof HTMLButtonElement) setFolderButtonEl(el)
    return () => setFolderButtonEl(null)
  })

  return (
    <span
      ref={wrapperRef}
      style={{
        display: 'flex',
        color: hasAccess ? '#22c55e' : '#52525b',
      }}
    >
      <FolderToolbarIcon hasAccess={hasAccess} />
    </span>
  )
}

// ---------------------------------------------------------------------------
// FolderLabel — reactive tooltip label
// ---------------------------------------------------------------------------

function FolderLabel({ services }: { services: RVEServices }) {
  const hasAccess = useSyncExternalStore(
    services.fs.subscribe.bind(services.fs),
    () => services.fs.hasAccess,
    () => false,
  )
  return <>{hasAccess ? 'Project folder connected' : 'Select project folder'}</>
}

// ---------------------------------------------------------------------------
// PreviewPlugin
// ---------------------------------------------------------------------------

export function PreviewPlugin(options: PreviewPluginOptions = {}): RVEPlugin {
  const { editable = false, theme = 'one-dark-pro' } = options
  ensurePreviewOverlayMounted()

  function BoundSourcePreview({
    ctx,
    services,
  }: {
    ctx: ComponentContext
    services: RVEServices
  }) {
    setPluginServices(services)
    return (
      <SourcePreview
        ctx={ctx}
        services={services}
        editable={editable}
        theme={theme}
        root={services.root}
      />
    )
  }

  return {
    name: 'preview',
    subpanel: BoundSourcePreview,
    toolbarItems: [
      {
        id: 'preview-folder',
        ariaLabel: 'Project folder',
        icon: (services) => <FolderToolbarButton services={services} />,
        label: (services) => <FolderLabel services={services} />,
        onClick(_ctx, services) {
          setPluginServices(services)
          if (services.fs.hasAccess) {
            services.fs.requestAccess()
          } else {
            setFolderPromptOpen(true)
          }
        },
      },
    ],
  }
}
