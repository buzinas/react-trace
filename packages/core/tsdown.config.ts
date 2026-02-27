import { readFileSync } from 'node:fs'
import { defineConfig } from 'tsdown'

const inlineAssets = {
  name: 'inline-assets',
  load(id: string) {
    if (/\.(png|jpg|jpeg|gif|webp|avif)$/.test(id)) {
      const data = readFileSync(id).toString('base64')
      const ext = id.split('.').pop()!
      const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`
      return `export default 'data:${mime};base64,${data}'`
    }
  },
}

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  deps: {
    neverBundle: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  sourcemap: true,
  plugins: [inlineAssets],
})
