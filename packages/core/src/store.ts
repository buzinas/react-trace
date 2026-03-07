import { atom, createStore } from 'jotai'
import type { WritableAtom } from 'jotai'
import { atomFamily } from 'jotai-family'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'

import { fileSystemService } from './fs'
import type { ComponentContext, TraceServices, TraceSettings } from './types'

/**
 * The scoped Jotai store used by the Trace widget.
 * Created once per `<Trace />` mount via the Provider in Trace.tsx.
 * Plugins import atoms from this module and read them through the hooks in
 * `./hooks.ts`, which are scoped to the nearest Provider.
 */

/**
 * Absolute path to the project root.
 */
export const projectRootAtom = atom<string>('')

/**
 * Settings atom per project root, persisted in localStorage.
 */
const settingsAtom = atomFamily((root: string) =>
  atomWithStorage<TraceSettings>(
    `my-widget:settings:${root}`,
    { core: { position: 'bottom-right' } },
    createJSONStorage<TraceSettings>(() => localStorage),
    { getOnInit: typeof window !== 'undefined' },
  ),
)

const currentSettingsAtom = atom(
  (get) => get(settingsAtom(get(projectRootAtom))),
  (get, set, value: TraceSettings) => {
    const root = get(projectRootAtom)
    set(settingsAtom(root), value)
  },
)

const settingsPluginFamily = atomFamily((pluginKey: keyof TraceSettings) =>
  atom(
    (get) => get(currentSettingsAtom)[pluginKey],
    (get, set, value: TraceSettings[keyof TraceSettings]) => {
      const prev = get(currentSettingsAtom)
      set(currentSettingsAtom, { ...prev, [pluginKey]: value })
    },
  ),
)

/**
 * Atom family for plugin-specific settings.
 * @param pluginKey
 * @returns
 */
export function settingsPluginAtom<K extends keyof TraceSettings>(
  pluginKey: K,
) {
  // wrapper function to narrow down the type of the atom family
  return settingsPluginFamily(pluginKey) as WritableAtom<
    TraceSettings[K],
    [TraceSettings[K]],
    void
  >
}

export const coreSettingsAtom = settingsPluginFamily('core')

/**
 * The portal container element that the widget renders into. Plugins can read
 * this to mount their own portals inside the same container.
 */
export const portalContainerAtom = atom(() => {
  const existing = document.querySelector('[data-react-trace]')
  if (existing) return existing as HTMLDivElement

  const container = document.createElement('div')
  container.setAttribute('data-react-trace', '')
  container.style.cssText =
    'position:fixed;inset:0;pointer-events:none;z-index:999997;'
  document.body.appendChild(container)
  return container
})

/**
 * Services provided by core to all plugins.
 */
export const servicesAtom = atom<TraceServices>({ fs: fileSystemService })

/**
 * Inspector active state.
 */
export const inspectorActiveAtom = atom(false)

/**
 * The component context that is currently selected in the inspector.
 */
export const selectedContextAtom = atom<ComponentContext | null>(null)

/**
 * The source of the currently selected file.
 */
export const selectedSourceAtom =
  atom<ComponentContext['all'][number]['source']>(null)

/**
 * Creates a new Jotai store instance for Trace widget.
 */
export const createWidgetStore = () => createStore()
