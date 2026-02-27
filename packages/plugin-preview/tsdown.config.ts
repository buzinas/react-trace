import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['esm', 'cjs'],
  dts: true,
  platform: 'neutral',
  deps: {
    // shiki + @shikijs/monaco are bundled (pure JS, no special runtime requirements)
    neverBundle: [
      'react',
      'react/jsx-runtime',
      'react-dom',
      'react-dom/client',
      '@react-xray/core',
      '@monaco-editor/react',
    ],
  },
  sourcemap: true,
})
