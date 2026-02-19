import { useState, useRef } from 'react'
import { Save, Download, Upload, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '@/components/layout/AppShell'
import { useConfig } from '@/hooks/useConfig'
import { exportBackup, importBackup, type BackupData } from '@/lib/storage'

export function Configuracoes() {
  const { config, updateConfig } = useConfig()
  const [nomeNegocio, setNomeNegocio] = useState(config.nome_negocio)
  const [telefone, setTelefone] = useState(config.telefone ?? '')
  const [instagram, setInstagram] = useState(config.instagram ?? '')
  const [pix, setPix] = useState(config.pix ?? '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleSalvar() {
    updateConfig({
      nome_negocio: nomeNegocio.trim() || 'Katia Doces',
      telefone: telefone.trim(),
      instagram: instagram.trim(),
      pix: pix.trim(),
    })
    toast.success('Configurações salvas!')
  }

  // ---- Exportar backup ----
  function handleExportar() {
    const data = exportBackup()
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `katia-doces-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Backup exportado com sucesso!')
  }

  // ---- Importar backup ----
  function handleImportar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as BackupData
        importBackup(data)
        toast.success('Backup importado! Recarregando...')
        setTimeout(() => window.location.reload(), 1000)
      } catch (err) {
        toast.error('Arquivo inválido. Verifique se é um backup do Katia Doces.')
      }
    }
    reader.readAsText(file)

    // Reset input para permitir importar o mesmo arquivo novamente
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <AppShell title="Configurações">
      <div className="p-4 space-y-6">

        {/* ---- Informações do negócio ---- */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Informações do negócio
          </h2>
          <p className="text-xs text-gray-500">
            Essas informações aparecem nos orçamentos em PDF.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome do negócio</label>
              <input
                type="text"
                value={nomeNegocio}
                onChange={(e) => setNomeNegocio(e.target.value)}
                placeholder="Katia Doces"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm outline-none focus:border-pink-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp / Telefone</label>
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm outline-none focus:border-pink-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Instagram</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="katiadoces"
                  className="w-full pl-8 pr-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm outline-none focus:border-pink-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Chave Pix</label>
              <input
                type="text"
                value={pix}
                onChange={(e) => setPix(e.target.value)}
                placeholder="CPF, e-mail ou celular"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm outline-none focus:border-pink-400 transition-colors"
              />
            </div>
          </div>

          <button
            onClick={handleSalvar}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-2xl transition-colors text-sm"
          >
            <Save className="w-4 h-4" />
            Salvar configurações
          </button>
        </section>

        {/* Divisor */}
        <div className="border-t border-gray-200" />

        {/* ---- Backup ---- */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Backup dos dados
          </h2>

          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              Os dados ficam salvos <strong>apenas neste celular</strong>. Exporte o backup regularmente
              para não perder seus orçamentos se trocar de dispositivo ou limpar o navegador.
            </p>
          </div>

          {/* Exportar */}
          <button
            onClick={handleExportar}
            className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-pink-200 text-pink-600 font-semibold rounded-2xl hover:bg-pink-50 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Exportar backup (.json)
          </button>

          {/* Importar */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportar}
              className="hidden"
              id="import-backup"
            />
            <label
              htmlFor="import-backup"
              className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-gray-200 text-gray-600 font-semibold rounded-2xl hover:bg-gray-50 transition-colors text-sm cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Importar backup
            </label>
            <p className="text-xs text-gray-400 mt-1 text-center">
              ⚠️ Substituirá todos os dados atuais
            </p>
          </div>
        </section>

      </div>
    </AppShell>
  )
}
