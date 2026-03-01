import {
  ChevronRightIcon,
  DropdownMenu,
  Popover,
  XIcon,
} from '@react-xray/ui-components'
import type { RefObject } from 'react'

import { toRelativePath } from '../path'
import type {
  Action,
  ComponentContext,
  ComponentSource,
  RVEPlugin,
  RVEServices,
} from '../types'

interface ActionPanelProps {
  context: ComponentContext | null
  plugins: RVEPlugin[]
  services: RVEServices
  portalRef: RefObject<HTMLDivElement | null>
  onClose(): void
  onToggle(value?: boolean): void
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

export function ActionPanel({
  context,
  plugins,
  services,
  portalRef,
  onClose,
  onToggle,
}: ActionPanelProps) {
  const groups = context ? groupChain(context.all) : []

  return (
    <Popover.Root
      open={context !== null}
      onOpenChange={(open: boolean) => {
        if (!open) onClose()
      }}
    >
      <Popover.Portal container={portalRef}>
        <Popover.Positioner
          anchor={context?.element}
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
            {context && (
              <>
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px 8px',
                    borderBottom: '1px solid #27272a',
                    position: 'sticky',
                    top: 0,
                    background: '#18181b',
                    zIndex: 1,
                  }}
                >
                  <span
                    style={{
                      color: '#fafafa',
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: 'ui-monospace, monospace',
                    }}
                  >
                    {context.displayName}
                  </span>
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
                </div>

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

                    const entryCtx = { ...context, source: group.source }
                    const actions = plugins.flatMap(
                      (p) => p.actions?.(entryCtx, services) ?? [],
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
                    if (!actions.length) {
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
                        portalRef={portalRef}
                        actions={actions}
                        plugins={plugins}
                        entryCtx={entryCtx}
                        services={services}
                        onClose={onClose}
                        onToggle={onToggle}
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
  portalRef,
  actions,
  plugins,
  entryCtx,
  services,
  onClose,
  onToggle,
}: {
  entryContent: React.ReactNode
  portalRef: RefObject<HTMLDivElement | null>
  actions: Action[]
  plugins: RVEPlugin[]
  entryCtx: ComponentContext
  services: RVEServices
  onClose(): void
  onToggle(value?: boolean): void
}) {
  return (
    <DropdownMenu.Root>
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

      <DropdownMenu.Portal container={portalRef}>
        <DropdownMenu.Positioner
          side="right"
          sideOffset={4}
          collisionPadding={8}
          style={{ zIndex: 999999, pointerEvents: 'auto' }}
        >
          <DropdownMenu.Popup
            style={{
              minWidth: 200,
              paddingBlock: actions.length > 0 ? 4 : 0,
            }}
          >
            {/* Plugin subpanels (e.g. source preview) */}
            {plugins.map((p, pi) => {
              if (!p.subpanel) return null
              const Subpanel = p.subpanel
              return <Subpanel key={pi} ctx={entryCtx} services={services} />
            })}

            {/* Divider between subpanels and actions */}
            {plugins.some((p) => p.subpanel) && actions.length > 0 && (
              <DropdownMenu.Separator />
            )}

            {/* Action buttons */}
            {actions.map((action) => (
              <DropdownMenu.Item
                key={action.id}
                closeOnClick
                onClick={async () => {
                  const result = await action.onClick(entryCtx, services)

                  onClose()
                  if (result) {
                    onToggle(false)
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
            ))}
          </DropdownMenu.Popup>
        </DropdownMenu.Positioner>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
