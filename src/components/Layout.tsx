import { NavLink } from 'react-router-dom'
import { Home, Package, TrendingUp, BarChart2, Settings, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import { useEffect } from 'react'
import { CategorySwitcher } from '@/components/CategorySwitcher'

const navItems = [
  { to: '/geral', label: 'Geral', icon: Globe },
  { to: '/', label: 'Início', icon: Home },
  { to: '/inventario', label: 'Inventário', icon: Package },
  { to: '/vendas', label: 'Vendas', icon: TrendingUp },
  { to: '/analises', label: 'Análises', icon: BarChart2 },
  { to: '/definicoes', label: 'Definições', icon: Settings },
]

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const darkMode = useStore((s) => s.settings.darkMode)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-border bg-card">
        <div className="px-5 py-5 border-b border-border">
          <h1 className="text-lg font-bold text-primary tracking-tight">FlipTrack</h1>
          <p className="text-xs text-muted-foreground">Gestão de revenda</p>
        </div>
        <div className="px-3 pt-3 pb-2 border-b border-border">
          <CategorySwitcher />
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile category switcher */}
        <div className="md:hidden sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-2">
          <CategorySwitcher />
        </div>
        <div className="flex-1 overflow-auto pb-20 md:pb-0">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border safe-bottom">
        <div className="flex">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
