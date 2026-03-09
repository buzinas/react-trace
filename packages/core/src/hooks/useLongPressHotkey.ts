import { useAtom, useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import { coreSettingsAtom, inspectorActiveAtom } from '../store'
import { IS_MAC } from '../utils/platform'

const LONGPRESS_MS = 600

/**
 * Activates a callback when the user holds Cmd+X (Mac) or Ctrl+X (other)
 * for {@link LONGPRESS_MS} milliseconds. Releasing before the timer fires
 * cancels the activation. Prevents the browser's native Cut action.
 */
export function useLongPressHotkey() {
  const setInspectorActive = useSetAtom(inspectorActiveAtom)
  const [coreSettings, setCoreSettings] = useAtom(coreSettingsAtom)
  const settingsRef = useRef(coreSettings)
  settingsRef.current = coreSettings

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null

    function onKeyDown(e: KeyboardEvent) {
      const modifierHeld = IS_MAC ? e.metaKey : e.ctrlKey
      if (e.key === 'x' && modifierHeld && !e.repeat && timer === null) {
        e.preventDefault()
        timer = setTimeout(() => {
          timer = null
          setInspectorActive(true)
          if (settingsRef.current.minimized) {
            setCoreSettings({ ...settingsRef.current, minimized: false })
          }
        }, LONGPRESS_MS)
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.key === 'x' || e.key === 'Meta' || e.key === 'Control') {
        if (timer !== null) {
          clearTimeout(timer)
          timer = null
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
      if (timer !== null) clearTimeout(timer)
    }
  }, [])
}
