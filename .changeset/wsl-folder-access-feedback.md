---
"@react-trace/plugin-preview": patch
---

Explain when folder access is unavailable instead of silently failing. The File System Access API (`showDirectoryPicker`) only exists in a secure context and in Chromium-based browsers, but the folder picker prompt always showed a "Grant access" button that quietly did nothing when the API was missing. It now detects the reason and shows guidance — WSL users reaching the dev server via the VM's IP (an insecure context) are told to use `http://localhost` instead, and non-Chromium browsers are told to switch. Addresses #8.
