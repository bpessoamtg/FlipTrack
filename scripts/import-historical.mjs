import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const supabase = createClient(
  'https://lirymmdwezuhmybkmbii.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpcnltbWR3ZXp1aG15YmttYmlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwODQ2MTYsImV4cCI6MjA5NjY2MDYxNn0.lSD3VBG1q-2xJ3wxgW6RakSTJ27sp7YrqMMJtSkcFqE'
)

// TSV: data_compra \t produto \t data_venda \t custo \t venda
// Linhas sem data_venda/venda = in-stock
const RAW = `31-12-2026	Ticket to Ride	02-02-2026	24.99 €	41.00 €
31-12-2026	Ticket to Ride	22-12-2025	24.99 €	40.00 €
31-12-2026	Carcassonne		14.99 €
31-12-2026	Carcassonne	31-12-2025	14.99 €	20.00 €
31-12-2026	Catan	01-03-2026	22.49 €	35.00 €
31-12-2026	Catan	20-02-2026	22.49 €	35.00 €
31-12-2026	Catan	11-12-2025	22.49 €	36.00 €
18-12-2025	Dixit	27-12-2025	17.49 €	26.00 €
20-12-2025	Ticket to Ride	20-01-2026	24.99 €	39.00 €
20-12-2025	Ticket to Ride	04-01-2026	24.99 €	40.00 €
16-12-2025	Código secreto Img	25-01-2026	12.49 €	18.50 €
16-12-2025	Código secreto	30-12-2025	12.49 €	19.00 €
07-12-2025	Código secreto Img	08-12-2025	12.49 €	17.50 €
06-12-2025	Ticket to Ride	27-12-2025	24.99 €	39.00 €
06-12-2025	Ticket to Ride	27-12-2025	24.99 €	40.00 €
06-12-2025	Ticket to Ride	21-12-2025	24.99 €	40.00 €
06-12-2025	Ticket to Ride	16-12-2025	24.99 €	40.00 €
06-12-2025	Ticket to Ride	14-12-2025	24.99 €	39.00 €
06-12-2025	Código secreto Img	07-12-2025	12.49 €	19.00 €
06-12-2025	Código secreto	07-12-2025	12.49 €	16.50 €
06-12-2025	Carcassonne	27-12-2025	14.99 €	20.00 €
16-11-2025	Código secreto	06-12-2025	12.49 €	17.00 €
27-10-2025	Código secreto	16-11-2025	10.49 €	18.00 €
26-10-2025	Carcassonne	17-11-2025	12.99 €	21.00 €
29-10-2025	Catan	07-01-2026	22.49 €	35.00 €
29-10-2025	Catan	03-01-2026	22.49 €	35.00 €
29-10-2025	Catan	30-12-2025	22.49 €	35.00 €
29-10-2025	Catan	30-12-2025	22.49 €	35.00 €
26-10-2025	Catan	07-01-2026	19.49 €	33.00 €
26-10-2025	Catan	27-12-2025	19.49 €	32.00 €
26-10-2025	Dixit	17-12-2025	17.49 €	22.50 €
27-12-2024	Dixit	15-01-2025	17.49 €	27.00 €
27-12-2024	Dixit	11-01-2025	17.49 €	27.00 €
20-12-2024	Catan	13-12-2025	22.49 €	35.00 €
20-12-2024	Catan	01-11-2025	22.49 €	35.00 €
20-12-2024	Catan	16-03-2025	22.49 €	35.00 €
20-12-2024	Risk	20-12-2024	24.99 €	32.50 €
18-12-2024	Risk	18-12-2024	24.99 €	32.00 €
03-11-2024	Catan	01-09-2025	19.49 €	33.00 €
03-11-2024	Catan	15-08-2025	19.49 €	32.00 €
03-11-2024	Catan	29-12-2024	19.49 €	30.00 €
03-11-2024	Catan	23-12-2024	19.49 €	32.00 €
03-11-2024	Catan	12-12-2024	19.49 €	31.00 €
03-11-2024	Catan	10-12-2024	19.49 €	30.00 €
22-10-2024	Catan	11-01-2025	21.99 €	33.00 €
22-10-2024	Catan	18-12-2024	21.99 €	33.00 €
03-11-2024	Dixit	20-12-2024	14.49 €	22.50 €
03-11-2024	Carcassonne	18-01-2025	11.99 €	20.00 €
02-01-2024	Ticket to Ride USA		24.99 €
02-01-2024	Ticket to Ride USA	01-09-2025	24.99 €	37.00 €
01-11-2024	Evora		22.49 €
01-11-2024	Ticket to Ride USA	28-06-2025	24.99 €	39.00 €
01-11-2024	Ticket to Ride USA	31-12-2024	24.99 €	38.00 €
26-10-2024	Ticket to Ride USA	31-12-2024	24.99 €	39.00 €
26-10-2024	Ticket to Ride USA	30-12-2024	24.99 €	39.00 €
26-10-2024	Ticket to Ride USA	10-12-2024	24.99 €	34.00 €
26-10-2024	Ticket to Ride USA	23-12-2024	24.49 €	37.00 €
01-11-2024	Código Secreto	23-11-2024	12.49 €	17.00 €
22-10-2024	Catan	16-12-2024	19.99 €	31.50 €
03-11-2024	Elétrico de lixoboa	03-11-2024	14.47 €	23.00 €
03-11-2024	Elétrico de lixoboa	03-11-2024	14.47 €	25.00 €
01-11-2024	Elétrico de lixoboa	03-11-2024	17.47 €	26.00 €
28-12-2023	Dixit	03-11-2024	17.49 €	25.00 €
22-10-2024	Catan	31-10-2024	19.99 €	31.00 €
02-01-2024	Ticket to Ride	17-02-2024	24.99 €	44.00 €
31-12-2023	Catan	21-02-2024	22.49 €	35.00 €
31-12-2023	Catan	06-03-2024	22.49 €	36.00 €
31-12-2023	Catan	24-02-2024	22.49 €	35.00 €
31-12-2023	Catan	15-02-2024	22.49 €	33.00 €
31-12-2023	Catan	09-02-2024	22.49 €	33.00 €
31-12-2023	Catan	27-01-2024	22.49 €	33.00 €
31-12-2023	Catan	04-01-2024	22.49 €	33.00 €
28-12-2023	Carcassonne	27-01-2024	14.99 €	24.00 €
28-12-2023	Dixit	23-12-2024	17.49 €	25.00 €
02-01-2024	Ticket to Ride	03-10-2024	24.99 €	41.00 €
26-12-2023	Código secreto Img	29-04-2024	10.99 €	17.00 €
15-12-2023	Código secreto	31-12-2023	8.49 €	17.00 €
27-10-2023	Ticket to Ride USA	31-12-2023	24.99 €	39.00 €
17-12-2023	Catan	30-12-2023	19.99 €	33.00 €
17-12-2023	Catan	30-12-2023	19.99 €	33.00 €
15-12-2023	Código secreto Img	30-12-2023	8.49 €	15.00 €
29-10-2023	Dixit	30-12-2023	14.49 €	27.00 €
23-12-2023	Catan	28-12-2023	22.49 €	33.00 €
01-12-2023	Código secreto	28-12-2023	8.49 €	17.00 €
23-10-2023	Dixit	28-12-2023	17.49 €	27.00 €
17-12-2023	Ticket to Ride USA	10-12-2024	24.99 €	34.00 €
04-11-2023	Catan	27-12-2023	17.49 €	33.00 €
20-12-2023	Ticket to Ride	26-12-2023	24.99 €	43.00 €
16-12-2023	Ticket to Ride USA	09-08-2024	24.99 €	36.99 €
15-12-2023	Catan	25-12-2023	17.49 €	32.00 €
20-10-2023	Ticket to Ride USA	25-12-2023	24.99 €	38.00 €
23-12-2023	Carcassonne	23-12-2023	14.99 €	23.00 €
16-12-2023	Ticket to Ride	23-12-2023	34.99 €	43.00 €
29-10-2023	Carcassonne	23-12-2023	10.99 €	23.00 €
23-10-2023	Dixit	23-12-2023	17.49 €	27.00 €
20-10-2023	Ticket to Ride USA	23-12-2023	24.99 €	39.00 €
17-12-2023	Código secreto	21-12-2023	8.49 €	15.00 €
15-12-2023	Código secreto	21-12-2023	8.49 €	15.00 €
04-11-2023	Catan	21-12-2023	17.49 €	32.00 €
23-10-2023	Dixit	21-12-2023	17.49 €	27.50 €
17-12-2023	Código secreto	20-12-2023	8.49 €	15.00 €
17-12-2023	Catan	20-12-2023	19.99 €	33.00 €
15-12-2023	Código secreto Img	20-12-2023	8.49 €	15.00 €
04-11-2023	Catan	19-12-2023	17.49 €	32.00 €
29-10-2023	Catan	19-12-2023	17.49 €	32.00 €
17-12-2023	Código secreto Img	18-12-2023	8.49 €	15.00 €
15-12-2023	Código secreto	18-12-2023	8.49 €	15.00 €
16-12-2023	Ticket to Ride	17-12-2023	34.99 €	43.21 €
01-12-2023	Código secreto	16-12-2023	8.49 €	15.00 €
04-11-2023	Dixit	09-08-2024	14.99 €	25.00 €
04-11-2023	Dixit	02-02-2024	14.99 €	27.00 €
01-12-2023	Código secreto	16-12-2023	8.49 €	15.00 €
20-10-2023	Ticket to Ride USA	16-12-2023	24.99 €	37.00 €
01-12-2023	Código secreto Img	15-12-2023	8.49 €	15.00 €
17-11-2023	Ticket to Ride	15-12-2023	23.49 €	39.00 €
01-12-2023	Código secreto	13-12-2023	8.49 €	15.00 €
17-11-2023	Ticket to Ride	13-12-2023	23.49 €	39.31 €
17-11-2023	Ticket to Ride	12-12-2023	23.49 €	39.00 €
28-10-2023	Catan	11-12-2023	17.49 €	32.00 €
01-12-2023	Código secreto Img	10-12-2023	8.49 €	15.00 €
17-11-2023	Ticket to Ride	10-12-2023	23.49 €	41.50 €
17-11-2023	Ticket to Ride	10-12-2023	23.49 €	39.00 €
27-10-2023	Ticket to Ride USA	01-01-2024	24.99 €	40.00 €
26-10-2023	Catan	08-12-2023	17.49 €	32.00 €
20-10-2023	Ticket to Ride	08-12-2023	24.99 €	40.00 €
29-10-2023	Código secreto	07-12-2023	8.99 €	15.00 €
26-10-2023	Catan	03-12-2023	17.49 €	31.00 €
15-12-2023	Código secreto Img	02-12-2023	8.49 €	15.00 €
17-11-2023	Código secreto	29-11-2023	8.49 €	15.00 €
29-10-2023	Código secreto Img	29-11-2023	8.99 €	15.00 €
07-01-2023	Ticket to Ride	22-11-2023	27.49 €	38.00 €
28-10-2023	Catan	11-11-2023	17.49 €	32.00 €
25-10-2022	Elétrico de lixoboa	11-11-2023	15.49 €	23.00 €
29-10-2023	Código secreto	07-11-2023	8.99 €	13.75 €
29-10-2023	Código secreto Img	29-10-2023	8.99 €	14.00 €
24-05-2023	Ticket to Ride	29-10-2023	24.00 €	36.00 €
22-10-2023	Catan	20-10-2023	17.49 €	30.00 €
22-10-2023	Catan	20-10-2023	19.99 €	33.00 €
22-10-2023	Código secreto	20-10-2023	8.49 €	10.00 €
02-01-2023	Ticket to Ride	15-10-2023	27.49 €	36.00 €
18-12-2022	Ticket to Ride	05-10-2023	21.99 €	37.49 €
24-05-2023	Dixit	17-09-2023	16.50 €	26.00 €
24-05-2023	Dixit normal	31-05-2023	16.50 €	26.00 €
07-01-2023	Dixit	31-01-2023	19.99 €	28.00 €
02-01-2023	Dixit	31-01-2023	19.99 €	26.00 €
31-12-2022	Dixit	31-12-2022	19.99 €	26.00 €
31-12-2022	Dixit	31-12-2022	19.99 €	26.00 €
18-12-2022	Dixit	31-12-2022	15.99 €	26.00 €
18-12-2022	Ticket to Ride	31-12-2022	21.99 €	38.00 €
18-12-2022	Ticket to Ride	31-12-2022	21.99 €	40.00 €
18-12-2022	Ticket to Ride	31-12-2022	21.99 €	38.00 €
18-12-2022	Ticket to Ride	31-12-2022	21.99 €	38.00 €
02-01-2023	Dixit	31-01-2023	19.99 €	26.00 €
16-12-2022	Dixit	31-12-2022	15.99 €	23.00 €
05-12-2022	Dixit	31-12-2022	15.99 €	25.00 €
05-12-2022	Risk	31-12-2022	19.99 €	30.00 €
29-10-2022	Istambul	31-12-2022	9.99 €	20.00 €
28-10-2022	Carcassonne	31-12-2022	9.99 €	17.00 €
28-10-2022	Catan	31-12-2022	15.99 €	32.00 €
28-10-2022	Catan	31-12-2022	15.99 €	32.00 €
28-10-2022	Porto	31-12-2022	11.99 €	19.00 €
28-10-2022	Ticket to Ride	31-12-2022	21.99 €	38.00 €
28-10-2022	Ticket to Ride	31-12-2022	21.99 €	39.00 €
27-10-2022	Catan	31-12-2022	15.99 €	29.00 €
27-10-2022	Catan	31-12-2022	15.99 €	31.75 €
27-10-2022	Catan	31-12-2022	15.99 €	32.00 €
27-10-2022	Catan	31-12-2022	15.99 €	32.00 €
27-10-2022	Código secreto	31-12-2022	7.99 €	14.00 €
27-10-2022	Código secreto Img	31-12-2022	7.99 €	15.00 €
26-10-2022	Carcassonne	31-12-2022	9.99 €	16.00 €
26-10-2022	Catan	31-12-2022	15.99 €	26.00 €
26-10-2022	Catan	31-12-2022	15.99 €	30.00 €
26-10-2022	Catan	31-12-2022	15.99 €	32.00 €
26-10-2022	Catan	31-12-2022	15.99 €	28.00 €
26-10-2022	Catan	31-12-2022	15.99 €	33.00 €
26-10-2022	Catan	31-12-2022	15.99 €	31.00 €
26-10-2022	Código secreto	31-12-2022	7.99 €	13.00 €
26-10-2022	Toquio	31-12-2022	13.99 €	22.50 €
25-10-2022	Dixit	31-12-2022	15.99 €	28.00 €
02-01-2023	Dixit	31-01-2023	19.99 €	26.00 €
25-10-2022	Istambul	31-12-2022	9.99 €	17.00 €
25-10-2022	Ticket to Ride	31-12-2022	21.99 €	38.00 €
25-10-2022	Ticket to Ride	31-12-2022	21.99 €	40.00 €
25-10-2022	Ticket to Ride	31-12-2022	21.99 €	39.00 €
25-10-2022	Ticket to Ride	31-12-2022	21.99 €	38.00 €
25-10-2022	Ticket to Ride	31-12-2022	21.99 €	39.00 €
25-10-2022	Ticket to Ride	31-12-2022	21.99 €	38.00 €
25-10-2022	Ticket to Ride	31-12-2022	21.99 €	38.00 €
25-10-2022	Ticket to Ride	31-12-2022	21.99 €	36.00 €
25-10-2022	Ticket to Ride	31-12-2022	21.99 €	38.00 €
25-10-2022	Ticket to Ride	31-12-2022	21.99 €	37.00 €
25-10-2022	Ticket to Ride	31-12-2022	21.99 €	38.00 €
25-10-2022	Ticket to Ride	31-12-2022	21.99 €	38.00 €
23-10-2022	Carcassonne	31-12-2022	12.49 €	18.00 €
23-10-2022	Catan	31-12-2022	19.99 €	30.00 €
23-10-2022	Código secreto	31-12-2022	9.99 €	15.00 €
21-10-2022	Catan	31-12-2022	19.99 €	30.00 €
21-10-2022	Toquio	31-12-2022	17.49 €	25.00 €
01-12-2021	Carcassonne	21-12-2021	12.49 €	17.00 €
01-12-2021	Carcassonne	21-12-2021	12.49 €	20.00 €
01-12-2021	Caretos	21-12-2021	19.99 €	25.00 €
01-12-2021	Catan	21-12-2021	19.99 €	25.00 €
01-12-2021	Catan	21-12-2021	19.99 €	25.00 €
01-12-2021	Catan	21-12-2021	25.79 €	31.00 €
01-12-2021	Catan	21-12-2021	19.99 €	26.00 €
01-12-2021	Catan	21-12-2021	23.49 €	28.50 €
01-12-2021	Catan	21-12-2021	19.99 €	25.00 €
01-12-2021	Catan	21-12-2021	19.99 €	25.00 €
01-12-2021	Catan	21-12-2021	19.99 €	28.00 €
01-12-2021	Catan	21-12-2021	23.49 €	31.50 €
01-12-2021	Catan	21-12-2021	19.99 €	28.00 €
01-12-2021	Catan	21-12-2021	19.99 €	27.00 €
01-12-2021	Catan	21-12-2021	19.99 €	28.00 €
01-12-2021	Catan	21-12-2021	19.99 €	28.00 €
01-12-2021	Catan	21-12-2021	19.99 €	28.00 €
01-12-2021	Catan	21-12-2021	19.99 €	28.00 €
01-12-2021	Catan	21-12-2021	19.99 €	30.00 €
01-12-2021	Código secreto	21-12-2021	9.99 €	15.00 €
01-12-2021	Código secreto	21-12-2021	9.99 €	15.00 €
01-12-2021	Dixit	21-12-2021	16.99 €	25.00 €
01-12-2021	Elétrico de lixoboa	21-12-2021	14.99 €	22.50 €
01-12-2021	Estoril	21-12-2021	17.49 €	26.00 €
01-12-2021	Rei Toquio	21-12-2021	19.79 €	28.00 €
01-12-2021	Rei Toquio	21-12-2021	13.99 €	25.00 €
01-12-2021	Risk	21-12-2021	20.99 €	30.00 €
01-12-2021	Sagrada	21-12-2021	19.99 €	25.00 €
01-12-2021	Sagrada	21-12-2021	19.99 €	28.00 €
01-12-2021	Ticket to ride	21-12-2021	26.45 €	35.00 €
01-12-2021	Ticket to ride	21-12-2021	26.45 €	35.00 €`

function toIso(s) {
  if (!s || !s.trim()) return null
  const [d, m, y] = s.trim().split('-')
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

function toNum(s) {
  if (!s || !s.trim()) return null
  const n = parseFloat(s.replace(/\s*€/, '').trim())
  return isNaN(n) ? null : n
}

const rows = RAW.trim().split('\n').map((line, i) => {
  const cols = line.split('\t')
  const buyDate = toIso(cols[0])
  const name = (cols[1] || '').trim()
  const sellDate = toIso(cols[2])
  const buyPrice = toNum(cols[3])
  const sellPrice = toNum(cols[4])

  if (!name || !buyDate || buyPrice === null) {
    console.warn(`Linha ${i + 1} ignorada (dados inválidos): ${line.substring(0, 50)}`)
    return null
  }

  return {
    id: randomUUID(),
    name,
    category: 'board-game',
    condition: 'new',
    buy_price: buyPrice,
    sell_price: sellPrice,
    buy_date: buyDate,
    sell_date: sellDate,
    platform: '',
    status: sellDate ? 'sold' : 'in-stock',
    notes: null,
    created_at: new Date().toISOString(),
  }
}).filter(Boolean)

console.log(`\n📦 ${rows.length} artigos preparados para inserção...\n`)

const BATCH = 50
let inserted = 0
let failed = 0

for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH)
  const { error } = await supabase.from('products').insert(batch)
  if (error) {
    console.error(`❌ Lote ${Math.ceil(i / BATCH) + 1}: ${error.message}`)
    failed += batch.length
  } else {
    inserted += batch.length
    console.log(`✓ Lote ${Math.ceil(i / BATCH) + 1}: +${batch.length} artigos (total: ${inserted})`)
  }
}

console.log(`\n✅ Concluído! Inseridos: ${inserted} | Erros: ${failed}`)

// Aviso sobre linhas potencialmente duplicadas
console.log(`\n⚠️  Nota: "02-01-2023 Dixit 31-01-2023" aparece 3× nos dados originais.`)
console.log(`   Verifica na app se são 3 unidades reais ou duplicados a remover.`)
