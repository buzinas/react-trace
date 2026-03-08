import { useId } from 'react'

export function Logo({
  bgColor,
  size = 16,
}: {
  bgColor?: string
  size?: number
}) {
  const linear1 = useId()
  const linear2 = useId()
  const linear3 = useId()

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="12 16 132 130"
      fill="none"
      width={size}
      height={size}
    >
      <defs>
        <linearGradient id={linear1} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2196f3" />
          <stop offset="100%" stopColor="#345580" />
        </linearGradient>
        <linearGradient
          id={linear2}
          href={`#${linear1}`}
          x1="100%"
          y1="0%"
          x2="0%"
          y2="0%"
        />
        <linearGradient id={linear3} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4dabf5" />
          <stop offset="50%" stopColor="#58a0c3" />
          <stop offset="100%" stopColor="#4dabf5" />
        </linearGradient>
      </defs>
      <g
        transform="matrix(5.5 0 0 5.5 75 75)"
        stroke={`url(#${linear3})`}
        strokeWidth="1.5"
      >
        <circle r="2" fill={`url(#${linear3})`} />
        <ellipse rx="10" ry="4.5" />
        <ellipse rx="10" ry="4.5" transform="rotate(60)" />
        <ellipse rx="10" ry="4.5" transform="rotate(120)" />
      </g>
      <circle cx="95" cy="95" r="38" fill={bgColor || '#18181b'} />
      <g transform="matrix(3.2 0 0 3.2 70 70)">
        <circle cx="8" cy="8" r="8" fill="#fff" />
        <circle cx="8" cy="8" r="8" fill={`url(#${linear1})`} opacity=".8" />
        <path
          stroke={`url(#${linear2})`}
          strokeWidth="4"
          strokeLinecap="round"
          d="M14 14l6 6"
        />
        <circle
          cx="8"
          cy="8"
          r="8"
          stroke={`url(#${linear1})`}
          strokeWidth="3"
        />
        <path
          d="M6 5.5L4 8l2 2.5M10 10.5L12 8l-2-2.5"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}
