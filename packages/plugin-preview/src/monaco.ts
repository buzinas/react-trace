import { loader } from '@monaco-editor/react'
import type { Monaco } from '@monaco-editor/react'
import { shikiToMonaco } from '@shikijs/monaco'
import { bundledThemes, createHighlighter } from 'shiki'

// Kick off the Monaco CDN download as soon as the plugin module is imported
loader.init()

export const langs = ['typescript', 'javascript', 'graphql', 'css']

export const highlighterPromise = createHighlighter({
  themes: Object.values(bundledThemes),
  langs,
})

/**
 * Monaco `beforeMount` callback — disables the built-in TS/JS language server
 * (no project types available in the browser) and wires Shiki for highlighting.
 */
export function configureBefore(monaco: Monaco) {
  const noValidation = {
    noSemanticValidation: true,
    noSyntaxValidation: true,
  }
  const { typescriptDefaults, javascriptDefaults } = monaco.languages.typescript

  typescriptDefaults.setDiagnosticsOptions(noValidation)
  javascriptDefaults.setDiagnosticsOptions(noValidation)

  const compilerOptions = {
    jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
    allowJs: true,
  }
  typescriptDefaults.setCompilerOptions(compilerOptions)
  javascriptDefaults.setCompilerOptions(compilerOptions)

  for (const id of langs) monaco.languages.register({ id })
  highlighterPromise.then((h) => shikiToMonaco(h, monaco))
}
