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
      '@react-xray/core',
      '@react-xray/ui-components',
      'jotai',
    ],
  },
  sourcemap: true,
})
