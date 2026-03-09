export { Trace } from './components/Trace'
export {
  useProjectRoot,
  useInspectorActive,
  useDeactivateInspector,
  useSelectedContext,
  useClearSelectedContext,
  useSelectedSource,
  useWidgetPortalContainer,
} from './hooks'
export { IS_MAC, MOD_KEY } from './utils/platform'

export { settingsPluginAtom } from './store'

export type {
  ComponentContext,
  ComponentSource,
  TracePlugin,
  TraceProps,
  TraceSettings,
} from './types'
