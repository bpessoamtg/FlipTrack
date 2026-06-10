import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, ArrowLeft, CheckCircle, AlertTriangle, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { parseFile, autoMapColumns, applyMappingAndValidate } from '@/lib/importParser'
import { useProducts } from '@/hooks/useProducts'
import type { ColumnMapping, ImportRow } from '@/types'
import type { Product } from '@/types'
import { toast } from '@/hooks/useToast'

type Step = 'upload' | 'mapping' | 'preview' | 'result'

const PRODUCT_FIELDS: { value: keyof Product | ''; label: string }[] = [
  { value: '', label: '— Ignorar —' },
  { value: 'name', label: 'Nome *' },
  { value: 'category', label: 'Categoria' },
  { value: 'condition', label: 'Condição' },
  { value: 'buyPrice', label: 'Preço de Compra *' },
  { value: 'sellPrice', label: 'Preço de Venda' },
  { value: 'buyDate', label: 'Data de Compra *' },
  { value: 'sellDate', label: 'Data de Venda' },
  { value: 'platform', label: 'Plataforma' },
  { value: 'status', label: 'Estado' },
  { value: 'notes', label: 'Notas' },
]

export function ImportarDados() {
  const navigate = useNavigate()
  const { products, batchInsert } = useProducts()
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>('upload')
  const [columns, setColumns] = useState<string[]>([])
  const [rows, setRows] = useState<ImportRow[]>([])
  const [mapping, setMapping] = useState<ColumnMapping>({})
  const [validated, setValidated] = useState<ReturnType<typeof applyMappingAndValidate> | null>(null)
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)

  const handleFile = async (file: File) => {
    if (!file) return
    setLoading(true)
    try {
      const { columns: cols, rows: rs } = await parseFile(file)
      setColumns(cols)
      setRows(rs)
      setMapping(autoMapColumns(cols))
      setStep('mapping')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao ler ficheiro')
    } finally {
      setLoading(false)
    }
  }

  const handleValidate = () => {
    const result = applyMappingAndValidate(rows, mapping, products)
    setValidated(result)
    setStep('preview')
  }

  const handleImport = async () => {
    if (!validated) return
    setLoading(true)
    try {
      await batchInsert(validated.products)
      setStep('result')
      toast.success(`${validated.imported} artigos importados com sucesso!`)
    } catch (e: unknown) {
      toast.error('Erro na importação: ' + (e instanceof Error ? e.message : String(e)))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/definicoes')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Importar Dados</h1>
          <p className="text-sm text-muted-foreground">CSV ou Excel (.xlsx)</p>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-1 text-xs">
        {(['upload', 'mapping', 'preview', 'result'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center font-semibold ${step === s ? 'bg-primary text-white' : ['upload', 'mapping', 'preview', 'result'].indexOf(step) > i ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>{i + 1}</div>
            <span className="hidden sm:inline text-muted-foreground">{['Ficheiro', 'Mapeamento', 'Pré-visualização', 'Resultado'][i]}</span>
            {i < 3 && <ChevronDown className="h-3 w-3 rotate-[-90deg] text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* Upload step */}
      {step === 'upload' && (
        <div
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium mb-1">Arraste um ficheiro ou clique para seleccionar</p>
          <p className="text-sm text-muted-foreground">CSV ou Excel (.xlsx) · Máximo 10 MB</p>
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
        </div>
      )}

      {/* Mapping step */}
      {step === 'mapping' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-border">
            <p className="font-medium">Mapeamento de Colunas</p>
            <p className="text-sm text-muted-foreground">{rows.length} linhas detectadas · Associe cada coluna ao campo correcto</p>
          </div>
          <div className="divide-y divide-border">
            {columns.map((col) => (
              <div key={col} className="flex items-center justify-between px-4 py-3 gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{col}</p>
                  <p className="text-xs text-muted-foreground truncate">{String(rows[0]?.[col] ?? '')}</p>
                </div>
                <Select
                  className="w-44 shrink-0"
                  value={mapping[col] ?? ''}
                  onChange={(e) => setMapping((m) => ({ ...m, [col]: e.target.value as keyof Product | '' }))}
                >
                  {PRODUCT_FIELDS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </Select>
              </div>
            ))}
          </div>
          <div className="flex justify-between p-4 border-t border-border">
            <Button variant="outline" onClick={() => setStep('upload')}>Voltar</Button>
            <Button onClick={handleValidate}>Validar e Pré-visualizar</Button>
          </div>
        </Card>
      )}

      {/* Preview step */}
      {step === 'preview' && validated && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{validated.imported}</p>
              <p className="text-xs text-muted-foreground mt-1">Para importar</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{validated.skipped}</p>
              <p className="text-xs text-muted-foreground mt-1">Duplicados</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{validated.errors.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Erros</p>
            </Card>
          </div>

          {validated.errors.length > 0 && (
            <Card className="p-4">
              <p className="text-sm font-medium mb-2 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Erros de validação</p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {validated.errors.map((e) => (
                  <p key={e.row} className="text-xs text-muted-foreground">Linha {e.row}: {e.message}</p>
                ))}
              </div>
            </Card>
          )}

          {validated.products.length > 0 && (
            <Card className="overflow-hidden">
              <div className="p-3 border-b border-border text-sm font-medium">Pré-visualização (primeiros 5)</div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      {['Nome', 'Cat.', 'Compra', 'Venda', 'Data', 'Plataforma'].map((h) => (
                        <th key={h} className="text-left px-3 py-2 font-medium text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {validated.products.slice(0, 5).map((p, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 max-w-[140px] truncate">{p.name}</td>
                        <td className="px-3 py-2">{p.category}</td>
                        <td className="px-3 py-2">{p.buyPrice}€</td>
                        <td className="px-3 py-2">{p.sellPrice ? `${p.sellPrice}€` : '—'}</td>
                        <td className="px-3 py-2">{p.buyDate}</td>
                        <td className="px-3 py-2">{p.platform}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('mapping')}>Voltar</Button>
            <Button onClick={handleImport} disabled={loading || validated.imported === 0}>
              {loading ? 'A importar...' : `Importar ${validated.imported} artigo${validated.imported !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      )}

      {/* Result step */}
      {step === 'result' && validated && (
        <div className="text-center py-8 space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h2 className="text-xl font-bold">Importação Concluída!</h2>
          <p className="text-muted-foreground">{validated.imported} artigos importados · {validated.skipped} duplicados ignorados · {validated.errors.length} erros</p>
          <div className="flex justify-center gap-3 pt-4">
            <Button variant="outline" onClick={() => setStep('upload')}>Nova Importação</Button>
            <Button onClick={() => navigate('/')}>Ver Dashboard</Button>
          </div>
        </div>
      )}
    </div>
  )
}
