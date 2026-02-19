import { Trash2 } from 'lucide-react'
import type { ItemOrcamento } from '@/lib/types'
import { formatCurrency, formatInputCurrency, parseCurrency } from '@/lib/utils'

interface ItemRowProps {
  item: ItemOrcamento
  onUpdate: (id: string, updates: Partial<ItemOrcamento>) => void
  onRemove: (id: string) => void
}

export function ItemRow({ item, onUpdate, onRemove }: ItemRowProps) {
  const total = item.preco_unit * item.quantidade

  return (
    <div className="bg-gray-50 rounded-2xl p-3 space-y-2">
      {/* Linha 1: Nome do produto */}
      <input
        type="text"
        value={item.nome_produto}
        onChange={(e) => onUpdate(item.id, { nome_produto: e.target.value })}
        placeholder="Nome do produto"
        className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-pink-400 transition-colors"
      />

      {/* Linha 2: Qtd + Preço + Total + Lixeira */}
      <div className="flex items-center gap-2">
        {/* Quantidade */}
        <div className="flex-1">
          <label className="text-[10px] text-gray-400 font-medium block mb-1 ml-1">QTD</label>
          <input
            type="number"
            inputMode="decimal"
            min="0.5"
            step="0.5"
            value={item.quantidade}
            onChange={(e) => {
              const v = parseFloat(e.target.value)
              if (!isNaN(v) && v > 0) onUpdate(item.id, { quantidade: v })
            }}
            className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-sm text-center outline-none focus:border-pink-400 transition-colors"
          />
        </div>

        {/* Preço unit */}
        <div className="flex-1">
          <label className="text-[10px] text-gray-400 font-medium block mb-1 ml-1">PREÇO UN.</label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">R$</span>
            <input
              type="text"
              inputMode="decimal"
              value={formatInputCurrency(item.preco_unit)}
              onChange={(e) => {
                const v = parseCurrency(e.target.value)
                onUpdate(item.id, { preco_unit: v })
              }}
              className="w-full pl-7 pr-2 py-2 bg-white rounded-xl border border-gray-200 text-sm text-right outline-none focus:border-pink-400 transition-colors"
            />
          </div>
        </div>

        {/* Total (read-only) */}
        <div className="flex-1">
          <label className="text-[10px] text-gray-400 font-medium block mb-1 ml-1">TOTAL</label>
          <div className="px-3 py-2 bg-pink-50 rounded-xl border border-pink-100 text-sm font-semibold text-pink-700 text-right">
            {formatCurrency(total)}
          </div>
        </div>

        {/* Remover */}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="mt-4 p-2 rounded-xl text-red-400 hover:bg-red-50 transition-colors flex-shrink-0"
          aria-label="Remover item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
