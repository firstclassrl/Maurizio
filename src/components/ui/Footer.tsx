interface FooterProps {
  className?: string
  absolute?: boolean
}

export function Footer({ className = '', absolute = false }: FooterProps) {
  const footerClasses = absolute 
    ? `absolute bottom-0 left-0 right-0 py-3 bg-slate-900 ${className}`
    : `py-3 bg-slate-900 ${className}`

  return (
    <footer className={footerClasses}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm">LexAgenda v3.2.2-beta - Created by</span>
            <span className="text-white text-sm">Abruzzo.AI</span>
            <img 
              src="/Marchio AbruzzoAI.png" 
              alt="Abruzzo.AI" 
              className="h-5 w-auto"
            />
          </div>
          <div className="text-white text-xs opacity-75">
            Copyright 2025
          </div>
        </div>
      </div>
    </footer>
  )
}
