import { Popover as PopoverPrimitive } from '@base-ui/react/popover'
import { type RefObject } from 'react'

import type { ComponentContext, RVEPlugin, RVEServices } from '../types'

interface ActionPanelProps {
  /** null = panel is closed */
  context: ComponentContext | null
  plugins: RVEPlugin[]
  services: RVEServices
  portalRef: RefObject<HTMLDivElement | null>
  onClose(): void
}

function SourceBadge({ source }: { source: ComponentContext['source'] }) {
  if (!source) return null

  let file = source.fileName
  try {
    file = new URL(file).pathname
  } catch {
    // not a URL, use as-is
  }
  file = file.split('?')[0] ?? file
  const short = file.split('/').slice(-2).join('/')

  return (
    <div
      style={{
        fontSize: 11,
        fontFamily: 'ui-monospace, monospace',
        color: '#71717a',
        marginTop: 2,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
      title={`${file}:${source.lineNumber}`}
    >
      {short}:{source.lineNumber}
    </div>
  )
}

export function ActionPanel({
  context,
  plugins,
  services,
  portalRef,
  onClose,
}: ActionPanelProps) {
  const actions = context
    ? plugins.flatMap((p) => p.actions?.(context, services) ?? [])
    : []

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
          <PopoverPrimitive.Popup
            initialFocus={false}
            style={{
              width: 260,
              background: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              fontFamily: 'system-ui, sans-serif',
              overflow: 'hidden',
            }}
          >
            {context && (
              <>
                {/* Header */}
                <div
                  style={{
                    padding: '10px 12px 8px',
                    borderBottom:
                      actions.length > 0 ? '1px solid #3f3f46' : 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
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
                        color: '#71717a',
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
                  <SourceBadge source={context.source} />
                </div>

                {/* Plugin actions */}
                {actions.length > 0 && (
                  <div
                    style={{
                      padding: 8,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 4,
                    }}
                  >
                    {actions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => action.onClick(context, services)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          background: '#27272a',
                          border: '1px solid #3f3f46',
                          borderRadius: 5,
                          color: '#d4d4d8',
                          cursor: 'pointer',
                          fontSize: 12,
                          padding: '4px 8px',
                        }}
                      >
                        {action.icon && (
                          <span style={{ fontSize: 13 }}>{action.icon}</span>
                        )}
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
