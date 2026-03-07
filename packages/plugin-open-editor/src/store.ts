import type { TraceSettings } from '@react-trace/core'
import { settingsPluginAtom } from '@react-trace/core'
import type { WritableAtom } from 'jotai'

import type { EditorPreset } from './types'

declare module '@react-trace/core' {
  interface TraceSettings {
    openEditor?: {
      editor: EditorPreset
    }
  }
}

export const openEditorSettingsAtom = settingsPluginAtom(
  'openEditor',
) as WritableAtom<
  TraceSettings['openEditor'],
  [TraceSettings['openEditor']],
  void
>
