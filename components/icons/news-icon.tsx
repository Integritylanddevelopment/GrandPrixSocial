interface NewsIconProps {
  className?: string
  width?: number
  height?: number
}

export default function NewsIcon({ className = "", width = 64, height = 64 }: NewsIconProps) {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect 
        x="12" 
        y="16" 
        width="40" 
        height="36" 
        rx="2" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <rect 
        x="16" 
        y="20" 
        width="24" 
        height="8" 
        rx="1" 
        stroke="currentColor" 
        strokeWidth="2.5"
      />
      <line 
        x1="16" 
        y1="32" 
        x2="48" 
        y2="32" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round"
      />
      <line 
        x1="16" 
        y1="36" 
        x2="40" 
        y2="36" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round"
      />
      <line 
        x1="16" 
        y1="40" 
        x2="44" 
        y2="40" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round"
      />
      <line 
        x1="16" 
        y1="44" 
        x2="36" 
        y2="44" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round"
      />
    </svg>
  )
}