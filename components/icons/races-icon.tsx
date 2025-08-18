interface RacesIconProps {
  className?: string
  width?: number
  height?: number
}

export default function RacesIcon({ className = "", width = 64, height = 64 }: RacesIconProps) {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Calendar Base */}
      <rect 
        x="14" 
        y="18" 
        width="36" 
        height="32" 
        rx="2" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Calendar Header */}
      <rect 
        x="14" 
        y="18" 
        width="36" 
        height="8" 
        rx="2" 
        fill="currentColor" 
        opacity="0.1"
      />
      <line 
        x1="14" 
        y1="26" 
        x2="50" 
        y2="26" 
        stroke="currentColor" 
        strokeWidth="2.5"
      />
      
      {/* Calendar Rings */}
      <rect 
        x="20" 
        y="12" 
        width="2" 
        height="8" 
        rx="1" 
        stroke="currentColor" 
        strokeWidth="2.5"
      />
      <rect 
        x="42" 
        y="12" 
        width="2" 
        height="8" 
        rx="1" 
        stroke="currentColor" 
        strokeWidth="2.5"
      />
      
      {/* Calendar Days */}
      <circle 
        cx="22" 
        cy="34" 
        r="2" 
        fill="currentColor" 
        opacity="0.3"
      />
      <circle 
        cx="32" 
        cy="34" 
        r="2" 
        fill="currentColor" 
        opacity="0.3"
      />
      <circle 
        cx="42" 
        cy="34" 
        r="2" 
        fill="currentColor" 
        opacity="0.3"
      />
      
      <circle 
        cx="22" 
        cy="42" 
        r="2" 
        fill="currentColor" 
        opacity="0.3"
      />
      <circle 
        cx="32" 
        cy="42" 
        r="2" 
        fill="currentColor"
      />
      <circle 
        cx="42" 
        cy="42" 
        r="2" 
        fill="currentColor" 
        opacity="0.3"
      />
    </svg>
  )
}