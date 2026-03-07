import { Toolbar as ToolbarPrimitive } from '@base-ui/react/toolbar'
import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip'
import { ToolbarButton, Tooltip } from '@react-xray/ui-components'
import { useAtom, useAtomValue } from 'jotai'

import logo from '../logo.png'
import { IS_MAC } from '../platform'
import { inspectorActiveAtom, portalContainerAtom } from '../store'
import type { XRayPlugin, XRayProps } from '../types'

interface ToolbarProps {
  plugins: XRayPlugin[]
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

export function Toolbar({ plugins, position }: ToolbarProps) {
  const [isInspectorActive, setInspectorActive] = useAtom(inspectorActiveAtom)
  const portalContainer = useAtomValue(portalContainerAtom)

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
        {plugins
          .filter((plugin) => plugin.toolbar)
          .map((plugin) => {
            const ToolbarContent = plugin.toolbar!
            return <ToolbarContent key={plugin.name} />
          })}
      </ToolbarPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
