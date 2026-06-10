export type Category = "baby" | "board-game" | "other"
export type Condition = "new" | "used-like-new" | "used-good" | "used-fair"
export type Status = "in-stock" | "sold" | "returned"

export interface Product {
  id: string
  name: string
  category: Category
  condition: Condition
  buyPrice: number
  sellPrice?: number
  buyDate: string
  sellDate?: string
  platform: string
  status: Status
  notes?: string
  createdAt: string
}

/** Shape stored in Supabase (snake_case) */
export interface ProductRow {
  id: string
  name: string
  category: string
  condition: string
  buy_price: number
  sell_price: number | null
  buy_date: string
  sell_date: string | null
  platform: string
  status: string
  notes: string | null
  created_at: string
}

export interface Stats {
  totalInvested: number
  totalRevenue: number
  netProfit: number
  avgMarginPct: number
  inStockCount: number
  soldCount: number
  returnedCount: number
}

export interface MonthlyStat {
  month: string
  sortKey: string
  receita: number
  custo: number
  lucro: number
}

export interface CategoryStat {
  name: string
  receita: number
  lucro: number
  count: number
}

export interface PlatformStat {
  name: string
  vendas: number
  lucro: number
}

export type Currency = "EUR" | "USD" | "GBP"

export interface AppSettings {
  currency: Currency
  darkMode: boolean
  activeCategory: 'board-game' | 'baby'
}

/** Import-related */
export interface ImportRow {
  [key: string]: string | number | null
}

export interface ColumnMapping {
  [sourceCol: string]: keyof Product | ""
}

export interface ImportResult {
  imported: number
  skipped: number
  errors: { row: number; message: string }[]
}
