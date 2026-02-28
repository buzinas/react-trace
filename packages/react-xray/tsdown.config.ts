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
      '@react-xray/core',
      '@react-xray/plugin-comments',
      '@react-xray/plugin-copy-to-clipboard',
      '@react-xray/plugin-open-editor',
      '@react-xray/plugin-preview',
    ],
  },
  sourcemap: true,
})
