import { useState, useCallback } from 'react'
import type { Orcamento, ItemOrcamento, StatusOrcamento } from '@/lib/types'
import { getOrcamentos, saveOrcamentos, getAndIncrementNumero } from '@/lib/storage'

export interface OrcamentoInput {
  cliente_nome: string
  cliente_tel?: string
  tipo_evento: string
  data_evento?: string
  observacoes?: string
  desconto: number           // centavos
  itens: ItemOrcamento[]
}

export function useOrcamentos() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>(() =>
    // Mais recentes primeiro
    [...getOrcamentos()].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  )

  const refresh = useCallback(() => {
    const sorted = [...getOrcamentos()].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    setOrcamentos(sorted)
  }, [])

  const getOrcamento = useCallback((id: string): Orcamento | undefined => {
    return getOrcamentos().find((o) => o.id === id)
  }, [])

  const createOrcamento = useCallback((input: OrcamentoInput): Orcamento => {
    const agora = new Date().toISOString()
    const novo: Orcamento = {
      id: crypto.randomUUID(),
      numero: getAndIncrementNumero(),
      status: 'rascunho',
      created_at: agora,
      updated_at: agora,
      cliente_nome: input.cliente_nome.trim(),
      cliente_tel: input.cliente_tel?.trim(),
      tipo_evento: input.tipo_evento,
      data_evento: input.data_evento || undefined,
      observacoes: input.observacoes?.trim() || undefined,
      desconto: input.desconto,
      itens: input.itens,
    }
    const todos = [novo, ...getOrcamentos()]
    saveOrcamentos(todos)
    setOrcamentos(todos)
    return novo
  }, [])

  const updateOrcamento = useCallback((id: string, input: Partial<OrcamentoInput>): void => {
    const agora = new Date().toISOString()
    const todos = getOrcamentos().map((o) =>
      o.id === id ? { ...o, ...input, updated_at: agora } : o
    )
    saveOrcamentos(todos)
    const sorted = [...todos].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    setOrcamentos(sorted)
  }, [])

  const updateStatus = useCallback((id: string, status: StatusOrcamento): void => {
    const agora = new Date().toISOString()
    const todos = getOrcamentos().map((o) =>
      o.id === id ? { ...o, status, updated_at: agora } : o
    )
    saveOrcamentos(todos)
    const sorted = [...todos].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    setOrcamentos(sorted)
  }, [])

  const deleteOrcamento = useCallback((id: string): void => {
    const todos = getOrcamentos().filter((o) => o.id !== id)
    saveOrcamentos(todos)
    setOrcamentos(todos)
  }, [])

  const duplicarOrcamento = useCallback((id: string): Orcamento | undefined => {
    const original = getOrcamentos().find((o) => o.id === id)
    if (!original) return undefined
    const agora = new Date().toISOString()
    const copia: Orcamento = {
      ...original,
      id: crypto.randomUUID(),
      numero: getAndIncrementNumero(),
      status: 'rascunho',
      created_at: agora,
      updated_at: agora,
      itens: original.itens.map((item) => ({ ...item, id: crypto.randomUUID() })),
    }
    const todos = [copia, ...getOrcamentos()]
    saveOrcamentos(todos)
    const sorted = [...todos].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    setOrcamentos(sorted)
    return copia
  }, [])

  return {
    orcamentos,
    refresh,
    getOrcamento,
    createOrcamento,
    updateOrcamento,
    updateStatus,
    deleteOrcamento,
    duplicarOrcamento,
  }
}
