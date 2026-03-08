import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import {
  inspectorActiveAtom,
  portalContainerAtom,
  projectRootAtom,
  selectedContextAtom,
  selectedSourceAtom,
} from './store'

export function useProjectRoot() {
  return useAtomValue(projectRootAtom)
}

export function useInspectorActive() {
  return useAtomValue(inspectorActiveAtom)
}

export function useDeactivateInspector() {
  const setInspectorActive = useSetAtom(inspectorActiveAtom)
  return useCallback(() => setInspectorActive(false), [setInspectorActive])
}

export function useSelectedContext() {
  return useAtomValue(selectedContextAtom)
}

export function useClearSelectedContext() {
  const setSelectedContext = useSetAtom(selectedContextAtom)
  return useCallback(() => setSelectedContext(null), [setSelectedContext])
}

export function useSelectedSource() {
  return useAtomValue(selectedSourceAtom)
}

export function useWidgetPortalContainer() {
  return useAtomValue(portalContainerAtom)
}
