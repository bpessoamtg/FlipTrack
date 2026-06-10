import { Button } from '@/components/ui/Button'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon = '📦', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 text-5xl">{icon}</div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-xs mb-4">{description}</p>}
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  )
}
