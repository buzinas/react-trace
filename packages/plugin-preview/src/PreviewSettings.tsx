import { useWidgetPortalContainer } from '@react-trace/core'
import { Combobox } from '@react-trace/ui-components'
import { useAtom } from 'jotai'
import type { CSSProperties } from 'react'
import { useRef, useState } from 'react'
import type { BundledTheme } from 'shiki'
import { bundledThemesInfo } from 'shiki'

import { previewSettingsAtom } from './store'

const themes = bundledThemesInfo.map((theme) => ({
  value: theme.id as BundledTheme,
  label: theme.displayName,
}))

const themesLookup = themes.reduce<
  Record<(typeof themes)[number]['value'], (typeof themes)[number]>
>(
  (acc, theme) => {
    acc[theme.value] = theme
    return acc
  },
  {} as Record<(typeof themes)[number]['value'], (typeof themes)[number]>,
)

const LABEL_STYLE: CSSProperties = {
  fontSize: 12,
  color: '#d4d4d8',
  fontFamily: 'system-ui, sans-serif',
}

export function PreviewSettings() {
  const portalContainer = useWidgetPortalContainer()
  const [themesOpen, setThemesOpen] = useState(false)

  const [
    previewSettings = { disabled: false, theme: 'one-dark-pro' },
    setPreviewSettings,
  ] = useAtom(previewSettingsAtom)

  const anchorRef = useRef<HTMLDivElement>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={LABEL_STYLE}>
          <input
            type="checkbox"
            checked={previewSettings.disabled ?? false}
            onChange={(e) =>
              setPreviewSettings({
                ...previewSettings,
                disabled: e.target.checked,
              })
            }
          />{' '}
          Code editing disabled
        </label>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={LABEL_STYLE}>Theme</label>
        <Combobox.Root
          value={themesLookup[previewSettings.theme]}
          onValueChange={(theme) => {
            if (theme) {
              setPreviewSettings({ ...previewSettings, theme: theme.value })
            }
          }}
          items={themes}
          open={themesOpen}
          onOpenChange={setThemesOpen}
        >
          <div ref={anchorRef}>
            <Combobox.Trigger
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <Combobox.Input />
            </Combobox.Trigger>
          </div>

          <Combobox.Portal container={portalContainer}>
            <Combobox.Positioner
              style={{ zIndex: 100000000, pointerEvents: 'auto' }}
              anchor={anchorRef}
            >
              <Combobox.Popup>
                <Combobox.Empty>No themes found</Combobox.Empty>
                <Combobox.List
                  style={{
                    overscrollBehavior: 'contain',
                    maxHeight: 500,
                    overflowY: 'auto',
                  }}
                >
                  {(option: (typeof themes)[number]) => (
                    <Combobox.Item
                      key={option.value}
                      value={option}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>{option.label}</span>
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>
      </div>
    </div>
  )
}
