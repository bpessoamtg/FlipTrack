import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const supabase = createClient(
  'https://lirymmdwezuhmybkmbii.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpcnltbWR3ZXp1aG15YmttYmlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwODQ2MTYsImV4cCI6MjA5NjY2MDYxNn0.lSD3VBG1q-2xJ3wxgW6RakSTJ27sp7YrqMMJtSkcFqE'
)

// buy_date = '2024-01-01' como placeholder (datas não registadas)
// sell_price = null → in-stock | sell_price presente → sold
const items = [
  { name: 'Bolsa + colchão preto vichy',    buy: 9.24,  sell: 24.50 },
  { name: 'Bolsa grande preta vichy',        buy: 6.39,  sell: 15.00 },
  { name: 'Bolsa grande verde vichy',        buy: 11.25, sell: null  },
  { name: 'Bolsa pequena verde tulum',       buy: 8.19,  sell: 20.00 },
  { name: 'Bolsa pequena verde vichy',       buy: 8.72,  sell: null  },
  { name: 'Bolsa pequena verde vichy',       buy: 8.72,  sell: 18.00 },
  { name: 'Bolsa pequena verde vichy',       buy: 6.44,  sell: 14.00 },
  { name: 'Bolsa pequena verde vichy',       buy: 8.08,  sell: 17.50 },
  { name: 'Bolsa pequena verde vichy',       buy: 9.00,  sell: 15.00 },
  { name: 'Lancheira preta vichy',           buy: 5.00,  sell: 9.00  },
  { name: 'Mesa atividades forest friends',  buy: 14.95, sell: 30.00 },
  { name: 'Mesa atividades sailors bay',     buy: 17.68, sell: 35.00 },
  { name: 'Mesa atividades sailors bay',     buy: 14.99, sell: 33.00 },
  { name: 'Mesa atividades sailors bay',     buy: 21.25, sell: 32.00 },
  { name: 'Mobile mar',                      buy: 10.79, sell: 32.00 },
  { name: 'Mobile mar',                      buy: 11.84, sell: 32.00 },
  { name: 'Mobile mar',                      buy: 15.45, sell: 26.50 },
  { name: 'Mobile mar',                      buy: 13.94, sell: 25.00 },
  { name: 'Mobile mar c/ caixa',             buy: 11.84, sell: null  },
  { name: 'Mobile sailors bay',              buy: 12.95, sell: null  },
  { name: 'Mobile sailors bay c/ caixa',     buy: 15.05, sell: 35.00 },
  { name: 'Mochila preta vichy',             buy: 18.45, sell: 33.00 },
  { name: 'Mochila preta vichy',             buy: 18.69, sell: 30.00 },
  { name: 'Mochila preta vichy',             buy: 15.06, sell: 32.14 },
  { name: 'Mochila preta vichy',             buy: 0.00,  sell: 25.00 },
  { name: 'Mochila verde pintas',            buy: 17.45, sell: 40.00 },
  { name: 'Mochila verde vichy',             buy: 25.97, sell: 38.00 },
  { name: 'Mochila verde vichy',             buy: 10.59, sell: 35.00 },
  { name: 'Shnuggle',                        buy: 20.09, sell: 35.00 },
  { name: 'Shnuggle',                        buy: 25.74, sell: 40.00 },
  { name: 'Shnuggle c/ caixa',              buy: 26.74, sell: null  },
  { name: 'Shnuggle c/ caixa',              buy: 30.00, sell: null  },
  { name: 'Tapete',                          buy: 10.75, sell: 25.00 },
  { name: 'Tapete',                          buy: 12.33, sell: 24.00 },
  { name: 'Tapete',                          buy: 14.90, sell: 26.00 },
]

const rows = items.map(({ name, buy, sell }) => ({
  id: randomUUID(),
  name,
  category: 'baby',
  condition: 'used-like-new',
  buy_price: buy,
  sell_price: sell,
  buy_date: '2026-02-01',
  sell_date: sell !== null ? '2026-02-01' : null,
  platform: '',
  status: sell !== null ? 'sold' : 'in-stock',
  notes: null,
  created_at: new Date().toISOString(),
}))

console.log(`\n👶 ${rows.length} artigos de bebé preparados...\n`)

const { error } = await supabase.from('products').insert(rows)
if (error) {
  console.error('❌ Erro:', error.message)
} else {
  const sold = rows.filter(r => r.status === 'sold').length
  const stock = rows.filter(r => r.status === 'in-stock').length
  console.log(`✅ Inseridos: ${rows.length} (${sold} vendidos, ${stock} em stock)`)
}

console.log('\n⚠️  Nota: buy_date e sell_date usam "2026-02-01" como placeholder.')
console.log('   A "Mochila preta vichy" com compra "- €" foi registada com custo 0,00€.')
