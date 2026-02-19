import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Plus, ClipboardList } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useOrcamentos } from '@/hooks/useOrcamentos'
import type { StatusOrcamento } from '@/lib/types'
import { calcularTotal, LABELS_STATUS } from '@/lib/types'
import { formatCurrency, formatDate, formatNumeroOrcamento } from '@/lib/utils'

const FILTROS: { value: StatusOrcamento | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'rascunho', label: LABELS_STATUS.rascunho },
  { value: 'enviado', label: LABELS_STATUS.enviado },
  { value: 'aprovado', label: LABELS_STATUS.aprovado },
  { value: 'cancelado', label: LABELS_STATUS.cancelado },
]

export function Dashboard() {
  const { orcamentos } = useOrcamentos()
  const navigate = useNavigate()
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<StatusOrcamento | 'todos'>('todos')

  const orcamentosFiltrados = orcamentos.filter((o) => {
    const matchBusca = busca === '' ||
      o.cliente_nome.toLowerCase().includes(busca.toLowerCase()) ||
      formatNumeroOrcamento(o.numero).toLowerCase().includes(busca.toLowerCase())
    const matchStatus = filtroStatus === 'todos' || o.status === filtroStatus
    return matchBusca && matchStatus
  })

  return (
    <AppShell>
      <div className="p-4 space-y-4">
        {/* Cabeçalho */}
        <div className="pt-2">
          <img src="/logo.png" alt="Katia Doces" className="h-20 w-auto object-contain" />
          <p className="text-sm text-gray-500 mt-0.5">
            {orcamentos.length} orçamento{orcamentos.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por cliente ou nº..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm outline-none focus:border-pink-400 transition-colors"
          />
        </div>

        {/* Filtros de status */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {FILTROS.map(({ value, label }) => {
            const count = value === 'todos'
              ? orcamentos.length
              : orcamentos.filter((o) => o.status === value).length

            if (value !== 'todos' && count === 0) return null

            return (
              <button
                key={value}
                onClick={() => setFiltroStatus(value)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  filtroStatus === value
                    ? 'bg-pink-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-600'
                }`}
              >
                {label} {count > 0 && `(${count})`}
              </button>
            )
          })}
        </div>

        {/* Lista de orçamentos */}
        {orcamentosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ClipboardList className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">
              {busca || filtroStatus !== 'todos' ? 'Nenhum orçamento encontrado' : 'Nenhum orçamento ainda'}
            </p>
            {!busca && filtroStatus === 'todos' && (
              <p className="text-sm text-gray-400 mt-1">
                Crie seu primeiro orçamento clicando no botão abaixo
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {orcamentosFiltrados.map((orcamento) => {
              const total = calcularTotal(orcamento.itens, orcamento.desconto)
              return (
                <Link
                  key={orcamento.id}
                  to={`/orcamento/${orcamento.id}`}
                  className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-pink-200 transition-all active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-400">
                          {formatNumeroOrcamento(orcamento.numero)}
                        </span>
                        <StatusBadge status={orcamento.status} />
                      </div>
                      <p className="font-semibold text-gray-900 truncate">
                        {orcamento.cliente_nome}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {orcamento.tipo_evento}
                        {orcamento.data_evento && ` · ${formatDate(orcamento.data_evento)}`}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-900">
                        {formatCurrency(total)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {orcamento.itens.length} item{orcamento.itens.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Espaço para o FAB */}
        <div className="h-16" />
      </div>

      {/* FAB - Novo orçamento */}
      <button
        onClick={() => navigate('/novo')}
        className="fixed bottom-20 right-4 z-20 w-14 h-14 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center active:scale-95"
        aria-label="Novo orçamento"
        style={{ bottom: 'calc(56px + env(safe-area-inset-bottom) + 16px)' }}
      >
        <Plus className="w-6 h-6" />
      </button>
    </AppShell>
  )
}
