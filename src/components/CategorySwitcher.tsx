import { Gamepad2, Baby } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  { key: 'board-game' as const, label: 'Jogos', icon: Gamepad2 },
  { key: 'baby' as const, label: 'Bebé', icon: Baby },
]

export function CategorySwitcher() {
  const activeCategory = useStore((s) => s.settings.activeCategory)
  const setSettings = useStore((s) => s.setSettings)

  return (
    <div className="flex gap-1 p-1 bg-muted rounded-xl">
      {CATEGORIES.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setSettings({ activeCategory: key })}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all',
            activeCategory === key
              ? 'bg-card shadow-sm text-primary'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Icon className="h-3.5 w-3.5 shrink-0" />
          {label}
        </button>
      ))}
    </div>
  )
}
