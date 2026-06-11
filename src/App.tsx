import { HashRouter as BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { Layout } from '@/components/Layout'
import { ToastContainer } from '@/components/ToastContainer'
import { Geral } from '@/pages/Geral'
import { Inicio } from '@/pages/Inicio'
import { Inventario } from '@/pages/Inventario'
import { Vendas } from '@/pages/Vendas'
import { Analises } from '@/pages/Analises'
import { Definicoes } from '@/pages/Definicoes'
import { ImportarDados } from '@/pages/ImportarDados'
import { useProducts } from '@/hooks/useProducts'
import { useRealtime } from '@/hooks/useRealtime'
import { useStore } from '@/store/useStore'

function AppContent() {
  const { fetchAll } = useProducts()
  const darkMode = useStore((s) => s.settings.darkMode)
  useRealtime()

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  return (
    <Layout>
      <Routes>
        <Route path="/geral" element={<Geral />} />
        <Route path="/" element={<Inicio />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/vendas" element={<Vendas />} />
        <Route path="/analises" element={<Analises />} />
        <Route path="/definicoes" element={<Definicoes />} />
        <Route path="/importar" element={<ImportarDados />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
      <ToastContainer />
    </BrowserRouter>
  )
}
