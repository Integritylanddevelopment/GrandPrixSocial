interface ShopIconProps {
  className?: string
  width?: number
  height?: number
}

export default function ShopIcon({ className = "", width = 64, height = 64 }: ShopIconProps) {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M16 20H48L45 48H19L16 20Z" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M24 24V20C24 15.5817 27.5817 12 32 12C36.4183 12 40 15.5817 40 20V24" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <text 
        x="32" 
        y="36" 
        textAnchor="middle" 
        fill="currentColor" 
        fontFamily="Arial, sans-serif"
        fontSize="10"
        fontWeight="bold"
      >
        F1
      </text>
    </svg>
  )
}