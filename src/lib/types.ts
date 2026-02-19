// ============================================================
// TIPOS PRINCIPAIS DO DOMÍNIO
// ============================================================

export type Unidade = 'un' | 'dz' | 'kg' | 'cx' | 'pc'

export interface Produto {
  id: string
  nome: string
  preco_unit: number   // em centavos (ex: R$12,50 = 1250)
  unidade: Unidade
  ativo: boolean
  created_at: string
}

export interface ItemOrcamento {
  id: string
  produto_id?: string       // opcional: pode ser item personalizado
  nome_produto: string      // denormalizado
  preco_unit: number        // denormalizado em centavos
  quantidade: number
  unidade: string
}

export type StatusOrcamento = 'rascunho' | 'enviado' | 'aprovado' | 'cancelado'

export interface Orcamento {
  id: string
  numero: number
  cliente_nome: string
  cliente_tel?: string
  tipo_evento: string
  data_evento?: string     // ISO date string: "2025-12-31"
  status: StatusOrcamento
  observacoes?: string
  desconto: number         // em centavos
  itens: ItemOrcamento[]
  created_at: string
  updated_at: string
}

export interface Config {
  proximo_numero: number
  nome_negocio: string
  telefone?: string
  instagram?: string
  pix?: string
}

// ============================================================
// HELPERS DE CÁLCULO
// ============================================================

export function calcularSubtotal(itens: ItemOrcamento[]): number {
  return itens.reduce((acc, item) => acc + item.preco_unit * item.quantidade, 0)
}

export function calcularTotal(itens: ItemOrcamento[], desconto: number): number {
  return Math.max(0, calcularSubtotal(itens) - desconto)
}

// ============================================================
// TIPOS DOS FORMULÁRIOS
// ============================================================

export interface OrcamentoFormData {
  cliente_nome: string
  cliente_tel: string
  tipo_evento: string
  data_evento: string
  observacoes: string
  desconto_reais: string   // string para o input, convertido na hora de salvar
}

export const TIPOS_EVENTO = [
  'Aniversário',
  'Casamento',
  'Chá de Bebê',
  'Chá Bar / Chá Revelação',
  'Formatura',
  'Corporativo',
  'Batizado',
  'Outro',
] as const

export const LABELS_STATUS: Record<StatusOrcamento, string> = {
  rascunho: 'Rascunho',
  enviado: 'Enviado',
  aprovado: 'Aprovado',
  cancelado: 'Cancelado',
}

export const CORES_STATUS: Record<StatusOrcamento, string> = {
  rascunho: 'bg-gray-100 text-gray-700',
  enviado: 'bg-blue-100 text-blue-700',
  aprovado: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-700',
}
