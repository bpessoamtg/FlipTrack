import { useState, useEffect } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import type { Product } from '@/types'
import { calcMarginPct, formatCurrency } from '@/lib/calculations'
import { useStore } from '@/store/useStore'

interface ProductFormProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Product, 'id' | 'createdAt'>) => void
  initial?: Product
}

const today = () => new Date().toISOString().split('T')[0]

export function ProductForm({ open, onClose, onSave, initial }: ProductFormProps) {
  const activeCategory = useStore((s) => s.settings.activeCategory)
  const isEdit = !!initial

  const makeDefault = (): Omit<Product, 'id' | 'createdAt'> => ({
    name: '',
    category: activeCategory,
    condition: activeCategory === 'board-game' ? 'new' : 'used-like-new',
    buyPrice: 0,
    sellPrice: undefined,
    buyDate: today(),
    sellDate: undefined,
    platform: activeCategory === 'board-game' ? 'OLX' : 'Vinted',
    status: 'in-stock',
    notes: '',
  })

  const [form, setForm] = useState<Omit<Product, 'id' | 'createdAt'>>(makeDefault)

  useEffect(() => {
    if (open) setForm(initial ? { ...initial } : makeDefault())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial, activeCategory])

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const margin = form.sellPrice ? calcMarginPct(form.buyPrice, form.sellPrice) : null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...form }
    if (!payload.sellPrice) delete payload.sellPrice
    if (!payload.sellDate) delete payload.sellDate
    if (!payload.notes) delete payload.notes
    onSave(payload)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} title={isEdit ? 'Editar Artigo' : 'Adicionar Artigo'}>
      <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
        {/* Nome */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome do artigo *</label>
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="Ex: LEGO City 60314" />
        </div>

        {/* Categoria + Condição */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Categoria</label>
            <Select value={form.category} onChange={(e) => set('category', e.target.value as Product['category'])}>
              <option value="baby">🍼 Bebé</option>
              <option value="board-game">🎲 Jogos de Tabuleiro</option>
              <option value="other">📦 Outros</option>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Condição</label>
            <Select value={form.condition} onChange={(e) => set('condition', e.target.value as Product['condition'])}>
              <option value="new">Novo</option>
              <option value="used-like-new">Usado — Como Novo</option>
              <option value="used-good">Usado — Bom Estado</option>
              <option value="used-fair">Usado — Estado Razoável</option>
            </Select>
          </div>
        </div>

        {/* Plataforma + Estado */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Plataforma</label>
            <Select value={form.platform} onChange={(e) => set('platform', e.target.value)}>
              <option>OLX</option>
              <option>Vinted</option>
              <option>Facebook</option>
              <option>eBay</option>
              <option>CustoJusto</option>
              <option>Outro</option>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Estado</label>
            <Select value={form.status} onChange={(e) => set('status', e.target.value as Product['status'])}>
              <option value="in-stock">Em Stock</option>
              <option value="sold">Vendido</option>
              <option value="returned">Devolvido</option>
            </Select>
          </div>
        </div>

        {/* Preços */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Preço de Compra (€) *</label>
            <Input type="number" step="0.01" min="0" value={form.buyPrice || ''} onChange={(e) => set('buyPrice', parseFloat(e.target.value) || 0)} required />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Preço de Venda (€)</label>
            <Input type="number" step="0.01" min="0" value={form.sellPrice ?? ''} onChange={(e) => set('sellPrice', e.target.value ? parseFloat(e.target.value) : undefined)} />
          </div>
        </div>

        {margin != null && (
          <div className={`text-sm font-medium rounded-lg px-3 py-2 ${margin >= 0 ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
            Margem estimada: {margin >= 0 ? '+' : ''}{margin.toFixed(1)}% ({formatCurrency((form.sellPrice ?? 0) - form.buyPrice)})
          </div>
        )}

        {/* Datas */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Data de Compra *</label>
            <Input type="date" value={form.buyDate} onChange={(e) => set('buyDate', e.target.value)} required />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Data de Venda</label>
            <Input type="date" value={form.sellDate ?? ''} onChange={(e) => set('sellDate', e.target.value || undefined)} />
          </div>
        </div>

        {/* Notas */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Notas</label>
          <Textarea value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value)} placeholder="Observações opcionais..." rows={2} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{isEdit ? 'Guardar Alterações' : 'Adicionar Artigo'}</Button>
        </div>
      </form>
    </Dialog>
  )
}
