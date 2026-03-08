import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.tsx', 'src/index.prod.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  platform: 'neutral',
  deps: {
    neverBundle: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      '@react-trace/core',
      '@react-trace/ui-components',
      'jotai',
    ],
  },
  sourcemap: true,
})
