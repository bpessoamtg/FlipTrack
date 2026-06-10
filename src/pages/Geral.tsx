import { useMemo } from 'react'
import { Gamepad2, Baby, TrendingUp, TrendingDown } from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { ChartSkeleton } from '@/components/LoadingSkeleton'
import { useGlobalStats } from '@/hooks/useStats'
import { useStore } from '@/store/useStore'
import { formatCurrency, computeCombinedMonthlyStats } from '@/lib/calculations'
import type { Stats } from '@/types'

function StatRow({ label, value, profit }: { label: string; value: string; profit?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold ${profit !== undefined ? (profit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400') : ''}`}>{value}</span>
    </div>
  )
}

function CategoryCard({ title, icon: Icon, color, stats }: { title: string; icon: typeof Gamepad2; color: string; stats: Stats }) {
  const profitPositive = stats.netProfit >= 0
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-1">
          <Icon className={`h-4 w-4 ${color}`} />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <StatRow label="Investido" value={formatCurrency(stats.totalInvested)} />
        <StatRow label="Receita" value={formatCurrency(stats.totalRevenue)} />
        <StatRow label="Lucro Líquido" value={formatCurrency(stats.netProfit)} profit={profitPositive} />
        <StatRow label="Margem Média" value={`${stats.avgMarginPct.toFixed(1)}%`} />
        <div className="flex gap-6 pt-3 mt-1">
          <div>
            <p className="text-xl font-bold">{stats.soldCount}</p>
            <p className="text-xs text-muted-foreground">Vendidos</p>
          </div>
          <div>
            <p className="text-xl font-bold">{stats.inStockCount}</p>
            <p className="text-xs text-muted-foreground">Em Stock</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function Geral() {
  const { boardGameStats, babyStats, boardGameProducts, babyProducts } = useGlobalStats()
  const isLoading = useStore((s) => s.isLoading)
  const allProducts = useStore((s) => s.products)

  const combinedMonthly = useMemo(
    () => computeCombinedMonthlyStats(boardGameProducts, babyProducts),
    [boardGameProducts, babyProducts],
  )

  const comparisonData = [
    { categoria: 'Jogos', receita: boardGameStats.totalRevenue, lucro: boardGameStats.netProfit },
    { categoria: 'Bebé', receita: babyStats.totalRevenue, lucro: babyStats.netProfit },
  ]

  const totalRevenue = boardGameStats.totalRevenue + babyStats.totalRevenue
  const totalProfit = boardGameStats.netProfit + babyStats.netProfit
  const ProfitIcon = totalProfit >= 0 ? TrendingUp : TrendingDown

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">Visão Geral</h1>
          <p className="text-sm text-muted-foreground">{allProducts.length} artigos no total</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <ProfitIcon className={`h-4 w-4 ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            <span className={`text-lg font-bold ${totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(totalProfit)}</span>
          </div>
          <p className="text-xs text-muted-foreground">lucro total · {formatCurrency(totalRevenue)} receita</p>
        </div>
      </div>

      {/* Category comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        <CategoryCard title="Jogos de Tabuleiro" icon={Gamepad2} color="text-primary" stats={boardGameStats} />
        <CategoryCard title="Artigos de Bebé" icon={Baby} color="text-amber-500" stats={babyStats} />
      </div>

      {/* Receita & Lucro comparison bar chart */}
      <Card>
        <CardHeader><CardTitle>Receita & Lucro por Categoria</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={comparisonData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="categoria" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}€`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="receita" name="Receita" fill="#0f766e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lucro" name="Lucro" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Combined monthly profit */}
      <Card>
        <CardHeader><CardTitle>Lucro Mensal: Jogos vs Bebé</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <ChartSkeleton /> : combinedMonthly.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Ainda sem vendas registadas</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={combinedMonthly} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}€`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="jogos" stroke="#0f766e" strokeWidth={2} dot={{ r: 3 }} name="Jogos" />
                <Line type="monotone" dataKey="bebe" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Bebé" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
