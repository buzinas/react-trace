import { XRay } from '@react-xray/core'
import { OpenEditorPlugin } from '@react-xray/plugin-open-editor'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <XRay
      plugins={[
        OpenEditorPlugin({
          root: import.meta.env.VITE_ROOT,
        }),
      ]}
    />
  </StrictMode>,
)
