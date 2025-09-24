interface FooterProps {
  className?: string
  absolute?: boolean
}

export function Footer({ className = '', absolute = false }: FooterProps) {
  const footerClasses = absolute 
    ? `absolute bottom-0 left-0 right-0 py-4 bg-slate-900 ${className}`
    : `py-4 bg-slate-900 ${className}`

  return (
    <footer className={footerClasses}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-2">
          <div className="text-white text-sm">
            LexAgenda v2.0.0 - Created by Abruzzo.AI
          </div>
          <div className="text-white text-xs opacity-75">
            Copyright 2025
          </div>
          <div className="mt-2">
            <img 
              src="/Marchio AbruzzoAI.png" 
              alt="Abruzzo.AI" 
              className="h-8 w-auto"
            />
          </div>
        </div>
      </div>
    </footer>
  )
}
