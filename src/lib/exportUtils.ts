import type { Product } from '@/types'
import { categoryLabel, conditionLabel, statusLabel } from './calculations'

export function exportToCSV(products: Product[], filename = 'fliptrack-exportacao') {
  const headers = [
    'Nome', 'Categoria', 'Condição', 'Plataforma', 'Estado',
    'Preço Compra (€)', 'Preço Venda (€)', 'Lucro (€)', 'Margem (%)',
    'Data Compra', 'Data Venda', 'Dias em Stock', 'Notas',
  ]

  const rows = products.map((p) => {
    const profit = p.sellPrice != null ? p.sellPrice - p.buyPrice : ''
    const margin = p.sellPrice != null && p.buyPrice > 0
      ? (((p.sellPrice - p.buyPrice) / p.buyPrice) * 100).toFixed(1)
      : ''
    const days = p.sellDate
      ? Math.abs(new Date(p.sellDate).getTime() - new Date(p.buyDate).getTime()) / 86_400_000
      : Math.abs(new Date().getTime() - new Date(p.buyDate).getTime()) / 86_400_000

    return [
      p.name,
      categoryLabel(p.category),
      conditionLabel(p.condition),
      p.platform,
      statusLabel(p.status),
      p.buyPrice.toFixed(2),
      p.sellPrice?.toFixed(2) ?? '',
      typeof profit === 'number' ? profit.toFixed(2) : '',
      margin,
      p.buyDate,
      p.sellDate ?? '',
      Math.round(days),
      p.notes ?? '',
    ]
  })

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${filename}.csv`
  a.click()
}

export function exportToJSON(products: Product[], filename = 'fliptrack-backup') {
  const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${filename}.json`
  a.click()
}
