import { useState, useCallback } from 'react'
import type { Produto, Unidade } from '@/lib/types'
import { getProdutos, saveProdutos } from '@/lib/storage'

export interface ProdutoInput {
  nome: string
  preco_unit: number  // centavos
  unidade: Unidade
}

export function useProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>(() => getProdutos())

  const refresh = useCallback(() => {
    setProdutos(getProdutos())
  }, [])

  const addProduto = useCallback((input: ProdutoInput): Produto => {
    const novo: Produto = {
      id: crypto.randomUUID(),
      nome: input.nome.trim(),
      preco_unit: input.preco_unit,
      unidade: input.unidade,
      ativo: true,
      created_at: new Date().toISOString(),
    }
    const atualizados = [...getProdutos(), novo]
    saveProdutos(atualizados)
    setProdutos(atualizados)
    return novo
  }, [])

  const updateProduto = useCallback((id: string, input: Partial<ProdutoInput>): void => {
    const atualizados = getProdutos().map((p) =>
      p.id === id ? { ...p, ...input } : p
    )
    saveProdutos(atualizados)
    setProdutos(atualizados)
  }, [])

  const toggleAtivo = useCallback((id: string): void => {
    const atualizados = getProdutos().map((p) =>
      p.id === id ? { ...p, ativo: !p.ativo } : p
    )
    saveProdutos(atualizados)
    setProdutos(atualizados)
  }, [])

  const deleteProduto = useCallback((id: string): void => {
    const atualizados = getProdutos().filter((p) => p.id !== id)
    saveProdutos(atualizados)
    setProdutos(atualizados)
  }, [])

  const produtosAtivos = produtos.filter((p) => p.ativo)

  return {
    produtos,
    produtosAtivos,
    refresh,
    addProduto,
    updateProduto,
    toggleAtivo,
    deleteProduto,
  }
}
