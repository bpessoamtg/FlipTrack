import { useState, useMemo } from 'react'
import { Plus, Search, SlidersHorizontal } from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import { ProductForm } from '@/components/ProductForm'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/EmptyState'
import { ProductCardSkeleton } from '@/components/LoadingSkeleton'
import { useProducts } from '@/hooks/useProducts'
import { useStore } from '@/store/useStore'
import type { Product } from '@/types'
import { calcDaysInStock, calcMarginPct } from '@/lib/calculations'

type SortKey = 'buyDate' | 'buyPrice' | 'margin' | 'days'

export function Inventario() {
  const { products, create, update, remove } = useProducts()
  const isLoading = useStore((s) => s.isLoading)
  const [formOpen, setFormOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | undefined>()
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [condFilter, setCondFilter] = useState('')
  const [platFilter, setPlatFilter] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('buyDate')
  const [showFilters, setShowFilters] = useState(false)

  const inStock = products.filter((p) => p.status === 'in-stock')
  const platforms = [...new Set(inStock.map((p) => p.platform))].sort()

  const filtered = useMemo(() => {
    let list = inStock
    if (search) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    if (catFilter) list = list.filter((p) => p.category === catFilter)
    if (condFilter) list = list.filter((p) => p.condition === condFilter)
    if (platFilter) list = list.filter((p) => p.platform === platFilter)

    return list.sort((a, b) => {
      if (sortKey === 'buyPrice') return b.buyPrice - a.buyPrice
      if (sortKey === 'margin') return (calcMarginPct(a.buyPrice, a.sellPrice) ?? -Infinity) - (calcMarginPct(b.buyPrice, b.sellPrice) ?? -Infinity)
      if (sortKey === 'days') return calcDaysInStock(b.buyDate) - calcDaysInStock(a.buyDate)
      return b.buyDate.localeCompare(a.buyDate)
    })
  }, [inStock, search, catFilter, condFilter, platFilter, sortKey])

  const handleSave = async (data: Omit<Product, 'id' | 'createdAt'>) => {
    if (editProduct) await update(editProduct.id, data)
    else await create(data)
    setEditProduct(undefined)
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Inventário</h1>
          <p className="text-sm text-muted-foreground">{inStock.length} artigos em stock</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setShowFilters((v) => !v)}>
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button onClick={() => { setEditProduct(undefined); setFormOpen(true) }}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Adicionar</span>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Pesquisar artigos..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 rounded-lg bg-muted/40 border border-border">
          <Select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
            <option value="">Todas as categorias</option>
            <option value="baby">🍼 Bebé</option>
            <option value="board-game">🎲 Jogos</option>
            <option value="other">📦 Outros</option>
          </Select>
          <Select value={condFilter} onChange={(e) => setCondFilter(e.target.value)}>
            <option value="">Qualquer condição</option>
            <option value="new">Novo</option>
            <option value="used-like-new">Como Novo</option>
            <option value="used-good">Bom Estado</option>
            <option value="used-fair">Estado Razoável</option>
          </Select>
          <Select value={platFilter} onChange={(e) => setPlatFilter(e.target.value)}>
            <option value="">Qualquer plataforma</option>
            {platforms.map((p) => <option key={p}>{p}</option>)}
          </Select>
          <Select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
            <option value="buyDate">Ordenar: Data</option>
            <option value="buyPrice">Ordenar: Preço</option>
            <option value="days">Ordenar: Dias em stock</option>
          </Select>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📦"
          title={search || catFilter ? 'Sem resultados' : 'Stock vazio'}
          description={search || catFilter ? 'Tente ajustar os filtros.' : 'Adicione o primeiro artigo ao inventário.'}
          action={(!search && !catFilter) ? { label: 'Adicionar Artigo', onClick: () => setFormOpen(true) } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} onEdit={(p) => { setEditProduct(p); setFormOpen(true) }} onDelete={remove} />
          ))}
        </div>
      )}

      <button
        onClick={() => { setEditProduct(undefined); setFormOpen(true) }}
        className="md:hidden fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
      >
        <Plus className="h-6 w-6" />
      </button>

      <ProductForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} initial={editProduct} />
    </div>
  )
}
