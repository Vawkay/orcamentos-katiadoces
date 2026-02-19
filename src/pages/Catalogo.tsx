import { useState } from 'react'
import { Plus, Pencil, BookOpen, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '@/components/layout/AppShell'
import { ProdutoDrawer } from '@/components/catalogo/ProdutoDrawer'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useProdutos } from '@/hooks/useProdutos'
import type { Produto, Unidade } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

export function Catalogo() {
  const { produtos, addProduto, updateProduto, toggleAtivo, deleteProduto } = useProdutos()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editando, setEditando] = useState<Produto | null>(null)
  const [busca, setBusca] = useState('')

  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  )

  function handleOpenNovo() {
    setEditando(null)
    setDrawerOpen(true)
  }

  function handleOpenEditar(produto: Produto) {
    setEditando(produto)
    setDrawerOpen(true)
  }

  function handleSave(data: { nome: string; preco_unit: number; unidade: Unidade }) {
    if (editando) {
      updateProduto(editando.id, data)
      toast.success('Produto atualizado!')
    } else {
      addProduto(data)
      toast.success('Produto adicionado!')
    }
    setDrawerOpen(false)
  }

  return (
    <AppShell
      title="Catálogo de produtos"
      actions={
        <button
          onClick={handleOpenNovo}
          className="flex items-center gap-1.5 bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo
        </button>
      }
    >
      <div className="p-4 space-y-4">
        {/* Busca */}
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar produto..."
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm outline-none focus:border-pink-400 transition-colors"
        />

        {/* Lista */}
        {produtosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">
              {busca ? 'Nenhum produto encontrado' : 'Catálogo vazio'}
            </p>
            {!busca && (
              <p className="text-sm text-gray-400 mt-1">
                Adicione seus doces e preços para usar nos orçamentos
              </p>
            )}
            {!busca && (
              <button
                onClick={handleOpenNovo}
                className="mt-4 px-5 py-2.5 bg-pink-500 text-white text-sm font-medium rounded-full hover:bg-pink-600 transition-colors"
              >
                Adicionar primeiro produto
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {/* Separador ativo/inativo */}
            {produtosFiltrados.some((p) => p.ativo) && (
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide px-1">
                Ativos ({produtosFiltrados.filter((p) => p.ativo).length})
              </p>
            )}
            {produtosFiltrados
              .sort((a, b) => {
                if (a.ativo !== b.ativo) return a.ativo ? -1 : 1
                return a.nome.localeCompare(b.nome, 'pt-BR')
              })
              .map((produto) => (
                <div
                  key={produto.id}
                  className={`bg-white rounded-2xl p-4 shadow-sm border transition-opacity ${
                    produto.ativo ? 'border-gray-100 opacity-100' : 'border-gray-100 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${produto.ativo ? 'text-gray-900' : 'text-gray-500 line-through'}`}>
                        {produto.nome}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatCurrency(produto.preco_unit)} / {produto.unidade}
                      </p>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-1">
                      {/* Toggle ativo */}
                      <button
                        onClick={() => toggleAtivo(produto.id)}
                        className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                        aria-label={produto.ativo ? 'Desativar' : 'Ativar'}
                        title={produto.ativo ? 'Desativar' : 'Ativar'}
                      >
                        {produto.ativo
                          ? <ToggleRight className="w-5 h-5 text-green-500" />
                          : <ToggleLeft className="w-5 h-5 text-gray-400" />
                        }
                      </button>

                      {/* Editar */}
                      <button
                        onClick={() => handleOpenEditar(produto)}
                        className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                        aria-label="Editar"
                      >
                        <Pencil className="w-4 h-4 text-gray-500" />
                      </button>

                      {/* Excluir */}
                      <ConfirmDialog
                        title="Excluir produto?"
                        description={`"${produto.nome}" será removido do catálogo. Orçamentos existentes não serão afetados.`}
                        confirmLabel="Excluir"
                        destructive
                        onConfirm={() => {
                          deleteProduto(produto.id)
                          toast.success('Produto excluído')
                        }}
                      >
                        {(open) => (
                          <button
                            onClick={open}
                            className="p-2 rounded-xl hover:bg-red-50 transition-colors"
                            aria-label="Excluir"
                          >
                            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </ConfirmDialog>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Drawer */}
      <ProdutoDrawer
        isOpen={drawerOpen}
        produto={editando}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
      />
    </AppShell>
  )
}
