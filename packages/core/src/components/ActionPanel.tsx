import { Menu as MenuPrimitive } from '@base-ui/react/menu'
import { Popover as PopoverPrimitive } from '@base-ui/react/popover'
import { type RefObject } from 'react'

import type {
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
  let file = source.fileName
  try {
    file = new URL(file).pathname
  } catch {
    // already a path
  }
  file = file.split('?')[0] ?? file
  const short = file.split('/').slice(-2).join('/')

  return (
    <span
      style={{
        fontSize: 11,
        fontFamily: 'ui-monospace, monospace',
        color: '#97979b',
      }}
      title={`${file}:${source.lineNumber}`}
    >
      {short}:{source.lineNumber}
    </span>
  )
}

function ChevronRight() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      style={{ flexShrink: 0, marginLeft: 'auto', color: '#52525b' }}
    >
      <path
        d="M3.5 1.5L7 5L3.5 8.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const popupStyle: React.CSSProperties = {
  minWidth: 280,
  background: '#18181b',
  border: '1px solid #27272a',
  borderRadius: 8,
  boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
  fontFamily: 'system-ui, sans-serif',
  overflow: 'hidden',
}

function entryStyle(active: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '7px 12px',
    cursor: 'default',
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

function actionStyle(highlighted: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 12px',
    cursor: 'default',
    userSelect: 'none',
    outline: 'none',
    fontSize: 12,
    color: '#d4d4d8',
    background: highlighted ? 'rgba(59,130,246,0.08)' : 'transparent',
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
}: ActionPanelProps) {
  const groups = context ? groupChain(context.all) : []

  return (
    <PopoverPrimitive.Root
      open={context !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <PopoverPrimitive.Portal container={portalRef}>
        <PopoverPrimitive.Positioner
          anchor={context?.element}
          sideOffset={8}
          collisionPadding={8}
          positionMethod="fixed"
          style={{ pointerEvents: 'auto', zIndex: 999999 }}
        >
          <PopoverPrimitive.Popup initialFocus={false} style={popupStyle}>
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
                  <PopoverPrimitive.Close
                    title="Close (Esc)"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#52525b',
                      cursor: 'pointer',
                      padding: '0 2px',
                      fontSize: 18,
                      lineHeight: 1,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    ×
                  </PopoverPrimitive.Close>
                </div>

                {/* Owner chain */}
                <div
                  style={{ maxHeight: 300, overflowY: 'auto', paddingBlock: 4 }}
                >
                  {groups.map((group, gi) => {
                    // Third-party group — greyed out, no actions
                    if (group.kind === 'third-party') {
                      console.log(group.names.length)
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

                    // No plugin actions — plain highlighted row
                    if (!actions.length) {
                      return (
                        <div key={`entry-${gi}`} style={entryStyle(false)}>
                          {entryContent}
                        </div>
                      )
                    }

                    // Has plugin actions — Menu with hover submenu to the right
                    return (
                      <MenuPrimitive.Root key={`entry-${gi}`}>
                        <MenuPrimitive.Trigger
                          openOnHover
                          delay={0}
                          closeDelay={0}
                          style={(state) => entryStyle(state.open)}
                        >
                          {entryContent}
                          <ChevronRight />
                        </MenuPrimitive.Trigger>

                        <MenuPrimitive.Portal container={portalRef}>
                          <MenuPrimitive.Positioner
                            side="right"
                            sideOffset={4}
                            collisionPadding={8}
                          >
                            <MenuPrimitive.Popup
                              style={{
                                ...popupStyle,
                                minWidth: 160,
                                paddingBlock: 4,
                              }}
                            >
                              {actions.map((action) => (
                                <MenuPrimitive.Item
                                  key={action.id}
                                  closeOnClick
                                  onClick={() => {
                                    action.onClick(entryCtx, services)
                                    onClose()
                                  }}
                                  style={(state) =>
                                    actionStyle(state.highlighted)
                                  }
                                >
                                  {action.icon && (
                                    <span
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                      }}
                                    >
                                      {action.icon}
                                    </span>
                                  )}
                                  {action.label}
                                </MenuPrimitive.Item>
                              ))}
                            </MenuPrimitive.Popup>
                          </MenuPrimitive.Positioner>
                        </MenuPrimitive.Portal>
                      </MenuPrimitive.Root>
                    )
                  })}
                </div>
              </>
            )}
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
