import { ToolbarButton, Tooltip } from '@react-trace/ui-components'
import { Logo } from '@react-trace/ui-components'
import { useAtom, useAtomValue } from 'jotai'

import {
  coreSettingsAtom,
  inspectorActiveAtom,
  portalContainerAtom,
} from '../store'
import type { TracePlugin, TraceProps } from '../types'
import { IS_MAC } from '../utils/platform'
import { ErrorBoundary } from './ErrorBoundary'
import { SettingsMenu } from './SettingsMenu'

interface ToolbarProps {
  plugins: TracePlugin[]
}

const DEFAULT_SPACING = 32

const POSITION_STYLES: Record<
  NonNullable<TraceProps['position']>,
  React.CSSProperties
> = {
  'bottom-right': { bottom: DEFAULT_SPACING, right: DEFAULT_SPACING },
  'bottom-left': { bottom: DEFAULT_SPACING, left: DEFAULT_SPACING },
  'top-right': { top: DEFAULT_SPACING, right: DEFAULT_SPACING },
  'top-left': { top: DEFAULT_SPACING, left: DEFAULT_SPACING },
}

const TOGGLE_SHORTCUT = IS_MAC ? 'Long-press ⌘X' : 'Long-press Ctrl+X'

export function Toolbar({ plugins }: ToolbarProps) {
  const [isInspectorActive, setInspectorActive] = useAtom(inspectorActiveAtom)
  const portalContainer = useAtomValue(portalContainerAtom)
  const coreSettings = useAtomValue(coreSettingsAtom)

  return (
    <Tooltip.Provider delay={300}>
      <div
        style={{
          position: 'fixed',
          ...POSITION_STYLES[coreSettings.position],
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
          render={<ToolbarButton />}
          aria-label="Inspector"
          onClick={() => setInspectorActive((prev) => !prev)}
        >
          <Logo />
        </Tooltip>
        {/* Plugin toolbar content */}
        {plugins
          .filter((plugin) => plugin.toolbar)
          .map((plugin) => {
            const ToolbarContent = plugin.toolbar!
            return (
              <ErrorBoundary key={plugin.name}>
                <ToolbarContent />
              </ErrorBoundary>
            )
          })}
        <SettingsMenu plugins={plugins} />
      </div>
    </Tooltip.Provider>
  )
}
