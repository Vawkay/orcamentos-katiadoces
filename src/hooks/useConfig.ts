import { useState, useCallback } from 'react'
import type { Config } from '@/lib/types'
import { getConfig, saveConfig } from '@/lib/storage'

export function useConfig() {
  const [config, setConfig] = useState<Config>(() => getConfig())

  const updateConfig = useCallback((updates: Partial<Config>): void => {
    const novo = { ...getConfig(), ...updates }
    saveConfig(novo)
    setConfig(novo)
  }, [])

  return { config, updateConfig }
}
