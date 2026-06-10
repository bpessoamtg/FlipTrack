import { useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useStore } from '@/store/useStore'
import type { Product, ProductRow } from '@/types'
import { toast } from '@/hooks/useToast'

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
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

function toRow(p: Omit<Product, 'id' | 'createdAt'>): Omit<ProductRow, 'id' | 'created_at'> {
  return {
    name: p.name,
    category: p.category,
    condition: p.condition,
    buy_price: p.buyPrice,
    sell_price: p.sellPrice ?? null,
    buy_date: p.buyDate,
    sell_date: p.sellDate ?? null,
    platform: p.platform,
    status: p.status,
    notes: p.notes ?? null,
  }
}

export function useProducts() {
  const { products: allProducts, setProducts, addProduct, updateProduct, removeProduct, setLoading } = useStore()
  const activeCategory = useStore((s) => s.settings.activeCategory)
  const products = useMemo(
    () => allProducts.filter((p) => p.category === activeCategory),
    [allProducts, activeCategory],
  )

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('products').select('*').order('buy_date', { ascending: false })
    setLoading(false)
    if (error) { toast.error('Erro ao carregar artigos: ' + error.message); return }
    setProducts((data as ProductRow[]).map(toProduct))
  }, [setLoading, setProducts])

  const create = useCallback(async (payload: Omit<Product, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase.from('products').insert(toRow(payload)).select().single()
    if (error) { toast.error('Erro ao criar artigo: ' + error.message); return null }
    const p = toProduct(data as ProductRow)
    addProduct(p)
    toast.success('Artigo adicionado com sucesso!')
    return p
  }, [addProduct])

  const update = useCallback(async (id: string, payload: Partial<Omit<Product, 'id' | 'createdAt'>>) => {
    const row: Partial<Omit<ProductRow, 'id' | 'created_at'>> = {}
    if (payload.name !== undefined) row.name = payload.name
    if (payload.category !== undefined) row.category = payload.category
    if (payload.condition !== undefined) row.condition = payload.condition
    if (payload.buyPrice !== undefined) row.buy_price = payload.buyPrice
    if (payload.sellPrice !== undefined) row.sell_price = payload.sellPrice
    if (payload.buyDate !== undefined) row.buy_date = payload.buyDate
    if (payload.sellDate !== undefined) row.sell_date = payload.sellDate
    if (payload.platform !== undefined) row.platform = payload.platform
    if (payload.status !== undefined) row.status = payload.status
    if (payload.notes !== undefined) row.notes = payload.notes ?? null

    const { error } = await supabase.from('products').update(row).eq('id', id)
    if (error) { toast.error('Erro ao actualizar: ' + error.message); return }
    updateProduct(id, payload)
    toast.success('Artigo actualizado!')
  }, [updateProduct])

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) { toast.error('Erro ao apagar: ' + error.message); return }
    removeProduct(id)
    toast.success('Artigo eliminado.')
  }, [removeProduct])

  const batchInsert = useCallback(async (items: Omit<Product, 'id' | 'createdAt'>[]) => {
    const rows = items.map(toRow)
    const { data, error } = await supabase.from('products').insert(rows).select()
    if (error) throw error
    const inserted = (data as ProductRow[]).map(toProduct)
    inserted.forEach(addProduct)
    return inserted
  }, [addProduct])

  return { products, fetchAll, create, update, remove, batchInsert }
}
