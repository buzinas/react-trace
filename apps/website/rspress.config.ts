import { join } from 'node:path'

import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill'
import { defineConfig } from '@rspress/core'
import { pluginSitemap } from '@rspress/plugin-sitemap'

import { ogPlugin } from './ogPlugin'

const SITE_URL = 'https://react-trace.js.org'

export default defineConfig({
  root: 'docs',
  plugins: [
    ogPlugin(SITE_URL),
    pluginSitemap({
      siteUrl: SITE_URL,
    }),
  ],
  llms: true,
  head: [
    (route) => [
      'link',
      { rel: 'canonical', href: `${SITE_URL}${route.routePath}` },
    ],
    (route) => [
      'meta',
      { property: 'og:url', content: `${SITE_URL}${route.routePath}` },
    ],
    ['meta', { property: 'og:site_name', content: 'React Trace' }],
    ['meta', { name: 'twitter:site', content: '@vbuzinas' }],
  ],
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
    html: {
      tags: [
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'React Trace',
            url: SITE_URL,
            description:
              'A development-time React inspector that helps you identify rendered components, resolve their source locations, and run source-aware actions.',
            author: {
              '@type': 'Person',
              name: 'Vitor Buzinas',
              url: 'https://x.com/vbuzinas',
            },
          }),
        },
      ],
    },
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
