import { createClient } from '@supabase/supabase-js'
import type { ProductRow } from '@/types'

const url = import.meta.env.VITE_SUPABASE_URL as string || 'https://lirymmdwezuhmybkmbii.supabase.co'
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpcnltbWR3ZXp1aG15YmttYmlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwODQ2MTYsImV4cCI6MjA5NjY2MDYxNn0.lSD3VBG1q-2xJ3wxgW6RakSTJ27sp7YrqMMJtSkcFqE'

export const supabase = createClient(url, key)

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
