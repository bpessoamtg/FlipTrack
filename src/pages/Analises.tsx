import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { ChartSkeleton } from '@/components/LoadingSkeleton'
import { EmptyState } from '@/components/EmptyState'
import { useStats } from '@/hooks/useStats'
import { useStore } from '@/store/useStore'
import { formatCurrency } from '@/lib/calculations'

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

export function Analises() {
  const { monthly, bySubcategory, topItems, byPlatform, avgDays } = useStats()
  const isLoading = useStore((s) => s.isLoading)
  const activeCategory = useStore((s) => s.settings.activeCategory)
  const products = useStore((s) => s.products)

  if (!isLoading && products.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <h1 className="text-xl font-bold mb-1">Análises</h1>
        <EmptyState icon="📈" title="Sem dados para analisar" description="Adicione artigos e registe vendas para ver análises detalhadas." />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold">Análises</h1>
        <p className="text-sm text-muted-foreground">Desempenho detalhado do negócio</p>
      </div>

      {/* Receitas vs Custos mensal */}
      <Card>
        <CardHeader><CardTitle>Receitas vs Custos por Mês (€)</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <ChartSkeleton /> : monthly.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Ainda sem vendas</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}€`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="receita" name="Receita" fill="#0f766e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="custo" name="Custo" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Lucro mensal linha */}
      <Card>
        <CardHeader><CardTitle>Evolução do Lucro Mensal (€)</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <ChartSkeleton /> : monthly.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Ainda sem vendas</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}€`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Line type="monotone" dataKey="lucro" stroke="#0f766e" strokeWidth={2} dot={{ r: 3 }} name="Lucro" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Subcategory or top items performance */}
        <Card>
          <CardHeader>
            <CardTitle>{activeCategory === 'baby' ? 'Desempenho por Subcategoria' : 'Top 10 Artigos por Lucro'}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <ChartSkeleton /> : (() => {
              const data = activeCategory === 'baby' ? bySubcategory : topItems.byProfit.slice(0, 10)
              return data.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">Sem dados</p>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(200, data.length * 36)}>
                  <BarChart data={data} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}€`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={150} tickFormatter={(v: string) => truncate(v, 20)} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Bar dataKey="lucro" name="Lucro" fill="#0f766e" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )
            })()}
          </CardContent>
        </Card>

        {/* Melhores plataformas */}
        <Card>
          <CardHeader><CardTitle>Melhores Plataformas (Nº Vendas)</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <ChartSkeleton /> : byPlatform.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Sem dados</p>
            ) : (
              <div className="space-y-2">
                {byPlatform.slice(0, 6).map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-0.5">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-muted-foreground">{p.vendas} venda{p.vendas !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(p.vendas / byPlatform[0].vendas) * 100}%` }} />
                      </div>
                    </div>
                    <span className={`text-xs font-medium w-16 text-right ${p.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(p.lucro)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dias médios por categoria */}
        <Card>
          <CardHeader><CardTitle>Média de Dias para Vender</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <ChartSkeleton /> : avgDays.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Sem dados</p>
            ) : (
              <div className="space-y-3">
                {avgDays.map((d) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{d.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min((d.avgDias / 60) * 100, 100)}%` }} />
                      </div>
                      <span className="text-sm font-semibold w-12 text-right">{d.avgDias}d</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sazonalidade */}
        <Card>
          <CardHeader><CardTitle>Sazonalidade por Categoria</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <ChartSkeleton /> : (() => {
              const byMonth = Array.from({ length: 12 }, (_, i) => {
                const monthStr = String(i + 1).padStart(2, '0')
                const monthName = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][i]
                const baby = products.filter((p) => p.status === 'sold' && p.category === 'baby' && (p.sellDate ?? '').includes(`-${monthStr}-`)).length
                const game = products.filter((p) => p.status === 'sold' && p.category === 'board-game' && (p.sellDate ?? '').includes(`-${monthStr}-`)).length
                return { month: monthName, Bebé: baby, Jogos: game }
              })
              return (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={byMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="Bebé" fill="#0f766e" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Jogos" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
