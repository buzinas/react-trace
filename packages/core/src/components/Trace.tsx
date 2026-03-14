import { Provider, useAtomValue } from 'jotai'
import { useState } from 'react'
import { createPortal } from 'react-dom'

import { useInspectorBehavior } from '../hooks/useInspectorBehavior'
import { useLongPressHotkey } from '../hooks/useLongPressHotkey'
import {
  coreSettingsAtom,
  createWidgetStore,
  inspectorActiveAtom,
  portalContainerAtom,
  projectRootAtom,
  selectedContextAtom,
} from '../store'
import type { TraceProps } from '../types'
import { ActionPanel } from './ActionPanel'
import { Overlay } from './Overlay'
import { Toolbar } from './Toolbar'

export function Trace({
  root,
  plugins = [],
  position = 'bottom-right',
  minimized = false,
}: TraceProps) {
  const [jotaiStore] = useState(() => {
    const store = createWidgetStore()
    store.set(projectRootAtom, root)
    if (!store.get(coreSettingsAtom)) {
      store.set(coreSettingsAtom, { position, minimized })
    }
    return store
  })

  return (
    <Provider store={jotaiStore}>
      <TraceRoot plugins={plugins} />
    </Provider>
  )
}

type TraceRootProps = {
  plugins: NonNullable<TraceProps['plugins']>
}
function TraceRoot({ plugins }: TraceRootProps) {
  const portalContainer = useAtomValue(portalContainerAtom)
  const inspectorActive = useAtomValue(inspectorActiveAtom)
  const selectedContext = useAtomValue(selectedContextAtom)

  const { hoveredContext } = useInspectorBehavior()

  useLongPressHotkey()

  return createPortal(
    <>
      <div style={{ pointerEvents: 'auto' }}>
        <Toolbar plugins={plugins} />
      </div>

      {inspectorActive && (
        <Overlay
          hoveredContext={hoveredContext}
          selectedContext={selectedContext}
        />
      )}

      {inspectorActive && <ActionPanel plugins={plugins} />}
    </>,
    portalContainer,
  )
}
