import Trace from '@react-trace/kit'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Trace root={import.meta.env.VITE_ROOT} />
  </StrictMode>,
)
