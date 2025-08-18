interface CafeIconProps {
  className?: string
  width?: number
  height?: number
}

export default function CafeIcon({ className = "", width = 64, height = 64 }: CafeIconProps) {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Coffee Cup Base */}
      <path 
        d="M12 24C12 22.8954 12.8954 22 14 22H38C39.1046 22 40 22.8954 40 24V38C40 44.6274 34.6274 50 28 50H24C17.3726 50 12 44.6274 12 38V24Z" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Coffee Cup Handle */}
      <path 
        d="M40 28H44C47.3137 28 50 30.6863 50 34V34C50 37.3137 47.3137 40 44 40H40" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Coffee Steam Lines */}
      <path 
        d="M20 16V12" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round"
      />
      <path 
        d="M26 16V12" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round"
      />
      <path 
        d="M32 16V12" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round"
      />
      
      {/* Saucer */}
      <ellipse 
        cx="26" 
        cy="52" 
        rx="16" 
        ry="3" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  )
}