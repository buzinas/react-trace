/**
 * Production stub for @react-xray/core.
 * XRay renders null so the inspector has zero runtime cost in production.
 */

import type { ComponentSource, FileSystemService, XRayServices } from './types'

export { IS_MAC, MOD_KEY } from './platform'

const NOOP = () => {}
const NOOP_FILE_SYSTEM_SERVICE: FileSystemService = {
  isSupported: false,
  hasAccess: false,
  async tryRestore() {
    return false
  },
  async requestAccess() {
    return false
  },
  subscribe() {
    return NOOP
  },
  async read() {
    return ''
  },
  async write() {},
}
const NOOP_WIDGET_SERVICES: XRayServices = {
  fs: NOOP_FILE_SYSTEM_SERVICE,
}

export const XRay = () => null

export const useProjectRoot = () => null
export const useInspectorActive = () => false
export const useDeactivateInspector = () => NOOP
export const useSelectedContext = () => null
export const useClearSelectedContext = () => NOOP
export const useSelectedSource = () => null
export const useWidgetPortalContainer = () => null
export const useWidgetServices = () => NOOP_WIDGET_SERVICES

export const resolveSource = async (source: ComponentSource) => source
export const toAbsolutePath = (path: string) => path
export const toRelativePath = (path: string) => path

export type {
  ComponentContext,
  ComponentSource,
  FileSystemService,
  XRayPlugin,
  XRayServices,
  XRayProps,
} from './types'
