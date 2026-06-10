import { differenceInDays, parseISO, format } from 'date-fns'
import { pt } from 'date-fns/locale'
import type { Product, Stats, MonthlyStat, CategoryStat, PlatformStat } from '@/types'

export function calcProfit(buyPrice: number, sellPrice?: number) {
  if (sellPrice == null) return null
  return sellPrice - buyPrice
}

export function calcMarginPct(buyPrice: number, sellPrice?: number) {
  if (sellPrice == null || buyPrice === 0) return null
  return ((sellPrice - buyPrice) / buyPrice) * 100
}

export function calcDaysInStock(buyDate: string, sellDate?: string) {
  const start = parseISO(buyDate)
  const end = sellDate ? parseISO(sellDate) : new Date()
  return differenceInDays(end, start)
}

export function isChristmasSeason(buyDate: string) {
  const month = parseISO(buyDate).getMonth() + 1
  return month >= 10 && month <= 12
}

export function computeStats(products: Product[]): Stats {
  const sold = products.filter((p) => p.status === 'sold')
  const inStock = products.filter((p) => p.status === 'in-stock')

  const totalInvested = products.reduce((s, p) => s + p.buyPrice, 0)
  const totalRevenue = sold.reduce((s, p) => s + (p.sellPrice ?? 0), 0)
  const netProfit = sold.reduce((s, p) => s + ((p.sellPrice ?? 0) - p.buyPrice), 0)
  const margins = sold
    .map((p) => calcMarginPct(p.buyPrice, p.sellPrice))
    .filter((m): m is number => m != null)
  const avgMarginPct = margins.length ? margins.reduce((a, b) => a + b, 0) / margins.length : 0

  return {
    totalInvested,
    totalRevenue,
    netProfit,
    avgMarginPct,
    inStockCount: inStock.length,
    soldCount: sold.length,
    returnedCount: products.filter((p) => p.status === 'returned').length,
  }
}

export function computeMonthlyStats(products: Product[]): MonthlyStat[] {
  const sold = products.filter((p) => p.status === 'sold' && p.sellDate)
  const map = new Map<string, MonthlyStat>()

  sold.forEach((p) => {
    const date = parseISO(p.sellDate!)
    const month = format(date, 'MMM yy', { locale: pt })
    const sortKey = format(date, 'yyyy-MM')
    const profit = (p.sellPrice ?? 0) - p.buyPrice
    const cur = map.get(month) ?? { month, sortKey, receita: 0, custo: 0, lucro: 0 }
    map.set(month, {
      month,
      sortKey,
      receita: cur.receita + (p.sellPrice ?? 0),
      custo: cur.custo + p.buyPrice,
      lucro: cur.lucro + profit,
    })
  })

  return Array.from(map.values())
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .slice(-12)
}

export function computeCategoryStats(products: Product[]): CategoryStat[] {
  const sold = products.filter((p) => p.status === 'sold')
  const map = new Map<string, CategoryStat>()

  sold.forEach((p) => {
    const label = categoryLabel(p.category)
    const profit = (p.sellPrice ?? 0) - p.buyPrice
    const cur = map.get(label) ?? { name: label, receita: 0, lucro: 0, count: 0 }
    map.set(label, { name: label, receita: cur.receita + (p.sellPrice ?? 0), lucro: cur.lucro + profit, count: cur.count + 1 })
  })

  return Array.from(map.values())
}

export function computePlatformStats(products: Product[]): PlatformStat[] {
  const sold = products.filter((p) => p.status === 'sold')
  const map = new Map<string, PlatformStat>()

  sold.forEach((p) => {
    const profit = (p.sellPrice ?? 0) - p.buyPrice
    const cur = map.get(p.platform) ?? { name: p.platform, vendas: 0, lucro: 0 }
    map.set(p.platform, { name: p.platform, vendas: cur.vendas + 1, lucro: cur.lucro + profit })
  })

  return Array.from(map.values()).sort((a, b) => b.vendas - a.vendas)
}

export function computeAvgDaysToSell(products: Product[]) {
  const sold = products.filter((p) => p.status === 'sold' && p.sellDate)
  const map = new Map<string, number[]>()

  sold.forEach((p) => {
    const label = p.notes?.trim() || categoryLabel(p.category)
    const days = calcDaysInStock(p.buyDate, p.sellDate)
    const list = map.get(label) ?? []
    list.push(days)
    map.set(label, list)
  })

  return Array.from(map.entries()).map(([name, days]) => ({
    name,
    avgDias: Math.round(days.reduce((a, b) => a + b, 0) / days.length),
  }))
}

export function computeSubcategoryStats(products: Product[]): CategoryStat[] {
  const sold = products.filter((p) => p.status === 'sold')
  const map = new Map<string, CategoryStat>()
  sold.forEach((p) => {
    const label = p.notes?.trim() || categoryLabel(p.category)
    const profit = (p.sellPrice ?? 0) - p.buyPrice
    const cur = map.get(label) ?? { name: label, receita: 0, lucro: 0, count: 0 }
    map.set(label, { name: label, receita: cur.receita + (p.sellPrice ?? 0), lucro: cur.lucro + profit, count: cur.count + 1 })
  })
  return Array.from(map.values()).sort((a, b) => b.lucro - a.lucro)
}

export function computeTopItems(products: Product[]): { byQuantity: CategoryStat[]; byProfit: CategoryStat[] } {
  const sold = products.filter((p) => p.status === 'sold')
  const map = new Map<string, CategoryStat>()
  sold.forEach((p) => {
    const profit = (p.sellPrice ?? 0) - p.buyPrice
    const cur = map.get(p.name) ?? { name: p.name, receita: 0, lucro: 0, count: 0 }
    map.set(p.name, { name: p.name, receita: cur.receita + (p.sellPrice ?? 0), lucro: cur.lucro + profit, count: cur.count + 1 })
  })
  const items = Array.from(map.values())
  return {
    byQuantity: [...items].sort((a, b) => b.count - a.count || b.lucro - a.lucro),
    byProfit: [...items].sort((a, b) => b.lucro - a.lucro),
  }
}

export function computeCombinedMonthlyStats(
  products1: Product[],
  products2: Product[],
): { month: string; sortKey: string; jogos: number; bebe: number }[] {
  const makeMap = (prods: Product[]) => {
    const m = new Map<string, { sortKey: string; lucro: number }>()
    prods.filter((p) => p.status === 'sold' && p.sellDate).forEach((p) => {
      const date = parseISO(p.sellDate!)
      const month = format(date, 'MMM yy', { locale: pt })
      const sortKey = format(date, 'yyyy-MM')
      const profit = (p.sellPrice ?? 0) - p.buyPrice
      const cur = m.get(month) ?? { sortKey, lucro: 0 }
      m.set(month, { sortKey, lucro: cur.lucro + profit })
    })
    return m
  }
  const m1 = makeMap(products1)
  const m2 = makeMap(products2)
  const allMonths = new Set([...m1.keys(), ...m2.keys()])
  return Array.from(allMonths)
    .map((month) => ({
      month,
      sortKey: m1.get(month)?.sortKey ?? m2.get(month)?.sortKey ?? '',
      jogos: m1.get(month)?.lucro ?? 0,
      bebe: m2.get(month)?.lucro ?? 0,
    }))
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .slice(-18)
}

export function categoryLabel(cat: string) {
  const m: Record<string, string> = { baby: 'Bebé', 'board-game': 'Jogos', other: 'Outros' }
  return m[cat] ?? cat
}

export function conditionLabel(cond: string) {
  const m: Record<string, string> = {
    new: 'Novo',
    'used-like-new': 'Usado — Como Novo',
    'used-good': 'Usado — Bom Estado',
    'used-fair': 'Usado — Estado Razoável',
  }
  return m[cond] ?? cond
}

export function statusLabel(s: string) {
  const m: Record<string, string> = { 'in-stock': 'Em Stock', sold: 'Vendido', returned: 'Devolvido' }
  return m[s] ?? s
}

export function formatCurrency(value: number, currency = 'EUR') {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency }).format(value)
}
