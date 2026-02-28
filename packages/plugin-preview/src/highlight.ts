/** Injects the CSS animation for the highlighted source line — idempotent. */
export function ensureHighlightStyle() {
  if (document.getElementById('xray-highlighted-line')) return

  const style = document.createElement('style')
  style.id = 'xray-highlighted-line'
  style.textContent = `
    .xray-highlighted-line {
      background-color: rgba(0, 200, 255, 0.25);
      animation: xray-highlight-flash 1.2s ease-out;
    }

    @keyframes xray-highlight-flash {
      from { background-color: rgba(0, 200, 255, 0.6); }
      to   { background-color: rgba(0, 200, 255, 0.25); }
    }
  `
  document.head.appendChild(style)
}
