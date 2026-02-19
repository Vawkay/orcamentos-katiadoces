import type { Config, Orcamento, Produto } from './types'

// ============================================================
// CHAVES DO LOCALSTORAGE
// ============================================================
const KEYS = {
  PRODUTOS: 'katia_produtos',
  ORCAMENTOS: 'katia_orcamentos',
  CONFIG: 'katia_config',
} as const

// ============================================================
// HELPERS GENÉRICOS
// ============================================================

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

// ============================================================
// PRODUTOS
// ============================================================

export function getProdutos(): Produto[] {
  return getItem<Produto[]>(KEYS.PRODUTOS, [])
}

export function saveProdutos(produtos: Produto[]): void {
  setItem(KEYS.PRODUTOS, produtos)
}

// ============================================================
// ORÇAMENTOS
// ============================================================

export function getOrcamentos(): Orcamento[] {
  return getItem<Orcamento[]>(KEYS.ORCAMENTOS, [])
}

export function saveOrcamentos(orcamentos: Orcamento[]): void {
  setItem(KEYS.ORCAMENTOS, orcamentos)
}

// ============================================================
// CONFIG
// ============================================================

const DEFAULT_CONFIG: Config = {
  proximo_numero: 1,
  nome_negocio: 'Katia Doces',
  telefone: '',
  instagram: '',
  pix: '',
}

export function getConfig(): Config {
  return { ...DEFAULT_CONFIG, ...getItem<Partial<Config>>(KEYS.CONFIG, {}) }
}

export function saveConfig(config: Config): void {
  setItem(KEYS.CONFIG, config)
}

export function getAndIncrementNumero(): number {
  const config = getConfig()
  const numero = config.proximo_numero
  saveConfig({ ...config, proximo_numero: numero + 1 })
  return numero
}

// ============================================================
// BACKUP / RESTAURAR
// ============================================================

export interface BackupData {
  version: 1
  exported_at: string
  produtos: Produto[]
  orcamentos: Orcamento[]
  config: Config
}

export function exportBackup(): BackupData {
  return {
    version: 1,
    exported_at: new Date().toISOString(),
    produtos: getProdutos(),
    orcamentos: getOrcamentos(),
    config: getConfig(),
  }
}

export function importBackup(data: BackupData): void {
  if (data.version !== 1) {
    throw new Error('Formato de backup inválido ou versão incompatível.')
  }
  saveProdutos(data.produtos ?? [])
  saveOrcamentos(data.orcamentos ?? [])
  saveConfig(data.config ?? DEFAULT_CONFIG)
}
