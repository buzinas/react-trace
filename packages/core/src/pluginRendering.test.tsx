import { describe, expect, it } from 'vitest'

import {
  getActionPanelPluginEntries,
  getToolbarPluginEntries,
  hasActionPanelContent,
} from './pluginRendering'
import type {
  ComponentContext,
  FileSystemService,
  RVEPlugin,
  RVEServices,
} from './types'

function ToolbarRenderer() {
  return null
}

function ActionPanelRenderer() {
  return null
}

function LegacySubpanel() {
  return null
}

const fileSystemService: FileSystemService = {
  isSupported: true,
  hasAccess: false,
  async tryRestore() {
    return false
  },
  async requestAccess() {
    return false
  },
  subscribe() {
    return () => {}
  },
  async read() {
    return ''
  },
  async write() {},
}

const services: RVEServices = {
  fs: fileSystemService,
  root: '/repo',
}

const ctx: ComponentContext = {
  element: {} as HTMLElement,
  displayName: 'Card',
  breadcrumb: ['Card'],
  all: [],
  source: {
    fileName: '/repo/src/Card.tsx',
    lineNumber: 10,
    columnNumber: 2,
  },
  props: {},
}

describe('plugin rendering contracts', () => {
  it('preserves plugin order while exposing direct toolbar renderers', () => {
    const plugins: RVEPlugin[] = [
      {
        name: 'alpha',
        toolbar: ToolbarRenderer,
      },
      {
        name: 'beta',
        toolbarItems: [
          {
            id: 'legacy',
            icon: null,
            label: 'Legacy',
            onClick() {},
          },
        ],
      },
    ]

    const entries = getToolbarPluginEntries(plugins)

    expect(entries.map((entry) => entry.name)).toEqual(['alpha', 'beta'])
    expect(entries[0]?.toolbar).toBe(ToolbarRenderer)
    expect(entries[0]?.legacyToolbarItems).toHaveLength(0)
    expect(entries[1]?.legacyToolbarItems.map((item) => item.id)).toEqual([
      'legacy',
    ])
  })

  it('collects direct action-panel renderers with legacy compatibility content', () => {
    const plugins: RVEPlugin[] = [
      {
        name: 'alpha',
        actionPanel: ActionPanelRenderer,
      },
      {
        name: 'beta',
        subpanel: LegacySubpanel,
        actions() {
          return [
            {
              id: 'legacy-action',
              label: 'Legacy action',
              onClick() {
                return true
              },
            },
          ]
        },
      },
    ]

    const entries = getActionPanelPluginEntries(plugins, ctx, services)

    expect(hasActionPanelContent(entries)).toBe(true)
    expect(entries[0]?.actionPanel).toBe(ActionPanelRenderer)
    expect(entries[1]?.legacySubpanel).toBe(LegacySubpanel)
    expect(entries[1]?.legacyActions.map((action) => action.id)).toEqual([
      'legacy-action',
    ])
  })
})
