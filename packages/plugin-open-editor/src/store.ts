import type { XRaySettings } from '@react-xray/core'
import { settingsPluginAtom } from '@react-xray/core'
import type { WritableAtom } from 'jotai'

import type { EditorPreset } from './types'

declare module '@react-xray/core' {
  interface XRaySettings {
    openEditor?: {
      editor: EditorPreset
    }
  }
}

export const openEditorSettingsAtom = settingsPluginAtom(
  'openEditor',
) as WritableAtom<
  XRaySettings['openEditor'],
  [XRaySettings['openEditor']],
  void
>
