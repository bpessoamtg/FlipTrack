import { createClient } from '@supabase/supabase-js'
import type { ProductRow } from '@/types'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !key) {
  console.warn('Supabase: variáveis de ambiente em falta. Configure o ficheiro .env.')
}

export const supabase = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder')

export type Database = {
  public: {
    Tables: {
      products: {
        Row: ProductRow
        Insert: Omit<ProductRow, 'id' | 'created_at'>
        Update: Partial<Omit<ProductRow, 'id' | 'created_at'>>
      }
    }
  }
}
