import { useAtomValue } from 'jotai'

import {
  portalContainerAtom,
  projectRootAtom,
  selectedContextAtom,
  servicesAtom,
} from './store'

export function useProjectRoot() {
  return useAtomValue(projectRootAtom)
}

export function useSelectedContext() {
  return useAtomValue(selectedContextAtom)
}

export function useWidgetServices() {
  return useAtomValue(servicesAtom)
}

export function useWidgetPortalContainer() {
  return useAtomValue(portalContainerAtom)
}
