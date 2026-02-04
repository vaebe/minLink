import { LucideIcon } from 'lucide-react'

interface DataListItem {
  name: string
  count: number
}

interface DataListProps {
  items: DataListItem[]
  icon: LucideIcon
  label: string
  emptyMessage?: string
}

export function DataList({
  items,
  icon: Icon,
  label,
  emptyMessage = '暂无数据',
}: DataListProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      <div className="space-y-2 mt-2">
        {items.length > 0 ? (
          items.map(({ name, count }) => (
            <div
              key={name}
              className="flex items-center justify-between text-sm"
            >
              <span className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="truncate max-w-45" title={name}>
                  {name}
                </span>
              </span>
              <span className="font-mono font-medium">{count}</span>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">{emptyMessage}</div>
        )}
      </div>
    </div>
  )
}
