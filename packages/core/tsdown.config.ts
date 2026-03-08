import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.tsx', 'src/index.prod.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  platform: 'neutral',
  deps: {
    alwaysBundle: [
      '@jridgewell/trace-mapping',
      '@jridgewell/sourcemap-codec',
      '@jridgewell/resolve-uri',
      'jotai',
      'jotai-family',
      '@react-trace/ui-components',
    ],
    neverBundle: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      '@react-trace/ui-components',
    ],
  },
  sourcemap: true,
})
