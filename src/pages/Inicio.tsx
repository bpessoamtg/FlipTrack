import { useState } from 'react'
import { Plus, TrendingUp, TrendingDown, Package, ShoppingBag, Euro } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Card, CardHeader, CardTitle, CardValue, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProductForm } from '@/components/ProductForm'
import { ChartSkeleton, StatsCardSkeleton } from '@/components/LoadingSkeleton'
import { EmptyState } from '@/components/EmptyState'
import { useProducts } from '@/hooks/useProducts'
import { useStats } from '@/hooks/useStats'
import { useStore } from '@/store/useStore'
import { formatCurrency } from '@/lib/calculations'
import { cn } from '@/lib/utils'
import type { Product } from '@/types'

const COLORS = ['#0f766e', '#f59e0b', '#ef4444']
const RADIAN = Math.PI / 180
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: Record<string, number>) => {
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return percent > 0.05 ? (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

export function Inicio() {
  const [formOpen, setFormOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | undefined>()
  const { products, create, update } = useProducts()
  const { stats, monthly, bySubcategory, topItems } = useStats()
  const isLoading = useStore((s) => s.isLoading)
  const activeCategory = useStore((s) => s.settings.activeCategory)
  const catLabel = activeCategory === 'board-game' ? 'Jogos' : 'Bebé'

  const donutData = [
    { name: 'Em Stock', value: stats.inStockCount },
    { name: 'Vendido', value: stats.soldCount },
    { name: 'Devolvido', value: stats.returnedCount },
  ].filter((d) => d.value > 0)

  // For board-games: no notes, so show top 5 individual items by profit
  const subcatOrTopData = activeCategory === 'baby' ? bySubcategory : topItems.byProfit.slice(0, 5)
  const subcatChartTitle = activeCategory === 'baby' ? 'Lucro por Subcategoria' : 'Top 5 Artigos por Lucro'

  const handleSave = async (data: Omit<Product, 'id' | 'createdAt'>) => {
    if (editProduct) await update(editProduct.id, data)
    else await create(data)
    setEditProduct(undefined)
  }

  const statsCards = [
    { label: 'Total Investido', value: formatCurrency(stats.totalInvested), icon: Euro, color: 'text-blue-600' },
    { label: 'Total Receita', value: formatCurrency(stats.totalRevenue), icon: TrendingUp, color: 'text-green-600' },
    { label: 'Lucro Líquido', value: formatCurrency(stats.netProfit), icon: stats.netProfit >= 0 ? TrendingUp : TrendingDown, color: stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600' },
    { label: 'Margem Média', value: `${stats.avgMarginPct.toFixed(1)}%`, icon: TrendingUp, color: 'text-amber-600' },
    { label: 'Artigos em Stock', value: stats.inStockCount, icon: Package, color: 'text-primary' },
    { label: 'Artigos Vendidos', value: stats.soldCount, icon: ShoppingBag, color: 'text-indigo-600' },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Dashboard · {catLabel}</h1>
          <p className="text-sm text-muted-foreground">{products.length} artigos registados</p>
        </div>
        <Button onClick={() => { setEditProduct(undefined); setFormOpen(true) }} className="gap-2">
          <Plus className="h-4 w-4" /> Adicionar
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <StatsCardSkeleton key={i} />)
          : statsCards.map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{label}</CardTitle>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <CardValue>{value}</CardValue>
              </CardHeader>
            </Card>
          ))}
      </div>

      {products.length === 0 && !isLoading ? (
        <EmptyState icon="📊" title="Sem dados para mostrar" description="Adicione o primeiro artigo para começar a ver estatísticas." action={{ label: 'Adicionar Artigo', onClick: () => setFormOpen(true) }} />
      ) : (
        <>
          {/* Monthly profit chart */}
          <Card>
            <CardHeader>
              <CardTitle>Lucro Mensal (€)</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <ChartSkeleton /> : monthly.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Ainda sem vendas registadas</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={monthly} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}€`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Line type="monotone" dataKey="lucro" stroke="#0f766e" strokeWidth={2} dot={{ r: 3 }} name="Lucro" />
                    <Line type="monotone" dataKey="receita" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Receita" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Subcategory/Top items + Donut */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>{subcatChartTitle}</CardTitle></CardHeader>
              <CardContent>
                {isLoading ? <ChartSkeleton /> : subcatOrTopData.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">Sem vendas</p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={subcatOrTopData} layout="vertical" margin={{ left: 0, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}€`} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={150} tickFormatter={(v: string) => truncate(v, 20)} />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Bar dataKey="lucro" fill="#0f766e" radius={[0, 4, 4, 0]} name="Lucro" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Estado do Stock</CardTitle></CardHeader>
              <CardContent>
                {isLoading ? <ChartSkeleton /> : donutData.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">Sem dados</p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" labelLine={false} label={renderLabel}>
                        {donutData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top 3 rankings */}
          {topItems.byQuantity.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle>Top 3 — Mais Vendidos</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topItems.byQuantity.slice(0, 3).map((item, i) => (
                      <div key={item.name + i} className="flex items-center gap-3">
                        <span className={cn('text-base font-bold w-5 text-center', i === 0 ? 'text-amber-500' : 'text-muted-foreground')}>{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.count}x vendido</p>
                        </div>
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400 shrink-0">+{formatCurrency(item.lucro)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Top 3 — Mais Lucrativos</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topItems.byProfit.slice(0, 3).map((item, i) => (
                      <div key={item.name + i} className="flex items-center gap-3">
                        <span className={cn('text-base font-bold w-5 text-center', i === 0 ? 'text-amber-500' : 'text-muted-foreground')}>{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.count}x vendido</p>
                        </div>
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400 shrink-0">+{formatCurrency(item.lucro)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {/* FAB mobile */}
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
