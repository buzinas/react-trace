import {
  ChevronRightIcon,
  DropdownMenu,
  PanelHeader,
  Popover,
  XIcon,
} from '@react-xray/ui-components'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { toRelativePath } from '../path'
import {
  getActionPanelPluginEntries,
  hasActionPanelContent,
} from '../pluginRendering'
import {
  inspectorActiveAtom,
  portalContainerAtom,
  selectedContextAtom,
  selectedSourceAtom,
  servicesAtom,
} from '../store'
import type {
  ComponentContext,
  ComponentSource,
  RVEPlugin,
  RVEServices,
} from '../types'

interface ActionPanelProps {
  plugins: RVEPlugin[]
}

// ---------------------------------------------------------------------------
// Third-party grouping
// ---------------------------------------------------------------------------

type ChainGroup =
  | { kind: 'entry'; names: string[]; source: ComponentSource; index: number }
  | { kind: 'third-party'; names: string[][]; count: number }

function groupChain(all: ComponentContext['all']): ChainGroup[] {
  const result: ChainGroup[] = []
  let tpCount = 0
  let names: string[][] = []

  for (let i = 0; i < all.length; i++) {
    const entry = all[i]!
    if (!entry.source) {
      tpCount++
      names.push(entry.names)
    } else {
      if (tpCount > 0) {
        result.push({ kind: 'third-party', names, count: tpCount })
        tpCount = 0
        names = []
      }
      result.push({
        kind: 'entry',
        names: entry.names,
        source: entry.source,
        index: i,
      })
    }
  }
  if (tpCount > 0) result.push({ kind: 'third-party', names, count: tpCount })

  return result
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SourceLabel({ source }: { source: ComponentSource }) {
  const rel = toRelativePath(source.fileName)
  const short = rel.split('/').slice(-2).join('/')

  return (
    <span
      style={{
        fontSize: 11,
        fontFamily: 'ui-monospace, monospace',
        color: '#97979b',
      }}
      title={`${rel}:${source.lineNumber}`}
    >
      {short}:{source.lineNumber}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

function entryStyle(active: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '7px 12px',
    cursor: 'pointer',
    userSelect: 'none',
    outline: 'none',
    background: active ? 'rgba(59,130,246,0.2)' : 'transparent',
    width: '100%',
    boxSizing: 'border-box',
    border: 'none',
    textAlign: 'left',
    transition: 'background 0.1s',
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ActionPanel({ plugins }: ActionPanelProps) {
  const services = useAtomValue(servicesAtom)
  const [selectedContext, setSelectedContext] = useAtom(selectedContextAtom)
  const portalContainer = useAtomValue(portalContainerAtom)
  const groups = selectedContext ? groupChain(selectedContext.all) : []

  const onClose = useCallback(
    () => setSelectedContext(null),
    [setSelectedContext],
  )

  return (
    <Popover.Root
      open={selectedContext !== null}
      onOpenChange={(open: boolean) => {
        if (!open) onClose()
      }}
    >
      <Popover.Portal container={portalContainer}>
        <Popover.Positioner
          anchor={selectedContext?.element}
          side="bottom"
          align="start"
          sideOffset={8}
          collisionPadding={8}
          positionMethod="fixed"
          style={{ pointerEvents: 'auto', zIndex: 999999 }}
        >
          <Popover.Popup
            initialFocus={false}
            style={{
              minWidth: 280,
              overflow: 'hidden',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            {selectedContext && (
              <>
                {/* Header */}
                <PanelHeader
                  title={selectedContext.displayName}
                  titleStyle={{ fontFamily: 'ui-monospace, monospace' }}
                  style={{
                    position: 'sticky',
                    top: 0,
                    background: '#18181b',
                    zIndex: 1,
                  }}
                  actionsRender={
                    <Popover.Close
                      title="Close (Esc)"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#52525b',
                        cursor: 'pointer',
                        padding: '0 2px',
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      <XIcon />
                    </Popover.Close>
                  }
                />

                {/* Owner chain */}
                <div
                  style={{ maxHeight: 300, overflowY: 'auto', paddingBlock: 4 }}
                >
                  {groups.map((group, gi) => {
                    // Third-party group — greyed out, no actions
                    if (group.kind === 'third-party') {
                      return (
                        <div
                          key={`tp-${gi}`}
                          style={{
                            padding: '6px 12px',
                            fontSize: 11,
                            color: '#7f7f7a',
                            fontStyle: 'italic',
                          }}
                        >
                          {group.count === 1
                            ? (group.names[0]?.join(' › ') ?? '') +
                              '(Third-party component)'
                            : `${group.count} third-party components…`}
                        </div>
                      )
                    }

                    const entryCtx = {
                      ...selectedContext,
                      source: group.source,
                    }
                    const pluginEntries = getActionPanelPluginEntries(
                      plugins,
                      entryCtx,
                      services,
                    )

                    const entryContent = (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            color: '#d4d4d8',
                            fontFamily: 'ui-monospace, monospace',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {group.names.join(' › ')}
                        </span>
                        <SourceLabel source={group.source} />
                      </div>
                    )

                    // No plugin actions — plain row
                    if (!hasActionPanelContent(pluginEntries)) {
                      return (
                        <div key={`entry-${gi}`} style={entryStyle(false)}>
                          {entryContent}
                        </div>
                      )
                    }

                    return (
                      <Submenu
                        key={`entry-${gi}`}
                        entryContent={entryContent}
                        pluginEntries={pluginEntries}
                        entryCtx={entryCtx}
                        services={services}
                        onClose={onClose}
                      />
                    )
                  })}
                </div>
              </>
            )}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

function Submenu({
  entryContent,
  pluginEntries,
  entryCtx,
  services,
  onClose,
}: {
  entryContent: React.ReactNode
  pluginEntries: ReturnType<typeof getActionPanelPluginEntries>
  entryCtx: ComponentContext
  services: RVEServices
  onClose(): void
}) {
  const portalContainer = useAtomValue(portalContainerAtom)
  const setSelectedSource = useSetAtom(selectedSourceAtom)
  const setInspectorActive = useSetAtom(inspectorActiveAtom)
  const hasPluginActionPanels = pluginEntries.some((entry) => entry.actionPanel)
  const hasLegacySubpanels = pluginEntries.some((entry) => entry.legacySubpanel)
  const hasLegacyActions = pluginEntries.some(
    (entry) => entry.legacyActions.length > 0,
  )

  return (
    <DropdownMenu.Root
      onOpenChange={(open) => open && setSelectedSource(entryCtx.source)}
    >
      <DropdownMenu.Trigger
        openOnHover
        delay={0}
        closeDelay={0}
        style={(state) => entryStyle(state.open)}
      >
        {entryContent}
        <span
          style={{
            flexShrink: 0,
            marginLeft: 'auto',
            color: '#52525b',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          <ChevronRightIcon />
        </span>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal container={portalContainer}>
        <DropdownMenu.Positioner
          side="right"
          sideOffset={4}
          collisionPadding={8}
          style={{ zIndex: 999999, pointerEvents: 'auto' }}
        >
          <DropdownMenu.Popup
            style={{
              minWidth: 200,
              paddingBlock: hasActionPanelContent(pluginEntries) ? 4 : 0,
            }}
          >
            {/* Wave 2 plugin-owned action-panel content */}
            {pluginEntries.map((entry) => {
              if (!entry.actionPanel) return null
              const ActionPanelContent = entry.actionPanel
              return <ActionPanelContent key={`action-panel:${entry.name}`} />
            })}

            {/* Divider between direct renderers and legacy compatibility content */}
            {hasPluginActionPanels &&
              (hasLegacySubpanels || hasLegacyActions) && (
                <DropdownMenu.Separator />
              )}

            {/* Legacy plugin subpanels (compatibility bridge) */}
            {pluginEntries.map((entry) => {
              if (!entry.legacySubpanel) return null
              const Subpanel = entry.legacySubpanel
              return (
                <Subpanel
                  key={`legacy-subpanel:${entry.name}`}
                  ctx={entryCtx}
                  services={services}
                />
              )
            })}

            {/* Divider between legacy subpanels and legacy actions */}
            {hasLegacySubpanels && hasLegacyActions && (
              <DropdownMenu.Separator />
            )}

            {/* Legacy action rows (compatibility bridge) */}
            {pluginEntries.map((entry) =>
              entry.legacyActions.map((action) => (
                <DropdownMenu.Item
                  key={`${entry.name}:${action.id}`}
                  closeOnClick
                  onClick={async () => {
                    const result = await action.onClick(entryCtx, services)

                    onClose()
                    if (result) {
                      setInspectorActive(false)
                    }
                  }}
                >
                  {action.icon && (
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      {action.icon}
                    </span>
                  )}
                  {action.label}
                </DropdownMenu.Item>
              )),
            )}
          </DropdownMenu.Popup>
        </DropdownMenu.Positioner>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
