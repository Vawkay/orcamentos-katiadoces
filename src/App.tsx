import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useEffect } from 'react'
import { Dashboard } from '@/pages/Dashboard'
import { OrcamentoForm } from '@/pages/OrcamentoForm'
import { VisualizarOrcamento } from '@/pages/VisualizarOrcamento'
import { Catalogo } from '@/pages/Catalogo'
import { Configuracoes } from '@/pages/Configuracoes'
import { seedProdutosSeVazio } from '@/lib/seed'

function AppRoutes() {
  // Popular catálogo na primeira utilização
  useEffect(() => {
    seedProdutosSeVazio()
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/novo" element={<OrcamentoForm />} />
      <Route path="/editar/:id" element={<OrcamentoForm />} />
      <Route path="/orcamento/:id" element={<VisualizarOrcamento />} />
      <Route path="/catalogo" element={<Catalogo />} />
      <Route path="/configuracoes" element={<Configuracoes />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            borderRadius: '1rem',
            fontSize: '14px',
          },
        }}
      />
    </BrowserRouter>
  )
}
