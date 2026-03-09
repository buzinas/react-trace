import { join } from 'node:path'

import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill'
import { defineConfig } from '@rspress/core'

export default defineConfig({
  root: 'docs',
  globalStyles: join(__dirname, 'tailwind.css'),
  title: 'React Trace',
  description:
    'A development-time React inspector that helps you identify rendered components, resolve their source locations, and run source-aware actions.',
  icon: '/favicon.svg',
  logo: {
    light: '/logo.svg',
    dark: '/logo-dark.svg',
  },
  builderConfig: {
    plugins: [pluginNodePolyfill()],
    output: {
      sourceMap: true,
    },
    source: {
      define: {
        'process.env.ROOT': JSON.stringify(process.env.ROOT),
      },
    },
  },
  outDir: 'dist',
  route: {
    cleanUrls: true,
  },
  themeConfig: {
    darkMode: true,
    footer: {
      message: 'MIT License',
    },
    nav: [{ text: 'Docs', link: '/guide/' }],
    sidebar: {
      '/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Configuration', link: '/guide/configuration' },
            { text: 'Production Stubs', link: '/guide/production-stubs' },
          ],
        },
        {
          text: 'Plugins',
          items: [
            { text: 'Overview', link: '/plugins/' },
            { text: 'Preview', link: '/plugins/preview' },
            { text: 'Comments', link: '/plugins/comments' },
            {
              text: 'Copy to Clipboard',
              link: '/plugins/copy-to-clipboard',
            },
            { text: 'Open Editor', link: '/plugins/open-editor' },
          ],
        },
        {
          text: 'Extending',
          items: [
            { text: 'Creating Plugins', link: '/extending/plugin-api' },
            { text: 'UI Components', link: '/extending/ui-components' },
          ],
        },
      ],
    },
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/buzinas/react-trace',
      },
      {
        icon: 'x',
        mode: 'link',
        content: 'https://x.com/vbuzinas',
      },
    ],
  },
})
