type VideoProps = {
  demoPoster: string
  demoVideo: string
}

export function Video({ demoPoster, demoVideo }: VideoProps) {
  return (
    <div className="w-full max-w-200 mt-12 rounded-xl overflow-hidden border border-border bg-surface">
      <div className="aspect-1380/1080 flex items-center justify-center text-text-3 text-sm">
        <video autoPlay muted loop poster={demoPoster}>
          <source src={demoVideo} type="video/mp4" />
        </video>
      </div>
    </div>
  )
}
