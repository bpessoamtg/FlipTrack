import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Download, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { ConfirmDialog } from '@/components/ui/Dialog'
import { useStore } from '@/store/useStore'
import { useProducts } from '@/hooks/useProducts'
import { exportToJSON, exportToCSV } from '@/lib/exportUtils'
import { supabase } from '@/lib/supabaseClient'
import { toast } from '@/hooks/useToast'

export function Definicoes() {
  const navigate = useNavigate()
  const { settings, setSettings, setProducts } = useStore()
  const { products } = useProducts()
  const [clearConfirm, setClearConfirm] = useState(false)

  const handleClearAll = async () => {
    const { error } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (error) { toast.error('Erro ao limpar dados: ' + error.message); return }
    setProducts([])
    toast.success('Todos os dados foram eliminados.')
  }

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold">Definições</h1>
        <p className="text-sm text-muted-foreground">Preferências e gestão de dados</p>
      </div>

      {/* Aparência */}
      <Card>
        <div className="p-4 border-b border-border">
          <p className="font-medium text-sm">Aparência</p>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Modo Escuro</p>
              <p className="text-xs text-muted-foreground">Alterna entre tema claro e escuro</p>
            </div>
            <button
              onClick={() => setSettings({ darkMode: !settings.darkMode })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.darkMode ? 'bg-primary' : 'bg-muted'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${settings.darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Moeda</p>
              <p className="text-xs text-muted-foreground">Moeda utilizada em todos os valores</p>
            </div>
            <Select
              className="w-24"
              value={settings.currency}
              onChange={(e) => setSettings({ currency: e.target.value as 'EUR' | 'USD' | 'GBP' })}
            >
              <option value="EUR">€ EUR</option>
              <option value="USD">$ USD</option>
              <option value="GBP">£ GBP</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Dados */}
      <Card>
        <div className="p-4 border-b border-border">
          <p className="font-medium text-sm">Gestão de Dados</p>
          <p className="text-xs text-muted-foreground">{products.length} artigos guardados</p>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Importar Dados</p>
              <p className="text-xs text-muted-foreground">CSV ou Excel com registos históricos</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/importar')}>
              <Upload className="h-4 w-4" /> Importar
            </Button>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-border">
            <div>
              <p className="text-sm font-medium">Exportar como JSON</p>
              <p className="text-xs text-muted-foreground">Cópia de segurança completa</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => exportToJSON(products)}>
              <Download className="h-4 w-4" /> JSON
            </Button>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-border">
            <div>
              <p className="text-sm font-medium">Exportar como CSV</p>
              <p className="text-xs text-muted-foreground">Todos os artigos em formato CSV</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => exportToCSV(products)}>
              <Download className="h-4 w-4" /> CSV
            </Button>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-border">
            <div>
              <p className="text-sm font-medium text-destructive">Limpar Todos os Dados</p>
              <p className="text-xs text-muted-foreground">Elimina todos os artigos permanentemente</p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setClearConfirm(true)}>
              <Trash2 className="h-4 w-4" /> Limpar
            </Button>
          </div>
        </div>
      </Card>

      {/* Info */}
      <Card className="p-4 text-center text-xs text-muted-foreground">
        <p className="font-semibold text-sm mb-1">FlipTrack</p>
        <p>v1.0 · Gestão de compra e revenda online</p>
        <p className="mt-1">Sincronizado com Supabase · PWA</p>
      </Card>

      <ConfirmDialog
        open={clearConfirm}
        onClose={() => setClearConfirm(false)}
        onConfirm={handleClearAll}
        title="Limpar todos os dados"
        description="Esta acção vai eliminar permanentemente todos os artigos registados. Não é possível desfazer. Considere exportar primeiro."
        confirmLabel="Sim, eliminar tudo"
      />
    </div>
  )
}
