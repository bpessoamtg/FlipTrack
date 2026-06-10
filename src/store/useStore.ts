import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product, AppSettings } from '@/types'

interface Store {
  products: Product[]
  settings: AppSettings
  isLoading: boolean
  pendingOps: string[]

  setProducts: (products: Product[]) => void
  addProduct: (product: Product) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  removeProduct: (id: string) => void
  setLoading: (v: boolean) => void
  setSettings: (s: Partial<AppSettings>) => void
  addPending: (id: string) => void
  removePending: (id: string) => void
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      products: [],
      settings: { currency: 'EUR', darkMode: false, activeCategory: 'board-game' as const },
      isLoading: false,
      pendingOps: [],

      setProducts: (products) => set({ products }),
      addProduct: (product) => set((s) => ({ products: [...s.products, product] })),
      updateProduct: (id, patch) =>
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      removeProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
      setLoading: (v) => set({ isLoading: v }),
      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      addPending: (id) => set((s) => ({ pendingOps: [...s.pendingOps, id] })),
      removePending: (id) => set((s) => ({ pendingOps: s.pendingOps.filter((x) => x !== id) })),
    }),
    {
      name: 'fliptrack-store',
      partialize: (s) => ({ settings: s.settings }),
      merge: (persisted: unknown, current: unknown) => {
        const p = persisted as Partial<typeof current>
        const c = current as Record<string, unknown>
        return {
          ...c,
          settings: { ...c.settings as object, ...(p as Record<string, unknown>).settings as object },
        }
      },
    },
  ),
)
