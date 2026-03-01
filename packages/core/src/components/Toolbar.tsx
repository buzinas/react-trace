import { Toolbar as ToolbarPrimitive } from '@base-ui/react/toolbar'
import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip'
import { ToolbarButton, Tooltip } from '@react-xray/ui-components'
import { useAtom, useAtomValue } from 'jotai'
import { Fragment } from 'react'

import logo from '../logo.png'
import { IS_MAC } from '../platform'
import { getToolbarPluginEntries } from '../pluginRendering'
import { inspectorActiveAtom, portalContainerAtom } from '../store'
import type {
  ComponentContext,
  RVEPlugin,
  RVEServices,
  XRayProps,
} from '../types'

interface ToolbarProps {
  selectedContext: ComponentContext | null
  plugins: RVEPlugin[]
  services: RVEServices
  position: NonNullable<XRayProps['position']>
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

export function Toolbar({
  selectedContext,
  plugins,
  services,
  position,
}: ToolbarProps) {
  const [isInspectorActive, setInspectorActive] = useAtom(inspectorActiveAtom)
  const portalContainer = useAtomValue(portalContainerAtom)
  const pluginEntries = getToolbarPluginEntries(plugins)

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
          outline: isInspectorActive
            ? '2px solid #3b82f6'
            : '2px solid transparent',
          userSelect: 'none',
          height: 32,
          boxSizing: 'border-box',
          zIndex: 999999,
        }}
      >
        {/* Toggle button */}
        <Tooltip
          label="Inspector"
          shortcut={isInspectorActive ? 'Esc to exit' : TOGGLE_SHORTCUT}
          container={portalContainer}
          render={<ToolbarButton render={<ToolbarPrimitive.Button />} />}
          aria-label="Inspector"
          onClick={() => setInspectorActive((prev) => !prev)}
        >
          <img
            src={logo}
            alt="Inspect"
            style={{ borderRadius: 8 }}
            width={24}
            height={24}
          />
        </Tooltip>
        {/* Plugin toolbar content */}
        {pluginEntries.map((entry) => {
          const ToolbarContent = entry.toolbar

          return (
            <Fragment key={entry.name}>
              {ToolbarContent && <ToolbarContent />}

              {entry.legacyToolbarItems.map((item) => {
                const active = item.isActive?.(selectedContext) ?? false
                const resolvedIcon =
                  typeof item.icon === 'function'
                    ? item.icon(services)
                    : item.icon
                const resolvedLabel =
                  typeof item.label === 'function'
                    ? item.label(services)
                    : item.label

                return (
                  <Tooltip
                    key={`${entry.name}:${item.id}`}
                    label={resolvedLabel}
                    container={portalContainer}
                    render={
                      <ToolbarButton render={<ToolbarPrimitive.Button />} />
                    }
                    aria-label={item.ariaLabel ?? item.id}
                    style={{
                      background: active
                        ? 'rgba(59,130,246,0.2)'
                        : 'transparent',
                      border: active
                        ? '1px solid rgba(59,130,246,0.5)'
                        : '1px solid transparent',
                      color: '#fafafa',
                    }}
                    onClick={() => {
                      setInspectorActive(false)
                      item.onClick(selectedContext, services)
                    }}
                  >
                    {resolvedIcon}
                  </Tooltip>
                )
              })}
            </Fragment>
          )
        })}
      </ToolbarPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
