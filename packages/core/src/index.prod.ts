/**
 * Production stub for @react-xray/core.
 * XRay renders null so the inspector has zero runtime cost in production.
 */

import type { ComponentSource } from './types'

export { IS_MAC, MOD_KEY } from './platform'

export const XRay = () => null

export const resolveSource = async (source: ComponentSource) => source
export const toAbsolutePath = (path: string) => path
export const toRelativePath = (path: string) => path

export type {
  Action,
  ComponentContext,
  ComponentSource,
  FileSystemService,
  RVEPlugin,
  RVEServices,
  ToolbarItem,
  XRayProps,
} from './types'
