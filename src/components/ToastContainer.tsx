import { useToastStore } from '@/hooks/useToast'
import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

const icons = {
  success: <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />,
  error: <XCircle className="h-4 w-4 text-red-500 shrink-0" />,
  info: <Info className="h-4 w-4 text-blue-500 shrink-0" />,
}

export function ToastContainer() {
  const { toasts, remove } = useToastStore()

  return (
    <div className="fixed bottom-20 sm:bottom-4 right-4 z-50 flex flex-col gap-2 max-w-xs">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-lg',
            'animate-in slide-in-from-right-4 duration-200',
          )}
        >
          {icons[t.type]}
          <p className="text-sm flex-1">{t.message}</p>
          <button onClick={() => remove(t.id)} className="text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
