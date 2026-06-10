import { cn } from '@/lib/utils'

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-muted', className)} />
}

export function StatsCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-2">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-8 w-36" />
    </div>
  )
}

export function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <Skeleton className="h-4 w-40 mb-4" />
      <Skeleton style={{ height }} />
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-3 w-16" />
    </div>
  )
}
