import { atom, createStore } from 'jotai'

import { fileSystemService } from './fs'
import type { ComponentContext, RVEServices } from './types'

/**
 * The scoped Jotai store used by the XRay widget.
 * Created once per `<XRay />` mount via the Provider in XRay.tsx.
 * Plugins import atoms from this module and read them through the hooks in
 * `./hooks.ts`, which are scoped to the nearest Provider.
 */

/**
 * Absolute path to the project root.
 */
export const projectRootAtom = atom<string>()

/**
 * The portal container element that the widget renders into. Plugins can read
 * this to mount their own portals inside the same container.
 */
export const portalContainerAtom = atom(() => {
  const existing = document.querySelector('[data-react-xray]')
  if (existing) return existing as HTMLDivElement

  const container = document.createElement('div')
  container.setAttribute('data-react-xray', '')
  container.style.cssText =
    'position:fixed;inset:0;pointer-events:none;z-index:999997;'
  document.body.appendChild(container)
  return container
})

/**
 * Services provided by core to all plugins.
 */
export const servicesAtom = atom<RVEServices>({ fs: fileSystemService })

/**
 * The component context that is currently selected in the inspector.
 */
export const selectedContextAtom = atom<ComponentContext | null>(null)

/**
 * Creates a new Jotai store instance for XRay widget.
 */
export const createWidgetStore = () => createStore()
