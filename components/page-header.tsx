interface PageHeaderProps {
  title: string
  description: string
  children?: React.ReactNode
  gradient?: boolean
}

export function PageHeader({ title, description, children, gradient = false }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-border/40">
      <div className="">
        <h1 className={`text-3xl font-bold tracking-tight mb-1 ${gradient ? 'bg-clip-text text-transparent bg-linear-to-r from-primary to-primary/60' : ''}`}>
          {title}
        </h1>
        <p className="text-muted-foreground">
          {description}
        </p>
      </div>
      {children && (
        <div className="flex items-center gap-3">
          {children}
        </div>
      )}
    </div>
  )
}