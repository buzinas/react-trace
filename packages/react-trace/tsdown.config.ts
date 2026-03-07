import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.tsx', 'src/index.prod.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  platform: 'neutral',
  deps: {
    neverBundle: [
      'react',
      'react/jsx-runtime',
      'react-dom',
      'react-dom/client',
      '@react-trace/core',
      '@react-trace/plugin-comments',
      '@react-trace/plugin-copy-to-clipboard',
      '@react-trace/plugin-open-editor',
      '@react-trace/plugin-preview',
    ],
  },
  sourcemap: true,
})
