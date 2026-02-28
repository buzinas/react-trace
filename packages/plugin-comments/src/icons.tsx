export function ChatBubbleIcon({ size = 13 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 13 13"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M11 1H2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2l2 3 2-3h3a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function TrashIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 3.5h9M5 3.5V2.5h3v1M4 3.5l.5 7h4l.5-7"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ClipboardIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="1"
        width="8"
        height="10"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M4 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function OpencodeIcon({ size = 13 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path fill="#131010" d="M0 0h512v512H0z" />
      <path d="M320 224v128H192V224h128z" fill="#5A5858" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M384 416H128V96h256v320zm-64-256H192v192h128V160z"
        fill="#fff"
      />
    </svg>
  )
}

export function XIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}
