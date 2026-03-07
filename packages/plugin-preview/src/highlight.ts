/** Injects the CSS animation for the highlighted source line — idempotent. */
export function ensureHighlightStyle() {
  if (document.getElementById('react-trace-highlighted-line')) return

  const style = document.createElement('style')
  style.id = 'react-trace-highlighted-line'
  style.textContent = `
    .react-trace-highlighted-line {
      background-color: rgba(0, 200, 255, 0.25);
      animation: react-trace-highlight-flash 1.2s ease-out;
    }

    @keyframes react-trace-highlight-flash {
      from { background-color: rgba(0, 200, 255, 0.6); }
      to   { background-color: rgba(0, 200, 255, 0.25); }
    }
  `
  document.head.appendChild(style)
}
