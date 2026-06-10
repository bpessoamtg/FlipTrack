import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import type { ImportRow, ColumnMapping, Product } from '@/types'

type ImportResult = { imported: number; skipped: number; errors: { row: number; message: string }[] }

export async function parseFile(file: File): Promise<{ columns: string[]; rows: ImportRow[] }> {
  const ext = file.name.split('.').pop()?.toLowerCase()

  if (ext === 'csv') return parseCSV(file)
  if (ext === 'xlsx' || ext === 'xls') return parseExcel(file)
  throw new Error('Formato não suportado. Use CSV ou Excel (.xlsx).')
}

function parseCSV(file: File): Promise<{ columns: string[]; rows: ImportRow[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const columns = result.meta.fields ?? []
        resolve({ columns, rows: result.data as ImportRow[] })
      },
      error: (err) => reject(new Error(err.message)),
    })
  })
}

async function parseExcel(file: File): Promise<{ columns: string[]; rows: ImportRow[] }> {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf)
  const ws = wb.Sheets[wb.SheetNames[0]]
  const raw = XLSX.utils.sheet_to_json<ImportRow>(ws, { defval: null })
  const columns = raw.length > 0 ? Object.keys(raw[0]) : []
  return { columns, rows: raw }
}

export function autoMapColumns(columns: string[]): ColumnMapping {
  const mapping: ColumnMapping = {}
  const hints: Record<keyof Product, string[]> = {
    name:      ['nome', 'name', 'artigo', 'produto', 'item', 'descrição', 'descricao'],
    category:  ['categoria', 'category', 'tipo'],
    condition: ['condição', 'condicao', 'condition', 'estado'],
    buyPrice:  ['preço compra', 'preco compra', 'buy_price', 'buyprice', 'compra', 'custo', 'cost', 'buy price'],
    sellPrice: ['preço venda', 'preco venda', 'sell_price', 'sellprice', 'venda', 'sell price'],
    buyDate:   ['data compra', 'buy_date', 'buydate', 'data de compra', 'buy date'],
    sellDate:  ['data venda', 'sell_date', 'selldate', 'data de venda', 'sell date'],
    platform:  ['plataforma', 'platform', 'canal'],
    status:    ['estado', 'status', 'situação'],
    notes:     ['notas', 'notes', 'observações', 'observacoes', 'obs'],
    id:        [],
    createdAt: [],
  }

  columns.forEach((col) => {
    const lower = col.toLowerCase().trim()
    for (const [field, terms] of Object.entries(hints)) {
      if (terms.some((t) => lower.includes(t))) {
        mapping[col] = field as keyof Product
        break
      }
    }
  })

  return mapping
}

const CATEGORY_MAP: Record<string, Product['category']> = {
  baby: 'baby', bebé: 'baby', bebe: 'baby',
  'board-game': 'board-game', jogo: 'board-game', jogos: 'board-game', 'board game': 'board-game',
  other: 'other', outros: 'other', outro: 'other',
}

const CONDITION_MAP: Record<string, Product['condition']> = {
  new: 'new', novo: 'new', nova: 'new',
  'used-like-new': 'used-like-new', 'como novo': 'used-like-new', 'como nova': 'used-like-new',
  'used-good': 'used-good', 'bom estado': 'used-good', 'bom': 'used-good',
  'used-fair': 'used-fair', razoável: 'used-fair', razoavel: 'used-fair',
}

const STATUS_MAP: Record<string, Product['status']> = {
  'in-stock': 'in-stock', 'em stock': 'in-stock', stock: 'in-stock',
  sold: 'sold', vendido: 'sold', vendida: 'sold',
  returned: 'returned', devolvido: 'returned', devolvida: 'returned',
}

function parseDate(val: unknown): string | null {
  if (!val) return null
  if (typeof val === 'number' && val > 0) {
    // Excel serial date (days since 1899-12-30)
    const excelEpoch = new Date(1899, 11, 30)
    const d = new Date(excelEpoch.getTime() + val * 86_400_000)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  const str = String(val).trim()
  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
  if (dmyMatch) return `${dmyMatch[3]}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}`
  // ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.substring(0, 10)
  return null
}

export function applyMappingAndValidate(
  rows: ImportRow[],
  mapping: ColumnMapping,
  existingProducts: Product[],
): ImportResult & { products: Omit<Product, 'id' | 'createdAt'>[] } {
  const products: Omit<Product, 'id' | 'createdAt'>[] = []
  const errors: { row: number; message: string }[] = []
  let skipped = 0

  rows.forEach((row, i) => {
    const rowNum = i + 2
    try {
      const mapped: Record<string, unknown> = {}
      Object.entries(mapping).forEach(([col, field]) => {
        if (field) mapped[field] = row[col]
      })

      // Required fields
      const name = String(mapped.name ?? '').trim()
      if (!name) throw new Error('Campo "nome" obrigatório em falta')

      const buyPriceRaw = String(mapped.buyPrice ?? '').replace(',', '.')
      const buyPrice = parseFloat(buyPriceRaw)
      if (isNaN(buyPrice)) throw new Error(`Preço de compra inválido: "${mapped.buyPrice}"`)

      const buyDate = parseDate(mapped.buyDate)
      if (!buyDate) throw new Error(`Data de compra inválida: "${mapped.buyDate}"`)

      // Duplicates
      const isDuplicate = existingProducts.some(
        (p) => p.name.toLowerCase() === name.toLowerCase() &&
          p.buyDate === buyDate &&
          Math.abs(p.buyPrice - buyPrice) < 0.01,
      )
      if (isDuplicate) { skipped++; return }

      const sellPriceRaw = mapped.sellPrice != null ? String(mapped.sellPrice).replace(',', '.') : ''
      const sellPrice = sellPriceRaw ? parseFloat(sellPriceRaw) : undefined
      if (sellPriceRaw && isNaN(sellPrice!)) throw new Error(`Preço de venda inválido: "${mapped.sellPrice}"`)

      const sellDate = mapped.sellDate ? parseDate(mapped.sellDate) : undefined
      const rawCat = String(mapped.category ?? '').toLowerCase().trim()
      const category: Product['category'] = CATEGORY_MAP[rawCat] ?? 'other'
      const rawCond = String(mapped.condition ?? '').toLowerCase().trim()
      const condition: Product['condition'] = CONDITION_MAP[rawCond] ?? 'used-good'
      const rawStatus = String(mapped.status ?? '').toLowerCase().trim()
      const status: Product['status'] = STATUS_MAP[rawStatus] ?? (sellDate ? 'sold' : 'in-stock')
      const platform = String(mapped.platform ?? '').trim() || 'Desconhecida'

      products.push({ name, category, condition, buyPrice, sellPrice, buyDate, sellDate: sellDate ?? undefined, platform, status, notes: mapped.notes ? String(mapped.notes) : undefined })
    } catch (e: unknown) {
      errors.push({ row: rowNum, message: e instanceof Error ? e.message : String(e) })
    }
  })

  return { products, imported: products.length, skipped, errors }
}
