import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const supabase = createClient(
  'https://lirymmdwezuhmybkmbii.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpcnltbWR3ZXp1aG15YmttYmlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwODQ2MTYsImV4cCI6MjA5NjY2MDYxNn0.lSD3VBG1q-2xJ3wxgW6RakSTJ27sp7YrqMMJtSkcFqE'
)

function toIso(s) {
  if (!s || !s.trim()) return null
  const [d, m, y] = s.trim().split('-')
  return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`
}

// Apagar todos os artigos de bebé existentes
console.log('🗑️  A apagar artigos de bebé antigos...')
const { error: delError, count } = await supabase
  .from('products')
  .delete()
  .eq('category', 'baby')

if (delError) { console.error('❌ Erro ao apagar:', delError.message); process.exit(1) }
console.log(`✓ Artigos antigos apagados\n`)

// Novos artigos com datas e subcategorias
const raw = [
  { name: 'Bolsa pequena preta vichy',       sub: 'Bolsas/mochilas Walking Mum',      buy: 6.24,  sell: 18.00, buyDate: '09-11-2025', sellDate: '21-02-2026' },
  { name: 'Colchão preto vichy',             sub: 'Bolsas/mochilas Walking Mum',      buy: 3.00,  sell: 6.50,  buyDate: '16-01-2026', sellDate: '21-02-2026' },
  { name: 'Bolsa grande preta vichy',        sub: 'Bolsas/mochilas Walking Mum',      buy: 6.39,  sell: 15.00, buyDate: '07-04-2026', sellDate: '27-04-2026' },
  { name: 'Bolsa grande verde vichy',        sub: 'Bolsas/mochilas Walking Mum',      buy: 11.25, sell: null,  buyDate: '25-01-2026', sellDate: null },
  { name: 'Bolsa pequena verde tulum',       sub: 'Bolsas/mochilas Walking Mum',      buy: 8.19,  sell: 20.00, buyDate: '09-05-2026', sellDate: '28-05-2026' },
  { name: 'Bolsa pequena verde vichy',       sub: 'Bolsas/mochilas Walking Mum',      buy: 8.72,  sell: null,  buyDate: '13-05-2026', sellDate: null },
  { name: 'Bolsa pequena verde vichy',       sub: 'Bolsas/mochilas Walking Mum',      buy: 8.72,  sell: 18.00, buyDate: '25-04-2026', sellDate: '12-05-2026' },
  { name: 'Bolsa pequena verde vichy',       sub: 'Bolsas/mochilas Walking Mum',      buy: 6.44,  sell: 14.00, buyDate: '07-03-2026', sellDate: '27-03-2026' },
  { name: 'Bolsa pequena verde vichy',       sub: 'Bolsas/mochilas Walking Mum',      buy: 8.08,  sell: 17.50, buyDate: '17-01-2026', sellDate: '02-05-2026' },
  { name: 'Bolsa pequena verde vichy',       sub: 'Bolsas/mochilas Walking Mum',      buy: 9.00,  sell: 15.00, buyDate: '19-10-2025', sellDate: '24-01-2026' },
  { name: 'Lancheira preta vichy',           sub: 'Bolsas/mochilas Walking Mum',      buy: 5.00,  sell: 9.00,  buyDate: '12-03-2026', sellDate: '19-05-2026' },
  { name: 'Mesa atividades forest friends',  sub: 'Mesas atividades Little Dutch',    buy: 14.95, sell: 30.00, buyDate: '20-12-2025', sellDate: '18-02-2026' },
  { name: 'Mesa atividades sailors bay',     sub: 'Mesas atividades Little Dutch',    buy: 17.68, sell: 35.00, buyDate: '14-04-2026', sellDate: '30-04-2026' },
  { name: 'Mesa atividades sailors bay',     sub: 'Mesas atividades Little Dutch',    buy: 14.99, sell: 33.00, buyDate: '07-10-2025', sellDate: '15-12-2025' },
  { name: 'Mesa atividades sailors bay',     sub: 'Mesas atividades Little Dutch',    buy: 21.25, sell: 32.00, buyDate: '06-10-2025', sellDate: '23-02-2026' },
  { name: 'Mobile mar',                      sub: 'Mobiles Little Dutch',             buy: 10.79, sell: 32.00, buyDate: '25-01-2026', sellDate: '04-05-2026' },
  { name: 'Mobile mar',                      sub: 'Mobiles Little Dutch',             buy: 11.84, sell: 32.00, buyDate: '06-12-2025', sellDate: '08-12-2025' },
  { name: 'Mobile sailors bay',              sub: 'Mobiles Little Dutch',             buy: 15.45, sell: 26.50, buyDate: '04-12-2025', sellDate: '27-12-2025' },
  { name: 'Mobile mar',                      sub: 'Mobiles Little Dutch',             buy: 13.94, sell: 25.00, buyDate: '24-09-2025', sellDate: '03-12-2025' },
  { name: 'Mobile mar c/ caixa',             sub: 'Mobiles Little Dutch',             buy: 11.84, sell: null,  buyDate: '18-04-2026', sellDate: null },
  { name: 'Mobile sailors bay',              sub: 'Mobiles Little Dutch',             buy: 12.95, sell: null,  buyDate: '10-05-2026', sellDate: null },
  { name: 'Mobile sailors bay c/ caixa',     sub: 'Mobiles Little Dutch',             buy: 15.05, sell: 35.00, buyDate: '25-04-2026', sellDate: '09-06-2026' },
  { name: 'Mochila preta vichy',             sub: 'Bolsas/mochilas Walking Mum',      buy: 18.45, sell: 33.00, buyDate: '12-03-2026', sellDate: '19-05-2026' },
  { name: 'Mochila preta vichy',             sub: 'Bolsas/mochilas Walking Mum',      buy: 18.69, sell: 30.00, buyDate: '16-01-2026', sellDate: '05-03-2026' },
  { name: 'Mochila preta vichy',             sub: 'Bolsas/mochilas Walking Mum',      buy: 15.06, sell: 32.14, buyDate: '19-05-2026', sellDate: '28-03-2026' },
  { name: 'Mochila preta vichy',             sub: 'Bolsas/mochilas Walking Mum',      buy: 0.00,  sell: 25.00, buyDate: '14-11-2025', sellDate: '18-01-2026' },
  { name: 'Mochila verde pintas',            sub: 'Bolsas/mochilas Walking Mum',      buy: 17.45, sell: 40.00, buyDate: '19-05-2026', sellDate: '02-06-2026' },
  { name: 'Mochila verde vichy',             sub: 'Bolsas/mochilas Walking Mum',      buy: 25.97, sell: 38.00, buyDate: '19-10-2025', sellDate: '08-05-2026' },
  { name: 'Mochila verde vichy',             sub: 'Bolsas/mochilas Walking Mum',      buy: 10.59, sell: 35.00, buyDate: '01-04-2026', sellDate: '11-04-2026' },
  { name: 'Shnuggle',                        sub: 'Trocadores Shnuggle',              buy: 20.09, sell: 35.00, buyDate: '13-05-2026', sellDate: '13-05-2026' },
  { name: 'Shnuggle',                        sub: 'Trocadores Shnuggle',              buy: 25.74, sell: 40.00, buyDate: '30-05-2026', sellDate: '30-05-2026' },
  { name: 'Shnuggle c/ caixa',               sub: 'Trocadores Shnuggle',              buy: 26.74, sell: null,  buyDate: '05-06-2026', sellDate: null },
  { name: 'Shnuggle c/ caixa',               sub: 'Trocadores Shnuggle',              buy: 30.00, sell: null,  buyDate: '10-06-2026', sellDate: null },
  { name: 'Tapete',                          sub: 'Tapetes atividades Little Dutch',  buy: 10.75, sell: 25.00, buyDate: '31-12-2025', sellDate: '07-02-2026' },
  { name: 'Tapete',                          sub: 'Tapetes atividades Little Dutch',  buy: 12.33, sell: 24.00, buyDate: '25-11-2025', sellDate: '07-01-2026' },
  { name: 'Tapete',                          sub: 'Tapetes atividades Little Dutch',  buy: 14.90, sell: 26.00, buyDate: '14-09-2025', sellDate: '14-10-2025' },
]

const rows = raw.map(({ name, sub, buy, sell, buyDate, sellDate }) => ({
  id: randomUUID(),
  name,
  category: 'baby',
  condition: 'used-like-new',
  buy_price: buy,
  sell_price: sell,
  buy_date: toIso(buyDate),
  sell_date: toIso(sellDate),
  platform: '',
  status: sell !== null ? 'sold' : 'in-stock',
  notes: sub,
  created_at: new Date().toISOString(),
}))

console.log(`👶 A inserir ${rows.length} artigos actualizados...`)
const { error: insError } = await supabase.from('products').insert(rows)
if (insError) { console.error('❌ Erro ao inserir:', insError.message); process.exit(1) }

const sold  = rows.filter(r => r.status === 'sold').length
const stock = rows.filter(r => r.status === 'in-stock').length
console.log(`✅ Feito! ${rows.length} artigos (${sold} vendidos, ${stock} em stock)`)
console.log('\nSubcategorias guardadas em "Notas" de cada artigo:')
;[...new Set(raw.map(r => r.sub))].forEach(s => console.log(`  · ${s}`))
