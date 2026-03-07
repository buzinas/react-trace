export { Trace } from './components/Trace'
export {
  useProjectRoot,
  useInspectorActive,
  useDeactivateInspector,
  useSelectedContext,
  useClearSelectedContext,
  useSelectedSource,
  useWidgetPortalContainer,
  useWidgetServices,
} from './hooks'
export { resolveSource } from './fiber'
export { toAbsolutePath, toRelativePath } from './path'
export { IS_MAC, MOD_KEY } from './platform'

export { settingsPluginAtom } from './store'

export type {
  ComponentContext,
  ComponentSource,
  FileSystemService,
  TracePlugin,
  TraceServices,
  TraceProps,
  TraceSettings,
} from './types'
