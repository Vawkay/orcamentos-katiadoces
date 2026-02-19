import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { Produto, Unidade } from '@/lib/types'
import { formatInputCurrency, parseCurrency } from '@/lib/utils'

interface ProdutoDrawerProps {
  isOpen: boolean
  produto?: Produto | null  // null = novo, Produto = editar
  onClose: () => void
  onSave: (data: { nome: string; preco_unit: number; unidade: Unidade }) => void
}

const UNIDADES: { value: Unidade; label: string }[] = [
  { value: 'un', label: 'Unidade (un)' },
  { value: 'dz', label: 'Dúzia (dz)' },
  { value: 'kg', label: 'Quilo (kg)' },
  { value: 'cx', label: 'Caixa (cx)' },
  { value: 'pc', label: 'Porção (pc)' },
]

export function ProdutoDrawer({ isOpen, produto, onClose, onSave }: ProdutoDrawerProps) {
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState('')
  const [unidade, setUnidade] = useState<Unidade>('un')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Popular form ao abrir
  useEffect(() => {
    if (isOpen) {
      setNome(produto?.nome ?? '')
      setPreco(produto ? formatInputCurrency(produto.preco_unit) : '')
      setUnidade(produto?.unidade ?? 'un')
      setErrors({})
    }
  }, [isOpen, produto])

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!nome.trim()) errs.nome = 'Nome é obrigatório'
    if (!preco.trim()) errs.preco = 'Preço é obrigatório'
    else if (parseCurrency(preco) <= 0) errs.preco = 'Preço deve ser maior que zero'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSave() {
    if (!validate()) return
    onSave({ nome: nome.trim(), preco_unit: parseCurrency(preco), unidade })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Drawer */}
      <div className="relative bg-white rounded-t-3xl w-full max-w-lg shadow-2xl">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {produto ? 'Editar produto' : 'Novo produto'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nome do produto
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Brigadeiro gourmet"
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-colors ${
                errors.nome
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-300 bg-gray-50 focus:border-pink-400 focus:bg-white'
              } outline-none`}
              autoFocus
            />
            {errors.nome && (
              <p className="text-xs text-red-500 mt-1">{errors.nome}</p>
            )}
          </div>

          {/* Preço + Unidade (lado a lado) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Preço unitário
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  placeholder="0,00"
                  className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm transition-colors ${
                    errors.preco
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-300 bg-gray-50 focus:border-pink-400 focus:bg-white'
                  } outline-none`}
                />
              </div>
              {errors.preco && (
                <p className="text-xs text-red-500 mt-1">{errors.preco}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Unidade
              </label>
              <select
                value={unidade}
                onChange={(e) => setUnidade(e.target.value as Unidade)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-sm focus:border-pink-400 focus:bg-white outline-none transition-colors"
              >
                {UNIDADES.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2">
          <button
            onClick={handleSave}
            className="w-full py-3.5 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-2xl transition-colors text-sm"
          >
            {produto ? 'Salvar alterações' : 'Adicionar produto'}
          </button>
        </div>
      </div>
    </div>
  )
}
