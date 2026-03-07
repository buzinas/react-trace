import type { XRaySettings } from '@react-xray/core'
import { settingsPluginAtom } from '@react-xray/core'
import type { WritableAtom } from 'jotai'
import type { BundledTheme } from 'shiki'

declare module '@react-xray/core' {
  interface XRaySettings {
    preview?: {
      disabled: boolean
      theme: BundledTheme
    }
  }
}

export const previewSettingsAtom = settingsPluginAtom(
  'preview',
) as WritableAtom<XRaySettings['preview'], [XRaySettings['preview']], void>
