/** True when running on macOS / iOS */
export const IS_MAC =
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent)

/** The modifier key label for the current platform */
export const MOD_KEY = IS_MAC ? '⌘' : 'Ctrl'
