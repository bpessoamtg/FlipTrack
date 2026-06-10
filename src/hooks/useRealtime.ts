import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useStore } from '@/store/useStore'
import type { Product, ProductRow } from '@/types'

function toProduct(row: ProductRow): Product {
  return {
    id: row.id, name: row.name,
    category: row.category as Product['category'],
    condition: row.condition as Product['condition'],
    buyPrice: row.buy_price,
    sellPrice: row.sell_price ?? undefined,
    buyDate: row.buy_date,
    sellDate: row.sell_date ?? undefined,
    platform: row.platform,
    status: row.status as Product['status'],
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  }
}

export function useRealtime() {
  const { addProduct, updateProduct, removeProduct } = useStore()

  useEffect(() => {
    const channel = supabase
      .channel('products-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'products' }, (payload) => {
        addProduct(toProduct(payload.new as ProductRow))
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, (payload) => {
        const p = toProduct(payload.new as ProductRow)
        updateProduct(p.id, p)
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'products' }, (payload) => {
        removeProduct((payload.old as { id: string }).id)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [addProduct, updateProduct, removeProduct])
}
