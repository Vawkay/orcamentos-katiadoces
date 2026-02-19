import type { Produto } from './types'
import { getProdutos, saveProdutos } from './storage'

/** Lista de produtos padrão para popular o catálogo inicial */
const PRODUTOS_INICIAIS: Omit<Produto, 'id' | 'created_at'>[] = [
  { nome: 'Brigadeiro tradicional', preco_unit: 300, unidade: 'un', ativo: true },
  { nome: 'Brigadeiro gourmet', preco_unit: 500, unidade: 'un', ativo: true },
  { nome: 'Beijinho', preco_unit: 300, unidade: 'un', ativo: true },
  { nome: 'Cajuzinho', preco_unit: 300, unidade: 'un', ativo: true },
  { nome: 'Olho de sogra', preco_unit: 300, unidade: 'un', ativo: true },
  { nome: 'Bem-casado', preco_unit: 600, unidade: 'un', ativo: true },
  { nome: 'Palha italiana', preco_unit: 400, unidade: 'un', ativo: true },
  { nome: 'Trufa', preco_unit: 700, unidade: 'un', ativo: true },
  { nome: 'Cake pop', preco_unit: 800, unidade: 'un', ativo: true },
  { nome: 'Pirulito de chocolate', preco_unit: 600, unidade: 'un', ativo: true },
  { nome: 'Caixinha de brigadeiro (dúzia)', preco_unit: 4200, unidade: 'dz', ativo: true },
  { nome: 'Mesa de doces (por pessoa)', preco_unit: 1800, unidade: 'pc', ativo: true },
]

/** Popula o catálogo com produtos padrão se ainda estiver vazio */
export function seedProdutosSeVazio(): void {
  const existentes = getProdutos()
  if (existentes.length > 0) return

  const agora = new Date().toISOString()
  const produtos: Produto[] = PRODUTOS_INICIAIS.map((p) => ({
    ...p,
    id: crypto.randomUUID(),
    created_at: agora,
  }))

  saveProdutos(produtos)
}
