---
"@react-trace/plugin-comments": patch
---

Fix `process is not defined` in browser bundlers (e.g. Vite). The comments plugin imported `@opencode-ai/sdk` from its package root, which re-exports the Node-only `server.js` (`node:child_process`, `process`) and leaked it into the client bundle. It now imports from the browser-safe `@opencode-ai/sdk/client` subpath, and the OpenCode form is loaded via a dynamic `import()` so the SDK lands in its own lazily-fetched chunk.
