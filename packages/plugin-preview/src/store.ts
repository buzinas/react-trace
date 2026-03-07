import type { TraceSettings } from '@react-trace/core'
import { settingsPluginAtom } from '@react-trace/core'
import type { WritableAtom } from 'jotai'
import type { BundledTheme } from 'shiki'

declare module '@react-trace/core' {
  interface TraceSettings {
    preview?: {
      disabled: boolean
      theme: BundledTheme
    }
  }
}

export const previewSettingsAtom = settingsPluginAtom(
  'preview',
) as WritableAtom<TraceSettings['preview'], [TraceSettings['preview']], void>
