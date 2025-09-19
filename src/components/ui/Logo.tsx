interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 40, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#e0e7ff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="reflectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
        </linearGradient>
        <filter id="glassBlur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1"/>
        </filter>
      </defs>
      
      {/* Central column with Ionic capital */}
      <g>
        {/* Ionic capital with volutes */}
        <path
          d="M45 20 L50 15 L55 20 L55 25 L50 30 L45 25 Z"
          fill="url(#glassGradient)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.5"
        />
        
        {/* Volutes (scrolls) */}
        <path
          d="M42 18 Q45 16 48 18 Q45 20 42 18"
          fill="url(#glassGradient)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.5"
        />
        <path
          d="M58 18 Q55 16 52 18 Q55 20 58 18"
          fill="url(#glassGradient)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.5"
        />
        
        {/* Fluted column shaft */}
        <rect
          x="47"
          y="25"
          width="6"
          height="40"
          fill="url(#glassGradient)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.5"
        />
        
        {/* Flute lines */}
        <line x1="48" y1="25" x2="48" y2="65" stroke="rgba(255,255,255,0.2)" strokeWidth="0.3"/>
        <line x1="52" y1="25" x2="52" y2="65" stroke="rgba(255,255,255,0.2)" strokeWidth="0.3"/>
        
        {/* Fountain pen nib base */}
        <path
          d="M50 65 L45 75 L50 80 L55 75 Z"
          fill="url(#glassGradient)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.5"
        />
        
        {/* Pen nib slit */}
        <line x1="50" y1="65" x2="50" y2="75" stroke="rgba(0,0,0,0.3)" strokeWidth="0.8"/>
        
        {/* Pen nib breather hole */}
        <circle cx="50" cy="70" r="1.5" fill="rgba(0,0,0,0.4)"/>
      </g>
      
      {/* Horizontal beam */}
      <rect
        x="20"
        y="30"
        width="60"
        height="3"
        fill="url(#glassGradient)"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="0.5"
        rx="1.5"
      />
      
      {/* Left scale pan */}
      <g transform="translate(15, 35)">
        <path
          d="M0 0 L15 0 L12 8 L3 8 Z"
          fill="url(#glassGradient)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.5"
        />
        {/* Suspension chains */}
        <line x1="7.5" y1="-2" x2="7.5" y2="0" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
        <line x1="7.5" y1="-2" x2="25" y2="30" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
      </g>
      
      {/* Right scale pan */}
      <g transform="translate(70, 35)">
        <path
          d="M0 0 L15 0 L12 8 L3 8 Z"
          fill="url(#glassGradient)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.5"
        />
        {/* Suspension chains */}
        <line x1="7.5" y1="-2" x2="7.5" y2="0" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
        <line x1="7.5" y1="-2" x2="75" y2="30" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
      </g>
      
      {/* Glass reflection highlights */}
      <path
        d="M45 20 L50 15 L55 20 L55 25 L50 30 L45 25 Z"
        fill="url(#reflectionGradient)"
        opacity="0.6"
      />
      <rect
        x="47"
        y="25"
        width="2"
        height="40"
        fill="url(#reflectionGradient)"
        opacity="0.4"
      />
    </svg>
  )
}
