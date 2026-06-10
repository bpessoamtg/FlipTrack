import { useMemo } from 'react'
import { useStore } from '@/store/useStore'
import {
  computeStats,
  computeMonthlyStats,
  computeCategoryStats,
  computePlatformStats,
  computeAvgDaysToSell,
  computeSubcategoryStats,
  computeTopItems,
} from '@/lib/calculations'

export function useStats() {
  const allProducts = useStore((s) => s.products)
  const activeCategory = useStore((s) => s.settings.activeCategory)
  const products = useMemo(
    () => allProducts.filter((p) => p.category === activeCategory),
    [allProducts, activeCategory],
  )
  const stats = useMemo(() => computeStats(products), [products])
  const monthly = useMemo(() => computeMonthlyStats(products), [products])
  const byCategory = useMemo(() => computeCategoryStats(products), [products])
  const byPlatform = useMemo(() => computePlatformStats(products), [products])
  const avgDays = useMemo(() => computeAvgDaysToSell(products), [products])
  const bySubcategory = useMemo(() => computeSubcategoryStats(products), [products])
  const topItems = useMemo(() => computeTopItems(products), [products])
  return { stats, monthly, byCategory, byPlatform, avgDays, bySubcategory, topItems }
}

export function useGlobalStats() {
  const allProducts = useStore((s) => s.products)
  const boardGameProducts = useMemo(() => allProducts.filter((p) => p.category === 'board-game'), [allProducts])
  const babyProducts = useMemo(() => allProducts.filter((p) => p.category === 'baby'), [allProducts])
  const boardGameStats = useMemo(() => computeStats(boardGameProducts), [boardGameProducts])
  const babyStats = useMemo(() => computeStats(babyProducts), [babyProducts])
  const boardGameMonthly = useMemo(() => computeMonthlyStats(boardGameProducts), [boardGameProducts])
  const babyMonthly = useMemo(() => computeMonthlyStats(babyProducts), [babyProducts])
  return { boardGameStats, babyStats, boardGameMonthly, babyMonthly, boardGameProducts, babyProducts }
}
