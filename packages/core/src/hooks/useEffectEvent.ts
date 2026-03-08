import {
  useEffectEvent as reactUseEffectEvent,
  useCallback,
  useRef,
} from 'react'

export const useEffectEvent =
  reactUseEffectEvent ??
  function useEffectEventShim<T extends (...args: any[]) => any>(fn: T): T {
    const ref = useRef<T>(fn)
    ref.current = fn
    return useCallback(((...args) => ref.current(...args)) as T, [])
  }
