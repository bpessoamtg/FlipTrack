import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/Dialog'
import { Edit2, Trash2 } from 'lucide-react'
import type { Product } from '@/types'
import { calcDaysInStock, calcProfit, calcMarginPct, isChristmasSeason, categoryLabel, conditionLabel, statusLabel, formatCurrency } from '@/lib/calculations'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  onEdit: (p: Product) => void
  onDelete: (id: string) => void
}

const categoryIcons: Record<string, string> = { baby: '🍼', 'board-game': '🎲', other: '📦' }

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'secondary'> = {
  'in-stock': 'secondary',
  sold: 'success',
  returned: 'danger',
}

export function ProductCard({ product: p, onEdit, onDelete }: ProductCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const days = calcDaysInStock(p.buyDate, p.sellDate)
  const profit = calcProfit(p.buyPrice, p.sellPrice)
  const margin = calcMarginPct(p.buyPrice, p.sellPrice)
  const christmas = isChristmasSeason(p.buyDate)

  return (
    <>
      <Card className="p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{p.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{conditionLabel(p.condition)}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {christmas && <span title="Época de Natal">🎄</span>}
            <span title={categoryLabel(p.category)}>{categoryIcons[p.category]}</span>
            <Badge variant={statusVariant[p.status]}>{statusLabel(p.status)}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Compra</p>
            <p className="font-semibold">{formatCurrency(p.buyPrice)}</p>
          </div>
          {p.sellPrice != null ? (
            <div>
              <p className="text-xs text-muted-foreground">Venda</p>
              <p className="font-semibold">{formatCurrency(p.sellPrice)}</p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-muted-foreground">Dias em stock</p>
              <p className="font-semibold">{days}d</p>
            </div>
          )}
        </div>

        {profit != null && (
          <div className={cn('text-xs font-medium rounded-md px-2 py-1', profit >= 0 ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400')}>
            {profit >= 0 ? '▲' : '▼'} {formatCurrency(profit)} ({margin! >= 0 ? '+' : ''}{margin!.toFixed(1)}%)
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">{p.platform}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(p)}>
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => onDelete(p.id)}
        title="Eliminar artigo"
        description={`Tem a certeza que quer eliminar "${p.name}"? Esta acção não pode ser desfeita.`}
        confirmLabel="Eliminar"
      />
    </>
  )
}
