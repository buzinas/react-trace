import { Toolbar as ToolbarPrimitive } from '@base-ui/react/toolbar'
import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip'
import { type RefObject, useSyncExternalStore } from 'react'

import logo from '../logo.png'
import { IS_MAC } from '../platform'
import type {
  ComponentContext,
  RVEPlugin,
  RVEServices,
  XRayProps,
} from '../types'
import { Tooltip } from './Tooltip'

function FolderIcon({ connected }: { connected: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1 3.5a1 1 0 0 1 1-1h3l1.5 1.5H12a1 1 0 0 1 1 1V10.5a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3.5z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {connected && (
        <circle
          cx="11"
          cy="3"
          r="2.5"
          fill="#22c55e"
          stroke="#18181b"
          strokeWidth="1"
        />
      )}
    </svg>
  )
}

interface ToolbarProps {
  isActive: boolean
  selectedContext: ComponentContext | null
  plugins: RVEPlugin[]
  services: RVEServices
  position: NonNullable<XRayProps['position']>
  portalRef: RefObject<HTMLDivElement | null>
  onToggle(value?: boolean): void
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
  const hasAccess = useSyncExternalStore(
    services.fs.subscribe.bind(services.fs),
    () => services.fs.hasAccess,
    () => false,
  )

  return (
    <TooltipPrimitive.Provider delay={300}>
      <ToolbarPrimitive.Root
        style={{
          position: 'fixed',
          ...POSITION_STYLES[position],
          display: 'flex',
          alignItems: 'center',
          background: '#18181b',
          borderRadius: 10,
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          outline: isActive ? '2px solid #3b82f6' : '2px solid transparent',
          userSelect: 'none',
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
          render={<ToolbarPrimitive.Button onClick={() => onToggle()} />}
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

        {/* Folder access button — always visible */}
        <Tooltip
          label={
            hasAccess ? 'Project folder connected' : 'Select project folder'
          }
          container={portalRef}
          render={
            <ToolbarPrimitive.Button
              onClick={() => services.fs.requestAccess()}
            />
          }
          aria-label="Select project folder"
          style={{
            ...toolbarButtonBase,
            background: 'transparent',
            border: 0,
            outline: 'none',
            color: hasAccess ? '#22c55e' : '#52525b',
          }}
        >
          <FolderIcon connected={hasAccess} />
        </Tooltip>

        {/* Plugin toolbar items — only when inspector is active */}
        {toolbarItems.map((item) => {
          const active = item.isActive?.(selectedContext) ?? false
          return (
            <Tooltip
              key={item.id}
              label={item.label}
              container={portalRef}
              render={
                <ToolbarPrimitive.Button
                  onClick={() => {
                    onToggle(false)
                    item.onClick(selectedContext, services)
                  }}
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
