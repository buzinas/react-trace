import { useState } from 'react'

export function Hotkey() {
  const [isMac] = useState(
    () =>
      typeof window === 'undefined' ||
      /Mac|iPhone|iPad|iPod/.test(navigator.userAgent),
  )

  return (
    <>
      <kbd className="inline py-1 px-2 text-[0.85em] font-mono bg-(--rp-c-bg-soft) border border-(--rp-c-divider) rounded">
        {isMac ? '⌘' : 'Ctrl'}
      </kbd>
      {' + '}
      <kbd className="inline py-1 px-2 text-[0.85em] font-mono bg-(--rp-c-bg-soft) border border-(--rp-c-divider) rounded">
        x
      </kbd>
    </>
  )
}
