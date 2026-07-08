# @react-trace/plugin-preview

## 0.0.7

### Patch Changes

- 9c8efa9: Explain when folder access is unavailable instead of silently failing. The File System Access API (`showDirectoryPicker`) only exists in a secure context and in Chromium-based browsers, but the folder picker prompt always showed a "Grant access" button that quietly did nothing when the API was missing. It now detects the reason and shows guidance — WSL users reaching the dev server via the VM's IP (an insecure context) are told to use `http://localhost` instead, and non-Chromium browsers are told to switch. Addresses #8.

## 0.0.6

### Patch Changes

- Updated dependencies [65f51aa]
  - @react-trace/core@0.0.6

## 0.0.5

### Patch Changes

- Updated dependencies [47feb9f]
  - @react-trace/core@0.0.5

## 0.0.4

### Patch Changes

- 204ec50: Improve how source location is resolved and compute relative and absolute paths
- Updated dependencies [fde948b]
- Updated dependencies [204ec50]
  - @react-trace/ui-components@0.0.2
  - @react-trace/core@0.0.4

## 0.0.3

### Patch Changes

- 7e2c9dc: Deduplicate toRelativePath and add support for rspack / rsbuild / rspress
- Updated dependencies [7e2c9dc]
  - @react-trace/core@0.0.3

## 0.0.2

### Patch Changes

- Updated dependencies
  - @react-trace/core@0.0.2

## 0.0.1

### Patch Changes

- Initial version
- Updated dependencies
  - @react-trace/core@0.0.1
  - @react-trace/ui-components@0.0.1
