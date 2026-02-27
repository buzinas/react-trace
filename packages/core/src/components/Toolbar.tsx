import { Toolbar as ToolbarPrimitive } from '@base-ui/react/toolbar'
import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip'
import type { RefObject } from 'react'
import { Tooltip } from './Tooltip'

import logo from '../logo.png'
import { IS_MAC } from '../platform'
import type {
  ComponentContext,
  RVEPlugin,
  RVEServices,
  XRayProps,
} from '../types'

interface ToolbarProps {
  isActive: boolean
  selectedContext: ComponentContext | null
  plugins: RVEPlugin[]
  services: RVEServices
  position: NonNullable<XRayProps['position']>
  portalRef: RefObject<HTMLDivElement | null>
  onToggle(): void
}

const DEFAULT_SPACING = 32

const POSITION_STYLES: Record<
  NonNullable<XRayProps['position']>,
  React.CSSProperties
> = {
  'bottom-right': { bottom: DEFAULT_SPACING, right: DEFAULT_SPACING },
  'bottom-left': { bottom: DEFAULT_SPACING, left: DEFAULT_SPACING },
  'top-right': { top: DEFAULT_SPACING, right: DEFAULT_SPACING },
  'top-left': { top: DEFAULT_SPACING, left: DEFAULT_SPACING },
}

const TOGGLE_SHORTCUT = IS_MAC ? 'Long-press ⌘X' : 'Long-press Ctrl+X'


const toolbarButtonBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  borderRadius: 7,
  cursor: 'pointer',
  padding: 0,
  transition: 'background 0.15s, border-color 0.15s',
}

export function Toolbar({
  isActive,
  selectedContext,
  plugins,
  services,
  position,
  portalRef,
  onToggle,
}: ToolbarProps) {
  const toolbarItems = plugins.flatMap((p) => p.toolbarItems ?? [])

  return (
    <TooltipPrimitive.Provider delay={300}>
      <ToolbarPrimitive.Root
        style={{
          position: 'fixed',
          ...POSITION_STYLES[position],
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: '#18181b',
          borderRadius: 10,
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          outline: isActive ? '2px solid #3b82f6' : '2px solid transparent',
          userSelect: 'none',
          width: 32,
          height: 32,
          boxSizing: 'border-box',
          zIndex: 999999,
        }}
      >
        {/* Toggle button */}
        <Tooltip
          label="Inspector"
          shortcut={isActive ? 'Esc to exit' : TOGGLE_SHORTCUT}
          container={portalRef}
          render={<ToolbarPrimitive.Button onClick={onToggle} />}
          aria-label="Inspector"
          style={{
            ...toolbarButtonBase,
            background: 'transparent',
            border: 0,
            outline: 'none',
          }}
        >
          <img
            src={logo}
            alt="Inspect"
            style={{ borderRadius: 8 }}
            width={24}
            height={24}
          />
        </Tooltip>

        {/* Plugin toolbar items — only when inspector is active */}
        {isActive &&
          toolbarItems.map((item) => {
            const active = item.isActive?.(selectedContext) ?? false
            return (
              <Tooltip
                key={item.id}
                label={item.label}
                container={portalRef}
                render={
                  <ToolbarPrimitive.Button
                    onClick={() => item.onClick(selectedContext, services)}
                  />
                }
                aria-label={item.label}
                style={{
                  ...toolbarButtonBase,
                  background: active ? 'rgba(59,130,246,0.2)' : 'transparent',
                  border: active
                    ? '1px solid rgba(59,130,246,0.5)'
                    : '1px solid transparent',
                  color: '#fafafa',
                  fontSize: 14,
                }}
              >
                {item.icon}
              </Tooltip>
            )
          })}
      </ToolbarPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
