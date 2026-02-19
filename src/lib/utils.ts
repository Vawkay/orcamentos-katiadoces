import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================
// FORMATAÇÃO MONETÁRIA
// ============================================================

/** Formata centavos para BRL: 1250 → "R$ 12,50" */
export function formatCurrency(centavos: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(centavos / 100)
}

/** Converte string de input ("12,50" ou "12.50") para centavos */
export function parseCurrency(value: string): number {
  if (!value) return 0
  // Remove símbolos de moeda e espaços, normaliza separador decimal
  const cleaned = value.replace(/[R$\s]/g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  if (isNaN(num)) return 0
  return Math.round(num * 100)
}

/** Formata centavos para string de input: 1250 → "12,50" */
export function formatInputCurrency(centavos: number): string {
  if (centavos === 0) return ''
  return (centavos / 100).toFixed(2).replace('.', ',')
}

// ============================================================
// FORMATAÇÃO DE DATAS
// ============================================================

/** Formata ISO date para exibição: "2025-12-31" → "31/12/2025" */
export function formatDate(isoDate?: string): string {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

/** Formata ISO timestamp para exibição curta */
export function formatDateTime(isoTimestamp: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoTimestamp))
}

/** Retorna data de hoje no formato ISO: "2025-12-31" */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

// ============================================================
// FORMATAÇÃO DE QUANTIDADE
// ============================================================

/** Formata quantidade: 1 → "1", 1.5 → "1,5", 12 → "12" */
export function formatQtd(qty: number): string {
  return qty % 1 === 0 ? qty.toString() : qty.toFixed(1).replace('.', ',')
}

// ============================================================
// NÚMERO DO ORÇAMENTO
// ============================================================

/** Formata número do orçamento: 5 → "ORC-005" */
export function formatNumeroOrcamento(numero: number): string {
  return `ORC-${String(numero).padStart(3, '0')}`
}
