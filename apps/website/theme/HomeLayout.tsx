import Trace from '@react-trace/kit'
import { CodeBlockRuntime, HomeBackground } from '@rspress/core/theme'
import { Link } from '@rspress/core/theme'
import { SvgWrapper, IconGithub } from '@rspress/core/theme-original'
import type { ReactNode } from 'react'

import { Video } from '../docs/_components/Video'
import demoVideo from './videos/react-trace-demo.mp4'
import demoPoster from './videos/react-trace-demo.webp'

function IconDot({ width, height }: { width: number; height: number }) {
  return (
    <svg
      viewBox="0 0 8 8"
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mt-2.75 shrink-0"
    >
      <circle cx="4" cy="4" r="3" fill="currentColor" />
    </svg>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 lg:pt-32 pb-12 px-6">
      <div className="relative max-w-280 mx-auto flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[0.8rem] font-medium text-brand-light border border-brand/30 bg-brand/8 mb-6">
          Development-only — zero production cost
        </span>
        <h1 className="text-[clamp(2.4rem,5vw,3.8rem)] font-extrabold leading-[1.1] text-balance tracking-tight text-text-1 mb-5 max-w-240">
          A development-time React{' '}
          <span className="bg-linear-to-br from-brand to-brand-light bg-clip-text text-transparent">
            inspector
          </span>{' '}
          for your components
        </h1>
        <div className="inline-flex items-center gap-2 bg-surface border border-border rounded-[10px] px-5 py-3 my-8 font-mono text-[0.88rem] text-text-2">
          <span className="text-text-3">$</span>
          <code className="text-text-1">pnpm add -D @react-trace/kit</code>
        </div>
        <div className="inline-flex flex-col justify-center mt-4 mb-12">
          <p className="text-lg text-text-2 max-w-200 leading-relaxed text-balance text-left">
            Identify rendered components, find their source locations, and
            choose what to do
          </p>
          <ul className="text-left ml-4 mt-6 flex flex-col gap-3">
            <li className="flex gap-2">
              <IconDot width={8} height={8} />
              Open the file in your editor, on the exact line of your component
              definition
            </li>
            <li className="flex gap-2">
              <IconDot width={8} height={8} />
              Preview the code and edit it directly in the browser
            </li>
            <li className="flex gap-2">
              <IconDot width={8} height={8} />
              Add comments and then copy & paste to your AI agents
            </li>
            <li className="flex gap-2">
              <IconDot width={8} height={8} />
              Or even send them to your session on OpenCode for a seamless
              review experience
            </li>
          </ul>
        </div>

        <div className="flex gap-3 flex-wrap justify-center">
          <Link
            href="/guide/"
            className="inline-flex items-center px-6 py-2.5 rounded-[10px] text-[0.95rem] font-semibold no-underline bg-linear-to-r from-brand to-brand-dark text-white hover:opacity-90 transition-opacity"
          >
            Get started
          </Link>
          <Link
            href="https://github.com/buzinas/react-trace"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-2.5 gap-2 rounded-[10px] text-[0.95rem] font-semibold no-underline bg-surface text-text-2 border border-border hover:border-brand/40 hover:text-text-1 transition-all"
          >
            <SvgWrapper icon={IconGithub} width={16} height={16} />
            GitHub
          </Link>
        </div>

        <Video demoPoster={demoPoster} demoVideo={demoVideo} />
      </div>
    </section>
  )
}

const features = [
  {
    title: 'Inspect Components',
    description:
      'Hover over any element to identify the React component that rendered it, its props, and the full component tree breadcrumb.',
    color: '#3b82f6',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    title: 'Resolve Source Locations',
    description:
      'Instantly jump from any rendered element to its exact source file and line number using source maps.',
    color: '#22c55e',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="m10 13-2 2 2 2" />
        <path d="m14 17 2-2-2-2" />
      </svg>
    ),
  },
  {
    title: 'Plugin System',
    description:
      'Extend the inspector with plugins for source preview and editing, inline comments, clipboard actions, and editor integration.',
    color: '#a855f7',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m7 2 5 5-5 5" />
        <path d="m17 2 5 5-5 5" />
        <path d="M5 18h14" />
      </svg>
    ),
  },
  {
    title: 'Zero Production Cost',
    description:
      'Every package ships a production stub. Conditional exports resolve to no-ops in production builds — zero runtime overhead.',
    color: '#f59e0b',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
]

function Features() {
  return (
    <section className="max-w-280 mx-auto px-6 py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-(--rp-c-bg-soft) border border-(--rp-c-divider) rounded-xl p-7 transition-colors"
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
              style={{
                background: `color-mix(in srgb, ${f.color} 12%, transparent)`,
                color: f.color,
              }}
            >
              {f.icon}
            </div>
            <h3 className="text-[1.05rem] font-semibold text-text-1 mb-2">
              {f.title}
            </h3>
            <p className="text-sm text-text-2 leading-relaxed">
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

const plugins = [
  {
    slug: 'preview',
    name: 'Preview',
    pkg: '@react-trace/plugin-preview',
    description:
      'Monaco-based source preview with syntax highlighting, inline editing, and project folder access.',
  },
  {
    slug: 'comments',
    name: 'Comments',
    pkg: '@react-trace/plugin-comments',
    description:
      'Collect inline review comments anchored to components, then copy or send them to OpenCode.',
  },
  {
    slug: 'copy-to-clipboard',
    name: 'Copy to Clipboard',
    pkg: '@react-trace/plugin-copy-to-clipboard',
    description:
      'Copy the selected source location as a project-relative path:lineNumber reference.',
  },
  {
    slug: 'open-editor',
    name: 'Open Editor',
    pkg: '@react-trace/plugin-open-editor',
    description:
      'Open the selected source in VS Code, Cursor, Windsurf, Zed, WebStorm, or IntelliJ.',
  },
]

function PluginShowcase() {
  return (
    <section className="max-w-280 mx-auto px-6 pb-16">
      <SectionHeader
        title="Official Plugins"
        subtitle={
          <>
            Everything you need, included in{' '}
            <code className="text-xs text-text-2 bg-bg-mute px-1.5 py-0.5 rounded font-mono">
              @react-trace/kit
            </code>{' '}
            by default.
          </>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {plugins.map((p) => (
          <Link
            key={p.slug}
            href={`/plugins/${p.slug}`}
            className="bg-(--rp-c-bg-soft) border border-(--rp-c-divider) rounded-xl p-6 hover:border-(--rp-c-brand) transition-colors"
          >
            <h3 className="text-[0.95rem] font-semibold text-(--rp-c-text-1) mb-2">
              {p.name}
            </h3>
            <p className="text-[0.85rem] text-(--rp-c-text-2) leading-relaxed mb-3">
              {p.description}
            </p>
            <code className="text-xs text-(--rp-c-text-2) bg-(--rp-c-bg-mute) px-1.5 py-0.5 rounded font-mono">
              {p.pkg}
            </code>
          </Link>
        ))}
      </div>
    </section>
  )
}

const steps = [
  {
    title: 'Install the package',
    code: 'pnpm add -D @react-trace/kit',
    lang: 'bash',
  },
  {
    title: 'Export the project root',
    code: '"dev": "VITE_ROOT=$(pwd) vite"',
    lang: 'json',
  },
  {
    title: 'Add the Trace component',
    code: '<>\n  <App />\n  <Trace root={import.meta.env.VITE_ROOT} />\n</>',
    lang: 'tsx',
  },
]

function QuickStart() {
  return (
    <section className="max-w-280 mx-auto px-6 pb-20">
      <SectionHeader
        title="Get started in 3 steps"
        subtitle="Up and running in under a minute."
      />
      <div className="flex flex-col gap-5 max-w-160 mx-auto">
        {steps.map((s, i) => (
          <div key={s.title} className="flex flex-col">
            <div className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-sm font-bold">
                {i + 1}
              </div>
              <h3 className="text-[0.95rem] font-semibold text-text-1 mt-0.75 mb-2">
                {s.title}
              </h3>
            </div>
            <CodeBlockRuntime lang={s.lang} code={s.code} />
          </div>
        ))}
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="max-w-280 mx-auto px-6 py-8 border-t border-border text-center text-sm text-text-3">
      {'MIT License \u00B7 '}
      <Link
        href="https://github.com/buzinas/react-trace"
        className="text-text-2 no-underline hover:text-text-1 transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub
      </Link>
    </footer>
  )
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle: ReactNode
}) {
  return (
    <div className="text-center mb-10">
      <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] font-bold text-text-1 mb-2.5 tracking-tight">
        {title}
      </h2>
      <p className="text-text-2 text-base">{subtitle}</p>
    </div>
  )
}

export default function HomeLayout() {
  return (
    <>
      <HomeBackground />
      <div className="relative">
        <Hero />
        <Features />
        <PluginShowcase />
        <QuickStart />
        <Footer />
      </div>

      <Trace root={process.env.ROOT!} />
    </>
  )
}
