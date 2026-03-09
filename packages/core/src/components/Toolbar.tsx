import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ToolbarButton,
  Tooltip,
} from '@react-trace/ui-components'
import { Logo } from '@react-trace/ui-components'
import { useAtom, useAtomValue } from 'jotai'
import type { CSSProperties } from 'react'

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
  CSSProperties
> = {
  'bottom-right': { bottom: DEFAULT_SPACING, right: DEFAULT_SPACING },
  'bottom-left': { bottom: DEFAULT_SPACING, left: DEFAULT_SPACING },
  'top-right': { top: DEFAULT_SPACING, right: DEFAULT_SPACING },
  'top-left': { top: DEFAULT_SPACING, left: DEFAULT_SPACING },
}

const MINIMIZED_POSITION_STYLES: Record<
  NonNullable<TraceProps['position']>,
  CSSProperties
> = {
  'bottom-right': { bottom: DEFAULT_SPACING, right: 0 },
  'bottom-left': { bottom: DEFAULT_SPACING, left: 0 },
  'top-right': { top: DEFAULT_SPACING, right: 0 },
  'top-left': { top: DEFAULT_SPACING, left: 0 },
}

const TOGGLE_SHORTCUT = IS_MAC ? 'Long-press ⌘X' : 'Long-press Ctrl+X'

const contentGridStyle: CSSProperties = {
  display: 'grid',
  transition: 'grid-template-columns 0.3s ease',
}

const contentInnerStyle: CSSProperties = {
  overflow: 'hidden',
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
}

export function Toolbar({ plugins }: ToolbarProps) {
  const [isInspectorActive, setInspectorActive] = useAtom(inspectorActiveAtom)
  const portalContainer = useAtomValue(portalContainerAtom)
  const [coreSettings, setCoreSettings] = useAtom(coreSettingsAtom)

  const minimized = coreSettings.minimized ?? false
  const isRightAligned = coreSettings.position.includes('right')

  const toggleMinimized = () => {
    setCoreSettings({ ...coreSettings, minimized: !minimized })
  }

  const CollapseArrow = isRightAligned ? ChevronRightIcon : ChevronLeftIcon
  const ExpandArrow = isRightAligned ? ChevronLeftIcon : ChevronRightIcon

  const toggleButton = (
    <Tooltip
      label={minimized ? 'Expand toolbar' : 'Collapse toolbar'}
      container={portalContainer}
      render={<ToolbarButton style={{ width: 16, color: '#71717a' }} />}
      aria-label={minimized ? 'Expand toolbar' : 'Collapse toolbar'}
      onClick={toggleMinimized}
    >
      {minimized ? <ExpandArrow /> : <CollapseArrow />}
    </Tooltip>
  )

  const toolbarContent = (
    <div
      style={{
        ...contentGridStyle,
        gridTemplateColumns: minimized ? '0fr' : '1fr',
      }}
    >
      <div style={contentInnerStyle}>
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
    </div>
  )

  return (
    <Tooltip.Provider delay={300}>
      <div
        style={{
          position: 'fixed',
          ...(minimized
            ? MINIMIZED_POSITION_STYLES[coreSettings.position]
            : POSITION_STYLES[coreSettings.position]),
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          background: '#18181b',
          borderRadius: minimized
            ? isRightAligned
              ? '10px 0 0 10px'
              : '0 10px 10px 0'
            : 10,
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          outline: isInspectorActive
            ? '2px solid #3b82f6'
            : '2px solid transparent',
          transition:
            'right 0.3s ease, left 0.3s ease, border-radius 0.3s ease',
          userSelect: 'none',
          height: 32,
          boxSizing: 'border-box',
          zIndex: 999999,
        }}
      >
        {!isRightAligned && toggleButton}
        {toolbarContent}
        {isRightAligned && toggleButton}
      </div>
    </Tooltip.Provider>
  )
}
