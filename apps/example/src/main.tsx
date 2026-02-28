import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import XRay from 'react-xray'

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <XRay root={import.meta.env.VITE_ROOT} />
  </StrictMode>,
)
