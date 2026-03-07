import {
  Button,
  IconButton,
  PanelHeader,
  Popover,
  Select,
  Separator,
  SettingsIcon,
  ToolbarButton,
  Tooltip,
  XIcon,
} from '@react-trace/ui-components'
import { useAtom } from 'jotai'
import type { CSSProperties } from 'react'
import { Fragment, useRef, useState } from 'react'

import { useDeactivateInspector, useWidgetPortalContainer } from '../hooks'
import { coreSettingsAtom, projectRootAtom } from '../store'
import type { TracePlugin, TraceSettings } from '../types'

const SECTION_TITLE_STYLE: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: '#71717a',
  fontFamily: 'system-ui, sans-serif',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
}

const LABEL_STYLE: CSSProperties = {
  fontSize: 12,
  color: '#d4d4d8',
  fontFamily: 'system-ui, sans-serif',
}

const INPUT_STYLE: CSSProperties = {
  width: '100%',
  minWidth: 0,
  background: '#0f0f11',
  border: '1px solid #3f3f46',
  borderRadius: 5,
  color: '#fafafa',
  fontSize: 12,
  fontFamily: 'system-ui, sans-serif',
  padding: '6px 8px',
  boxSizing: 'border-box',
}

const POSITION_OPTIONS: Array<{
  value: TraceSettings['core']['position']
  label: string
}> = [
  { value: 'bottom-right', label: 'Bottom right' },
  { value: 'bottom-left', label: 'Bottom left' },
  { value: 'top-right', label: 'Top right' },
  { value: 'top-left', label: 'Top left' },
]

function CoreSettingsSection() {
  const portalContainer = useWidgetPortalContainer()
  const [root, setRoot] = useAtom(projectRootAtom)
  const [coreSettings, setCoreSettings] = useAtom(coreSettingsAtom)

  const [draftRoot, setDraftRoot] = useState(root)

  const trimmedRoot = draftRoot.trim()
  const canApplyRoot = trimmedRoot.length > 0 && trimmedRoot !== root

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={LABEL_STYLE}>Project root</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={draftRoot}
            onChange={(e) => setDraftRoot(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation()

              if (e.key === 'Enter' && canApplyRoot) {
                e.preventDefault()
                setRoot(trimmedRoot)
              }
            }}
            style={INPUT_STYLE}
          />
          <Button
            variant="secondary"
            disabled={!canApplyRoot}
            onClick={() => setRoot(trimmedRoot)}
          >
            Apply
          </Button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={LABEL_STYLE}>Toolbar position</label>
        <Select.Root
          value={coreSettings.position}
          items={POSITION_OPTIONS}
          onValueChange={(value) => {
            if (value) {
              setCoreSettings({ ...coreSettings, position: value })
            }
          }}
        >
          <Select.Trigger onClick={(e) => e.stopPropagation()}>
            <Select.Value />
          </Select.Trigger>

          <Select.Portal container={portalContainer}>
            <Select.Positioner
              style={{ zIndex: 100000000, pointerEvents: 'auto' }}
            >
              <Select.Popup>
                <Select.List>
                  {POSITION_OPTIONS.map((option) => (
                    <Select.Item
                      key={option.value}
                      value={option.value}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Select.ItemText>{option.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </div>
    </div>
  )
}

export function SettingsMenu({ plugins }: { plugins: TracePlugin[] }) {
  const portalContainer = useWidgetPortalContainer()
  const deactivateInspector = useDeactivateInspector()

  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const settingsPlugins = plugins.filter(
    (
      plugin,
    ): plugin is TracePlugin & {
      settings: NonNullable<TracePlugin['settings']>
    } => Boolean(plugin.settings),
  )

  return (
    <>
      <Tooltip
        label="Settings"
        container={portalContainer}
        render={<ToolbarButton ref={buttonRef} />}
        aria-label="Settings"
        onClick={() => {
          deactivateInspector()
          setIsOpen((open) => !open)
        }}
      >
        <SettingsIcon />
      </Tooltip>

      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Portal container={portalContainer}>
          <Popover.Positioner
            anchor={buttonRef.current}
            side="top"
            align="end"
            sideOffset={8}
            collisionPadding={8}
            positionMethod="fixed"
            style={{ zIndex: 99999999, pointerEvents: 'auto' }}
          >
            <Popover.Popup style={{ width: 320 }}>
              <PanelHeader
                title="Settings"
                actionsRender={
                  <IconButton onClick={() => setIsOpen(false)} title="Close">
                    <XIcon />
                  </IconButton>
                }
              />
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  padding: 12,
                }}
              >
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                >
                  <div style={SECTION_TITLE_STYLE}>Core</div>
                  <CoreSettingsSection />
                </div>
                {settingsPlugins.map((plugin) => {
                  const SettingsContent = plugin.settings
                  return (
                    <Fragment key={`settings:${plugin.name}`}>
                      <Separator />
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10,
                        }}
                      >
                        <div style={SECTION_TITLE_STYLE}>{plugin.name}</div>
                        <SettingsContent />
                      </div>
                    </Fragment>
                  )
                })}
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </>
  )
}
