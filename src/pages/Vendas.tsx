import { useState, useMemo } from 'react'
import { Download, Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/EmptyState'
import { ProductForm } from '@/components/ProductForm'
import { ConfirmDialog } from '@/components/ui/Dialog'
import { useProducts } from '@/hooks/useProducts'
import { useStore } from '@/store/useStore'
import { formatCurrency, calcProfit, calcMarginPct, calcDaysInStock, categoryLabel, conditionLabel, isChristmasSeason } from '@/lib/calculations'
import { exportToCSV } from '@/lib/exportUtils'
import type { Product } from '@/types'
import { cn } from '@/lib/utils'
import { Edit2, Trash2 } from 'lucide-react'

export function Vendas() {
  const { products, update, remove } = useProducts()
  const isLoading = useStore((s) => s.isLoading)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [platFilter, setPlatFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [editProduct, setEditProduct] = useState<Product | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const sold = products.filter((p) => p.status === 'sold')
  const platforms = [...new Set(sold.map((p) => p.platform))].sort()

  const filtered = useMemo(() => {
    let list = sold
    if (search) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    if (catFilter) list = list.filter((p) => p.category === catFilter)
    if (platFilter) list = list.filter((p) => p.platform === platFilter)
    if (fromDate) list = list.filter((p) => (p.sellDate ?? p.buyDate) >= fromDate)
    if (toDate) list = list.filter((p) => (p.sellDate ?? p.buyDate) <= toDate)
    return list.sort((a, b) => (b.sellDate ?? b.buyDate).localeCompare(a.sellDate ?? a.buyDate))
  }, [sold, search, catFilter, platFilter, fromDate, toDate])

  const totalProfit = filtered.reduce((s, p) => s + ((p.sellPrice ?? 0) - p.buyPrice), 0)

  const handleSave = async (data: Omit<Product, 'id' | 'createdAt'>) => {
    if (editProduct) await update(editProduct.id, data)
    setEditProduct(undefined)
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Histórico de Vendas</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} vendas · Lucro total: <span className={totalProfit >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{formatCurrency(totalProfit)}</span></p>
        </div>
        <Button variant="outline" size="sm" onClick={() => exportToCSV(filtered, 'fliptrack-vendas')}>
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <div className="col-span-2 md:col-span-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Pesquisar..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="">Todas as categorias</option>
          <option value="baby">🍼 Bebé</option>
          <option value="board-game">🎲 Jogos</option>
          <option value="other">📦 Outros</option>
        </Select>
        <Select value={platFilter} onChange={(e) => setPlatFilter(e.target.value)}>
          <option value="">Qualquer plataforma</option>
          {platforms.map((p) => <option key={p}>{p}</option>)}
        </Select>
        <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} placeholder="De" />
        <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} placeholder="Até" />
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🛒" title="Sem vendas" description="Ainda não há vendas registadas com os filtros actuais." />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Artigo</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Compra</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Venda</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Lucro</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Plataforma</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Data</th>
                <th className="px-2 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => {
                const profit = calcProfit(p.buyPrice, p.sellPrice) ?? 0
                const margin = calcMarginPct(p.buyPrice, p.sellPrice)
                const days = calcDaysInStock(p.buyDate, p.sellDate)
                return (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{p.category === 'baby' ? '🍼' : p.category === 'board-game' ? '🎲' : '📦'}</span>
                        <div>
                          <p className="font-medium line-clamp-1">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{conditionLabel(p.condition)} · {days}d</p>
                        </div>
                        {isChristmasSeason(p.buyDate) && <span className="text-xs">🎄</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">{formatCurrency(p.buyPrice)}</td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">{p.sellPrice ? formatCurrency(p.sellPrice) : '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className={cn('font-semibold', profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
                        {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                      </div>
                      <div className="text-xs text-muted-foreground">{margin !== null ? `${margin >= 0 ? '+' : ''}${margin.toFixed(1)}%` : '—'}</div>
                    </td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell">
                      <Badge variant="secondary">{p.platform}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-muted-foreground hidden lg:table-cell">
                      {p.sellDate ?? '—'}
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditProduct(p); setFormOpen(true) }} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setDeleteId(p.id)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-red-600 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <ProductForm open={formOpen} onClose={() => { setFormOpen(false); setEditProduct(undefined) }} onSave={handleSave} initial={editProduct} />
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove(deleteId)}
        title="Eliminar venda"
        description="Tem a certeza que quer eliminar este registo? Esta acção não pode ser desfeita."
        confirmLabel="Eliminar"
      />
    </div>
  )
}
