import { Card } from './Card'
import { Header } from './Header'

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
        <Card title="Getting started">
          <p>
            Add <code>{'<VisualEditor />'}</code> anywhere in your app tree.
          </p>
        </Card>
      </div>
    </>
  )
}
