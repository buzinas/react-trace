/**
 * Production stub for @react-trace/core.
 * Trace renders null so the inspector has zero runtime cost in production.
 */

import type { WritableAtom } from 'jotai'

import type { TraceSettings } from './types'

const NOOP = () => {}

export const Trace = () => null

export const useProjectRoot = () => null
export const useInspectorActive = () => false
export const useDeactivateInspector = () => NOOP
export const useSelectedContext = () => null
export const useClearSelectedContext = () => NOOP
export const useSelectedSource = () => null
export const useWidgetPortalContainer = () => null

export { IS_MAC, MOD_KEY } from './utils/platform'

export function settingsPluginAtom<K extends keyof TraceSettings>(
  pluginKey: K,
) {
  return pluginKey as unknown as WritableAtom<
    TraceSettings[K],
    [TraceSettings[K]],
    void
  >
}

export type {
  ComponentContext,
  ComponentSource,
  TracePlugin,
  TraceProps,
  TraceSettings,
} from './types'
