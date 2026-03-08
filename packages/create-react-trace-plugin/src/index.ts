import { existsSync, readdirSync } from 'node:fs'
import { rm } from 'node:fs/promises'

import * as clack from '@clack/prompts'
import { defineCommand, runMain } from 'citty'
import { downloadTemplate } from 'giget'

import {
  KEBAB_CASE_RE,
  LOCAL_TEMPLATE_PATH,
  TEMPLATE_SOURCE,
  USE_LOCAL,
  VALID_SLOTS,
  detectPackageManager,
  type Slot,
} from './consts'
import {
  copyLocalTemplate,
  ensureNotCancelled,
  formatOutputFiles,
  installDependencies,
  removeEmptyFiles,
  renderTemplateFiles,
  withRetry,
} from './utils'

const main = defineCommand({
  meta: {
    name: 'create-react-trace-plugin',
    version: '0.0.1',
    description: 'Scaffold a new react-trace plugin',
  },
  args: {
    name: {
      type: 'string',
      alias: 'n',
      description: 'Plugin name (in kebab-case, e.g. "my-feature")',
    },
    description: {
      type: 'string',
      alias: 'd',
      description: 'Plugin description',
    },
    slots: {
      type: 'string',
      alias: 's',
      description:
        'Comma-separated plugin slots (toolbar,actionPanel,settings)',
    },
    workspace: {
      type: 'boolean',
      alias: 'w',
      description:
        'Generate for the react-trace monorepo (uses workspace:* deps)',
      default: false,
    },
    install: {
      type: 'boolean',
      alias: 'i',
      description: 'Install dependencies after scaffolding',
    },
  },
  async run({ args }) {
    clack.intro('create-react-trace-plugin')

    const invalidName = args.name != null && !KEBAB_CASE_RE.test(args.name)
    const name = ensureNotCancelled(
      args.name != null && !invalidName
        ? args.name
        : await clack.text({
            message: invalidName
              ? 'Plugin name must be kebab-case (e.g. "my-feature"):'
              : 'Plugin name (in kebab-case, e.g. "my-feature"):',
            placeholder: 'my-feature',
            validate(value) {
              if (!value) return 'Name is required'
              if (!KEBAB_CASE_RE.test(value)) {
                return 'Name must be kebab-case (e.g. "my-feature")'
              }
            },
          }),
    )

    const emptyDescription =
      args.description != null && args.description.trim() === ''
    const description = ensureNotCancelled(
      args.description != null && !emptyDescription
        ? args.description
        : await clack.text({
            message: emptyDescription
              ? 'Description cannot be empty. Plugin description:'
              : 'Plugin description:',
            placeholder: 'Describe what your plugin does',
            validate(value) {
              if (!value) return 'Description is required'
            },
          }),
    )

    const parsedSlots = args.slots
      ?.split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const invalidSlots =
      parsedSlots != null &&
      !parsedSlots.every((s): s is Slot =>
        (VALID_SLOTS as readonly string[]).includes(s),
      )

    const slots = ensureNotCancelled(
      parsedSlots != null && !invalidSlots
        ? (parsedSlots as Slot[])
        : await clack.multiselect({
            message: invalidSlots
              ? 'Invalid slot names. Pick from the list below:'
              : 'Which plugin slots do you want to scaffold?',
            options: [
              {
                value: 'toolbar' as const,
                label: 'Toolbar',
                hint: 'Button in the widget toolbar',
              },
              {
                value: 'actionPanel' as const,
                label: 'Action panel',
                hint: 'Item in the component action dropdown',
              },
              {
                value: 'settings' as const,
                label: 'Settings',
                hint: 'Section in the widget settings (includes store)',
              },
            ],
            required: false,
          }),
    )

    const workspace = args.workspace
    const packageName = workspace
      ? `@react-trace/plugin-${name}`
      : `react-trace-plugin-${name}`
    const outputDir = workspace ? `packages/plugin-${name}` : `plugin-${name}`

    const templateData = {
      pluginName: name,
      packageName,
      pluginDescription: description,
      workspace,
      hasToolbar: slots.includes('toolbar'),
      hasActionPanel: slots.includes('actionPanel'),
      hasSettings: slots.includes('settings'),
    }

    const dirExists = existsSync(outputDir) && readdirSync(outputDir).length > 0

    if (dirExists) {
      const resolution = ensureNotCancelled(
        await clack.select({
          message: `Directory ${outputDir} already exists. What do you want to do?`,
          options: [
            {
              value: 'overwrite' as const,
              label: 'Overwrite',
              hint: 'Merge into existing directory, overwrite colliding files',
            },
            {
              value: 'clean' as const,
              label: 'Clear and recreate',
              hint: 'Delete the directory and start fresh',
            },
            { value: 'abort' as const, label: 'Abort' },
          ],
        }),
      )

      if (resolution === 'abort') {
        clack.cancel('Operation cancelled.')
        process.exit(0)
      }

      if (resolution === 'clean') {
        await rm(outputDir, { recursive: true, force: true })
      }
    }

    const s = clack.spinner()

    if (USE_LOCAL) {
      s.start('Copying local template...')
      try {
        await copyLocalTemplate(LOCAL_TEMPLATE_PATH, outputDir)
      } catch (error) {
        s.stop('Failed to copy template.')
        clack.cancel(
          error instanceof Error ? error.message : 'Template copy failed',
        )
        process.exit(1)
      }
      s.stop('Template copied.')
    } else {
      s.start('Downloading template...')
      try {
        await withRetry(() =>
          downloadTemplate(TEMPLATE_SOURCE, {
            dir: outputDir,
            force: dirExists,
          }),
        )
      } catch (error) {
        s.stop('Failed to download template.')
        clack.cancel(
          error instanceof Error ? error.message : 'Template download failed',
        )
        process.exit(1)
      }
      s.stop('Template downloaded.')
    }

    s.start('Rendering template...')
    await renderTemplateFiles(outputDir, templateData)
    await removeEmptyFiles(outputDir)
    await formatOutputFiles(outputDir)
    s.stop('Plugin scaffolded.')

    const pm = detectPackageManager()

    const shouldInstall = ensureNotCancelled(
      args.install ??
        (await clack.confirm({
          message: 'Install dependencies?',
        })),
    )

    if (shouldInstall) {
      s.start(`Installing dependencies with ${pm}...`)
      try {
        await installDependencies(pm, outputDir, (msg) => s.message(msg))
        s.stop('Dependencies installed.')
      } catch (error) {
        s.stop('Failed to install dependencies.')
        clack.log.warn(
          error instanceof Error ? error.message : 'Install failed',
        )
      }
    }

    const nextSteps = [`cd ${outputDir}`]
    if (!shouldInstall) nextSteps.push(`${pm} install`)
    nextSteps.push(`${pm} build`)

    clack.note(nextSteps.join('\n'), 'Next steps')

    clack.outro(`Plugin ${packageName} created.`)
  },
})

runMain(main)
