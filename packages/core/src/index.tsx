import logo from './logo.png'

export function VisualEditor() {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        background: '#18181b',
        color: '#fafafa',
        padding: '4px',
        borderRadius: 8,
        fontFamily: 'system-ui, sans-serif',
        fontSize: 13,
        zIndex: 999999,
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        userSelect: 'none',
      }}
    >
      <button
        style={{
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
        }}
      >
        <img
          src={logo}
          alt=""
          width={24}
          height={24}
          style={{ verticalAlign: 'middle' }}
        />
      </button>
    </div>
  )
}
