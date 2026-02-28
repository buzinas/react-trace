import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { getComponentContext, resolveSource } from '../fiber'
import { fileSystemService } from '../fs'
import { IS_MAC } from '../platform'
import type { ComponentContext, RVEServices, XRayProps } from '../types'
import { ActionPanel } from './ActionPanel'
import { Overlay } from './Overlay'
import { Toolbar } from './Toolbar'

const services: RVEServices = { fs: fileSystemService }

/** How long Cmd/Ctrl+X must be held before the inspector latches on */
const LONGPRESS_MS = 600

export function XRay({ plugins = [], position = 'bottom-right' }: XRayProps) {
  const [enabled, setEnabled] = useState(false)

  const [hoveredContext, setHoveredContext] = useState<ComponentContext | null>(
    null,
  )
  const [selectedContext, setSelectedContext] =
    useState<ComponentContext | null>(null)
  // Ref so event handlers always see the latest hovered context without being in their dep array
  const hoveredContextRef = useRef<ComponentContext | null>(null)
  hoveredContextRef.current = hoveredContext

  // Portal container — a div appended to document.body so the overlay sits at the root
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(
    null,
  )
  const portalRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = document.createElement('div')
    container.setAttribute('data-react-xray', '')
    container.style.cssText =
      'position:fixed;inset:0;pointer-events:none;z-index:999997;'
    document.body.appendChild(container)
    portalRef.current = container
    setPortalContainer(container)
    return () => {
      document.body.removeChild(container)
    }
  }, [])

  // Silently try to restore a previously granted FS handle on mount
  useEffect(() => {
    fileSystemService.tryRestore()
  }, [])

  const deselect = useCallback(() => setSelectedContext(null), [])

  const toggle = useCallback(
    (value?: boolean) => setEnabled((prev) => value ?? !prev),
    [],
  )

  // Long-press Cmd+X (Mac) / Ctrl+X (other): hold for LONGPRESS_MS to latch inspector on.
  // Releasing before the timer fires cancels — no accidental activation.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null

    function onKeyDown(e: KeyboardEvent) {
      const modifierHeld = IS_MAC ? e.metaKey : e.ctrlKey
      if (e.key === 'x' && modifierHeld && !e.repeat && timer === null) {
        e.preventDefault() // prevent browser Cut
        timer = setTimeout(() => {
          timer = null
          setEnabled(true)
        }, LONGPRESS_MS)
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      // If either key is released before the timer fires, cancel
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

  // Inspector mouse + keyboard listeners — active whenever enabled
  useEffect(() => {
    if (!enabled) return

    let lastHoveredElement: HTMLElement | null = null

    function onMouseMove(e: MouseEvent) {
      const target = e.target as HTMLElement | null
      if (!target || target === lastHoveredElement) return
      if (portalRef.current?.contains(target)) return

      lastHoveredElement = target
      const ctx = getComponentContext(target)
      setHoveredContext(ctx)

      // Async: remap compiled positions → original TypeScript positions via source map.
      // Resolves the top-level source AND every entry in ctx.all in parallel (all
      // cached per URL, so only the first hover on each file incurs a fetch).
      if (ctx) {
        Promise.all([
          ctx.source ? resolveSource(ctx.source) : Promise.resolve(null),
          ...ctx.all.map((e) =>
            e.source ? resolveSource(e.source) : Promise.resolve(null),
          ),
        ]).then(([resolvedSource, ...resolvedAll]) => {
          if (lastHoveredElement !== target) return
          setHoveredContext((prev) => {
            if (prev?.element !== target) return prev
            return {
              ...prev,
              ...(resolvedSource && { source: resolvedSource }),
              all: prev.all.map((e, i) => ({
                ...e,
                source: resolvedAll[i] ?? e.source,
              })),
            }
          })
        })
      }
    }

    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null
      if (portalRef.current?.contains(target)) return

      e.stopPropagation()
      e.preventDefault()

      setSelectedContext(hoveredContextRef.current)
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      setSelectedContext((sel) => {
        if (sel) {
          // First Escape: deselect only
          return null
        }
        // Second Escape: turn inspector off
        setEnabled(false)
        setHoveredContext(null)
        return null
      })
    }

    document.addEventListener('mousemove', onMouseMove, { passive: true })
    document.addEventListener('click', onClick, true) // capture phase
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [enabled])

  // Clear hover/select when inspector is turned off
  useEffect(() => {
    if (!enabled) {
      setHoveredContext(null)
      setSelectedContext(null)
    }
  }, [enabled])

  if (!portalContainer) return null

  return createPortal(
    <>
      {/* Toolbar — pointer-events:auto so buttons are clickable */}
      <div style={{ pointerEvents: 'auto' }}>
        <Toolbar
          isActive={enabled}
          selectedContext={selectedContext}
          plugins={plugins}
          services={services}
          position={position}
          portalRef={portalRef}
          onToggle={toggle}
        />
      </div>

      {/* Overlay — pointer-events:none, managed by the container */}
      {enabled && (
        <Overlay
          hoveredContext={hoveredContext}
          selectedContext={selectedContext}
        />
      )}

      {/*
        ActionPanel — always rendered when inspector is active so the Popover can
        animate open/closed. The Popover.Positioner handles pointer-events itself.
      */}
      {enabled && (
        <ActionPanel
          context={selectedContext}
          plugins={plugins}
          services={services}
          portalRef={portalRef}
          onClose={deselect}
          onToggle={toggle}
        />
      )}
    </>,
    portalContainer,
  )
}
