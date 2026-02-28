import { XRay } from '@react-xray/core'
import { CommentsPlugin } from '@react-xray/plugin-comments'
import { CopyToClipboardPlugin } from '@react-xray/plugin-copy-to-clipboard'
import { OpenEditorPlugin } from '@react-xray/plugin-open-editor'
import { PreviewPlugin } from '@react-xray/plugin-preview'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <XRay
      plugins={[
        PreviewPlugin({ editable: true }),
        CopyToClipboardPlugin({ root: import.meta.env.VITE_ROOT }),
        OpenEditorPlugin({ root: import.meta.env.VITE_ROOT }),
        CommentsPlugin({ root: import.meta.env.VITE_ROOT }),
      ]}
    />
  </StrictMode>,
)
