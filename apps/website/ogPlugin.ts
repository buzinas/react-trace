import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { cwd } from 'node:process'

import type { RspressPlugin } from '@rspress/core'
import sharp from 'sharp'
import { joinURL } from 'ufo'

const MAX_TITLE_CHARS = 30
const MAX_DESC_CHARS = 55
const OG_DIR = 'og'

interface ImageInfo {
  title: string
  description: string
  imageName: string
  imageUrl: string
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function splitLines(text: string, maxChars: number): string[] {
  return text
    .trim()
    .split(new RegExp(`(.{0,${maxChars}})(?:\\s|$)`, 'g'))
    .filter(Boolean)
}

function slugifyPath(path: string): string {
  return `${path.replace(/\//g, '-').replace(/\.mdx?$/, '')}.png`
}

export function ogPlugin(domain: string): RspressPlugin {
  const images = new Map<string, ImageInfo>()
  let svgTemplate: string | undefined

  return {
    name: 'og-plugin',
    config(config) {
      const headCreators = [
        (url: string) =>
          ['meta', { name: 'twitter:image', content: url }] as [
            string,
            Record<string, string>,
          ],
        () =>
          [
            'meta',
            { name: 'twitter:card', content: 'summary_large_image' },
          ] as [string, Record<string, string>],
        (url: string) =>
          ['meta', { property: 'og:image', content: url }] as [
            string,
            Record<string, string>,
          ],
        () =>
          ['meta', { property: 'og:image:width', content: '1200' }] as [
            string,
            Record<string, string>,
          ],
        () =>
          ['meta', { property: 'og:image:height', content: '630' }] as [
            string,
            Record<string, string>,
          ],
        () =>
          ['meta', { property: 'og:image:type', content: 'image/png' }] as [
            string,
            Record<string, string>,
          ],
      ]

      config.head = [
        ...(config.head || []),
        ...headCreators.map((creator) => (route: { routePath: string }) => {
          const info = images.get(route.routePath)
          if (!info) return undefined
          return creator(info.imageUrl)
        }),
      ]

      return config
    },
    extendPageData(pageData: any) {
      const title = pageData.frontmatter?.title || pageData.title
      if (!title) return

      const description =
        pageData.frontmatter?.description || pageData.description || ''
      const imageName = slugifyPath(pageData._relativePath)

      images.set(pageData.routePath, {
        title,
        description,
        imageName,
        imageUrl: joinURL(domain, OG_DIR, imageName),
      })
    },
    async afterBuild(config: any) {
      const outputFolder = join(cwd(), config.outDir ?? 'doc_build', OG_DIR)
      const templatePath = join(cwd(), 'og-template.svg')

      if (!svgTemplate) {
        svgTemplate = readFileSync(templatePath, 'utf-8')
      }

      await Promise.all(
        Array.from(images.values()).map(
          async ({ title, description, imageName }) => {
            const output = join(outputFolder, imageName)
            if (existsSync(output)) return

            mkdirSync(dirname(output), { recursive: true })

            const titleLines = splitLines(title, MAX_TITLE_CHARS)
            const descLines = splitLines(description, MAX_DESC_CHARS)

            const data: Record<string, string> = {
              line1: titleLines[0] ? escapeHtml(titleLines[0]) : '',
              line2: titleLines[1] ? escapeHtml(titleLines[1]) : '',
              line3: titleLines[2] ? escapeHtml(titleLines[2]) : '',
              desc1: descLines[0] ? escapeHtml(descLines[0]) : '',
              desc2: descLines[1] ? escapeHtml(descLines[1]) : '',
              desc3: descLines[2] ? escapeHtml(descLines[2]) : '',
            }

            const svg = svgTemplate!.replace(
              /\{\{([^}]+)\}\}/g,
              (_, name: string) => data[name] || '',
            )

            await sharp(Buffer.from(svg))
              .resize(2400, 1260)
              .png()
              .toFile(output)
          },
        ),
      )

      const homeScreenshot = join(cwd(), 'theme', 'og-home.png')
      if (existsSync(homeScreenshot)) {
        const dest = join(outputFolder, 'index.png')
        copyFileSync(homeScreenshot, dest)
      }

      console.log(`[og-plugin] ${images.size} OG images generated.`)
    },
  }
}
