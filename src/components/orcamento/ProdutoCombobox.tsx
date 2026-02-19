import { useState, useRef, useEffect } from 'react'
import { Search, Plus, X } from 'lucide-react'
import type { Produto } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface ProdutoComboboxProps {
  produtos: Produto[]
  onSelect: (produto: Produto) => void
  onAddPersonalizado: () => void
}

export function ProdutoCombobox({ produtos, onSelect, onAddPersonalizado }: ProdutoComboboxProps) {
  const [busca, setBusca] = useState('')
  const [aberto, setAberto] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const resultados = busca.length >= 1
    ? produtos.filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase()))
    : produtos

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(produto: Produto) {
    onSelect(produto)
    setBusca('')
    setAberto(false)
    inputRef.current?.blur()
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setAberto(true) }}
            onFocus={() => setAberto(true)}
            placeholder="Buscar produto do catálogo..."
            className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-sm focus:border-pink-400 focus:bg-white outline-none transition-colors"
          />
          {busca && (
            <button
              onClick={() => setBusca('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onAddPersonalizado}
          className="flex items-center gap-1.5 px-3 py-3 rounded-xl border border-dashed border-gray-300 text-sm text-gray-500 hover:border-pink-400 hover:text-pink-500 transition-colors whitespace-nowrap"
          title="Adicionar item personalizado"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Dropdown */}
      {aberto && resultados.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl z-30 max-h-52 overflow-y-auto">
          {resultados.map((produto) => (
            <button
              key={produto.id}
              type="button"
              onMouseDown={() => handleSelect(produto)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-pink-50 text-left transition-colors first:rounded-t-2xl last:rounded-b-2xl"
            >
              <span className="text-sm text-gray-800 truncate">{produto.nome}</span>
              <span className="text-sm font-medium text-pink-600 ml-3 flex-shrink-0">
                {formatCurrency(produto.preco_unit)}/{produto.unidade}
              </span>
            </button>
          ))}
        </div>
      )}

      {aberto && busca.length >= 1 && resultados.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl z-30">
          <div className="px-4 py-3 text-sm text-gray-500 text-center">
            Nenhum produto encontrado
          </div>
        </div>
      )}
    </div>
  )
}
