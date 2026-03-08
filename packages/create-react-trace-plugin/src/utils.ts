import { cp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'

import * as clack from '@clack/prompts'
import { execa } from 'execa'
import { Liquid } from 'liquidjs'
import { format } from 'oxfmt'

import { OXFMT_OPTIONS } from './consts'

export function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
}

export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

export function ensureNotCancelled<T>(value: T | symbol): T {
  if (clack.isCancel(value)) {
    clack.cancel('Operation cancelled.')
    process.exit(0)
  }
  return value as T
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 2,
  delay: number = 1000,
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === retries) throw error
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  throw new Error('Unreachable')
}

export async function copyLocalTemplate(
  src: string,
  dest: string,
): Promise<void> {
  await cp(src, dest, { recursive: true })
}

export async function installDependencies(
  pm: string,
  cwd: string,
  onMessage: (msg: string) => void,
): Promise<void> {
  const subprocess = execa(pm, ['install'], { cwd })

  subprocess.stdout?.on('data', (data: Buffer) => {
    const line = data.toString().trim()
    if (line) onMessage(line)
  })

  subprocess.stderr?.on('data', (data: Buffer) => {
    const line = data.toString().trim()
    if (line) onMessage(line)
  })

  await subprocess
}

async function getFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    if (entry.isFile()) {
      files.push(join(entry.parentPath, entry.name))
    }
  }

  return files
}

export async function renderTemplateFiles(
  dir: string,
  data: Record<string, unknown>,
): Promise<void> {
  const engine = new Liquid()
  engine.registerFilter('pascalCase', (v: string) => toPascalCase(v))
  engine.registerFilter('camelCase', (v: string) => toCamelCase(v))

  const files = await getFiles(dir)

  for (const filePath of files) {
    if (!filePath.endsWith('.liquid')) continue

    const content = await readFile(filePath, 'utf-8')
    const rendered = await engine.parseAndRender(content, data)
    const targetPath = filePath.slice(0, -'.liquid'.length)
    await writeFile(targetPath, rendered)
    await rm(filePath)
  }
}

export async function removeEmptyFiles(dir: string): Promise<void> {
  const files = await getFiles(dir)

  for (const filePath of files) {
    const content = await readFile(filePath, 'utf-8')
    if (content.trim() === '') {
      await rm(filePath)
    }
  }
}

export async function formatOutputFiles(dir: string): Promise<void> {
  const files = await getFiles(dir)

  for (const filePath of files) {
    const content = await readFile(filePath, 'utf-8')
    const result = await format(basename(filePath), content, OXFMT_OPTIONS)
    await writeFile(filePath, result.code)
  }
}
