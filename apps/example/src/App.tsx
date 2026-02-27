import { Card } from './Card'
import { Header } from './Header'

const CONSTANT_TEXT = 'Constant Text'

export default function App() {
  return (
    <>
      <div
        style={{
          maxWidth: 640,
          margin: '40px auto',
          padding: '0 24px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <Header />
        <Card title="About">
          <p>
            Select elements in the app to inspect the underlying React
            components.
          </p>
        </Card>
        <Card title="Getting Started">
          <p>
            Add <code>{'<XRay />'}</code> anywhere in your app tree.
          </p>
        </Card>
        <Card title="Direct text">{CONSTANT_TEXT}</Card>
      </div>
    </>
  )
}
