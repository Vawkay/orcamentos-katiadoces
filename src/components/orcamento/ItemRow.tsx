import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import type { ItemOrcamento } from '@/lib/types'
import { formatCurrency, formatInputCurrency, parseCurrency, sanitizeCurrencyInput, sanitizeQtyInput } from '@/lib/utils'

interface ItemRowProps {
  item: ItemOrcamento
  onUpdate: (id: string, updates: Partial<ItemOrcamento>) => void
  onRemove: (id: string) => void
}

export function ItemRow({ item, onUpdate, onRemove }: ItemRowProps) {
  const [precoStr, setPrecoStr] = useState(() => formatInputCurrency(item.preco_unit))
  const [qtdStr, setQtdStr] = useState(() => String(item.quantidade))

  // Sincroniza quando o item muda externamente (ex: produto adicionado do catálogo)
  useEffect(() => {
    setPrecoStr(formatInputCurrency(item.preco_unit))
  }, [item.preco_unit])

  useEffect(() => {
    setQtdStr(String(item.quantidade))
  }, [item.quantidade])

  // Calcula total usando os valores locais para feedback em tempo real
  const precoLocal = parseCurrency(precoStr) || 0
  const qtdLocal = parseFloat(qtdStr.replace(',', '.')) || 0
  const total = precoLocal * qtdLocal

  function commitPreco() {
    const v = parseCurrency(precoStr)
    onUpdate(item.id, { preco_unit: v })
    setPrecoStr(formatInputCurrency(v))
  }

  function commitQtd() {
    const v = parseFloat(qtdStr.replace(',', '.'))
    if (!isNaN(v) && v > 0) {
      onUpdate(item.id, { quantidade: v })
    } else {
      setQtdStr(String(item.quantidade))
    }
  }

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
            type="text"
            inputMode="decimal"
            value={qtdStr}
            onChange={(e) => setQtdStr(sanitizeQtyInput(e.target.value))}
            onBlur={commitQtd}
            onFocus={(e) => e.target.select()}
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
              value={precoStr}
              onChange={(e) => setPrecoStr(sanitizeCurrencyInput(e.target.value))}
              onBlur={commitPreco}
              onFocus={(e) => e.target.select()}
              placeholder="0,00"
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
