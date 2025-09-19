interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 40, className = '' }: LogoProps) {
  return (
    <img
      src="/logo studio legale maurizio.png"
      alt="Studio Legale Maurizio"
      width={size}
      height={size}
      className={`object-contain ${className}`}
    />
  )
}
