import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  platform: 'node',
  banner: { js: '#!/usr/bin/env node' },
  sourcemap: true,
})
