import type {
  Action,
  ComponentContext,
  RVEPlugin,
  RVEServices,
  ToolbarItem,
} from './types'

export interface ToolbarPluginEntry {
  name: string
  toolbar?: RVEPlugin['toolbar']
  legacyToolbarItems: ToolbarItem[]
}

export interface ActionPanelPluginEntry {
  name: string
  actionPanel?: RVEPlugin['actionPanel']
  legacySubpanel?: RVEPlugin['subpanel']
  legacyActions: Action[]
}

export function getToolbarPluginEntries(
  plugins: RVEPlugin[],
): ToolbarPluginEntry[] {
  return plugins.map((plugin) => ({
    name: plugin.name,
    toolbar: plugin.toolbar,
    legacyToolbarItems: plugin.toolbarItems ?? [],
  }))
}

export function getActionPanelPluginEntries(
  plugins: RVEPlugin[],
  ctx: ComponentContext,
  services: RVEServices,
): ActionPanelPluginEntry[] {
  return plugins.map((plugin) => ({
    name: plugin.name,
    actionPanel: plugin.actionPanel,
    legacySubpanel: plugin.subpanel,
    legacyActions: plugin.actions?.(ctx, services) ?? [],
  }))
}

export function hasActionPanelContent(entries: ActionPanelPluginEntry[]) {
  return entries.some(
    (entry) =>
      entry.actionPanel ||
      entry.legacySubpanel ||
      entry.legacyActions.length > 0,
  )
}
