import { useParams, useNavigate } from 'react-router-dom'
import logoUrl from '/logo.png'
import { useRef, useState } from 'react'
import {
  Pencil, Share2, Copy, CheckCircle2, XCircle,
  Send, RotateCcw, Trash2, Image as ImageIcon
} from 'lucide-react'
import { toast } from 'sonner'
import html2canvas from 'html2canvas'
import { AppShell } from '@/components/layout/AppShell'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useOrcamentos } from '@/hooks/useOrcamentos'
import { useConfig } from '@/hooks/useConfig'
import type { StatusOrcamento } from '@/lib/types'
import { calcularSubtotal, calcularTotal } from '@/lib/types'
import {
  formatCurrency, formatDate, formatDateTime,
  formatNumeroOrcamento, formatQtd
} from '@/lib/utils'

export function VisualizarOrcamento() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getOrcamento, updateStatus, deleteOrcamento, duplicarOrcamento } = useOrcamentos()
  const { config } = useConfig()
  const cardRef = useRef<HTMLDivElement>(null)
  const [gerando, setGerando] = useState(false)

  const orcamento = (id ? getOrcamento(id) : undefined)!

  if (!orcamento) {
    navigate('/')
    return null
  }

  const subtotal = calcularSubtotal(orcamento.itens)
  const total = calcularTotal(orcamento.itens, orcamento.desconto)

  // Calcular data de validade
  function getDataValidade(): string | null {
    if (!orcamento.validade_dias) return null
    const d = new Date(orcamento.created_at)
    d.setDate(d.getDate() + orcamento.validade_dias)
    return formatDate(d.toISOString().slice(0, 10))
  }

  // ---- Gerar imagem ----
  async function gerarImagem(): Promise<HTMLCanvasElement | null> {
    if (!cardRef.current) return null
    setGerando(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      })
      return canvas
    } finally {
      setGerando(false)
    }
  }

  async function handleSalvarImagem() {
    const canvas = await gerarImagem()
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `orcamento-${formatNumeroOrcamento(orcamento.numero)}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    toast.success('Imagem salva!')
  }

  async function handleCompartilharImagem() {
    const canvas = await gerarImagem()
    if (!canvas) return

    canvas.toBlob(async (blob) => {
      if (!blob) return
      const file = new File([blob], `orcamento-${formatNumeroOrcamento(orcamento.numero)}.png`, { type: 'image/png' })

      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            title: `Orçamento ${formatNumeroOrcamento(orcamento.numero)}`,
            files: [file],
          })
          return
        } catch {
          // usuário cancelou, não faz nada
          return
        }
      }

      // Fallback: baixa a imagem
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = file.name
      link.click()
      URL.revokeObjectURL(url)
      toast.success('Imagem baixada — envie pelo WhatsApp!')
    }, 'image/png')
  }

  // ---- WhatsApp (texto) ----
  function buildShareText(): string {
    const validade = getDataValidade()
    const linhas = [
      `*${config.nome_negocio}* 🍬`,
      `*${formatNumeroOrcamento(orcamento.numero)}*`,
      ``,
      `Cliente: ${orcamento.cliente_nome}`,
      orcamento.cliente_tel ? `Telefone: ${orcamento.cliente_tel}` : '',
      `Evento: ${orcamento.tipo_evento}${orcamento.data_evento ? ` — ${formatDate(orcamento.data_evento)}` : ''}`,
      ``,
      `*Itens:*`,
      ...orcamento.itens.map(
        (item) => `• ${formatQtd(item.quantidade)}x ${item.nome_produto} — ${formatCurrency(item.preco_unit * item.quantidade)}`
      ),
      ``,
      subtotal !== total ? `Subtotal: ${formatCurrency(subtotal)}` : '',
      subtotal !== total ? `Desconto: -${formatCurrency(orcamento.desconto)}` : '',
      `*Total: ${formatCurrency(total)}*`,
      validade ? `\n_Válido até ${validade}_` : '',
      orcamento.observacoes ? `\n_${orcamento.observacoes}_` : '',
    ]
    return linhas.filter(Boolean).join('\n')
  }

  function handleWhatsApp() {
    const text = buildShareText()
    const tel = orcamento.cliente_tel?.replace(/\D/g, '')
    const encoded = encodeURIComponent(text)
    const url = tel
      ? `https://wa.me/55${tel}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`
    window.open(url, '_blank')
  }

  // ---- Status ----
  function handleStatus(novoStatus: StatusOrcamento) {
    updateStatus(orcamento.id, novoStatus)
    toast.success(`Status atualizado!`)
  }

  // ---- Duplicar ----
  function handleDuplicar() {
    const copia = duplicarOrcamento(orcamento.id)
    if (copia) {
      toast.success('Orçamento duplicado!')
      navigate(`/orcamento/${copia.id}`)
    }
  }

  const dataValidade = getDataValidade()

  return (
    <AppShell
      title={formatNumeroOrcamento(orcamento.numero)}
      backHref="/"
      actions={
        <button
          onClick={() => navigate(`/editar/${orcamento.id}`)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Editar"
        >
          <Pencil className="w-4 h-4 text-gray-600" />
        </button>
      }
    >
      <div className="p-4 space-y-4 pb-56">

        {/* =============================================
            CARD VISUAL (gerado como imagem)
        ============================================= */}
        <div
          ref={cardRef}
          className="rounded-3xl overflow-hidden shadow-lg"
          style={{ fontFamily: 'system-ui, sans-serif' }}
        >
          {/* Cabeçalho rosa */}
          <div className="bg-gradient-to-br from-pink-500 to-rose-500 px-5 pt-6 pb-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <img
                src={logoUrl}
                alt="Katia Doces"
                className="h-14 w-auto object-contain"
                crossOrigin="anonymous"
              />
              <div className="text-right">
                <div className="text-xs font-medium opacity-80">Orçamento</div>
                <div className="text-lg font-bold">{formatNumeroOrcamento(orcamento.numero)}</div>
              </div>
            </div>

            <div className="mt-2">
              <div className="text-xs opacity-75 uppercase tracking-wide">Cliente</div>
              <div className="text-xl font-bold leading-tight">{orcamento.cliente_nome}</div>
              {orcamento.cliente_tel && (
                <div className="text-sm opacity-80 mt-0.5">{orcamento.cliente_tel}</div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 mt-3">
              <div>
                <div className="text-xs opacity-75 uppercase tracking-wide">Evento</div>
                <div className="text-sm font-semibold">{orcamento.tipo_evento}</div>
              </div>
              {orcamento.data_evento && (
                <div>
                  <div className="text-xs opacity-75 uppercase tracking-wide">Data</div>
                  <div className="text-sm font-semibold">{formatDate(orcamento.data_evento)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Corpo branco */}
          <div className="bg-white px-5 pb-5">
            {/* Aba de corte */}
            <div className="flex mb-4 -mt-0">
              <div className="w-5 h-5 bg-gray-100 rounded-br-full" />
              <div className="flex-1 h-5 bg-gray-100" />
              <div className="w-5 h-5 bg-gray-100 rounded-bl-full" />
            </div>

            {/* Itens */}
            <div className="space-y-2 mb-4">
              {orcamento.itens.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-800">{item.nome_produto}</span>
                    <span className="text-gray-400 ml-1">
                      × {formatQtd(item.quantidade)}{item.unidade !== 'un' ? ` ${item.unidade}` : ''}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-700 ml-3 shrink-0">
                    {formatCurrency(item.preco_unit * item.quantidade)}
                  </span>
                </div>
              ))}
            </div>

            {/* Linha pontilhada */}
            <div className="border-t-2 border-dashed border-gray-200 mb-4" />

            {/* Totais */}
            <div className="space-y-1 mb-4">
              {subtotal !== total && (
                <>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-rose-500">
                    <span>Desconto</span>
                    <span>-{formatCurrency(orcamento.desconto)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between items-center mt-1">
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="text-2xl font-black text-pink-600">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Validade + Observações */}
            {(dataValidade || orcamento.observacoes) && (
              <div className="bg-pink-50 rounded-2xl px-4 py-3 space-y-1">
                {dataValidade && (
                  <p className="text-xs text-pink-600 font-medium">
                    ⏳ Válido até {dataValidade}
                  </p>
                )}
                {orcamento.observacoes && (
                  <p className="text-xs text-gray-600 whitespace-pre-wrap">{orcamento.observacoes}</p>
                )}
              </div>
            )}

            {/* Rodapé do card */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <div className="text-xs text-gray-400">
                {formatDateTime(orcamento.created_at)}
              </div>
              {config.instagram && (
                <div className="text-xs text-pink-500 font-medium">
                  {config.instagram}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info de status (fora do card) */}
        <div className="flex items-center justify-between px-1">
          <StatusBadge status={orcamento.status} />
          <span className="text-xs text-gray-400">
            Atualizado {formatDateTime(orcamento.updated_at)}
          </span>
        </div>

        {/* Ações de status */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide px-1">Ações</p>
          <div className="flex flex-wrap gap-2">
            {orcamento.status === 'rascunho' && (
              <button
                onClick={() => handleStatus('enviado')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                <Send className="w-4 h-4" /> Marcar como Enviado
              </button>
            )}
            {(orcamento.status === 'rascunho' || orcamento.status === 'enviado') && (
              <button
                onClick={() => handleStatus('aprovado')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" /> Aprovado
              </button>
            )}
            {orcamento.status !== 'cancelado' && orcamento.status !== 'aprovado' && (
              <button
                onClick={() => handleStatus('cancelado')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
              >
                <XCircle className="w-4 h-4" /> Cancelar
              </button>
            )}
            {orcamento.status === 'cancelado' && (
              <button
                onClick={() => handleStatus('rascunho')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Reabrir
              </button>
            )}
            <button
              onClick={handleDuplicar}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              <Copy className="w-4 h-4" /> Duplicar
            </button>
            <ConfirmDialog
              title="Excluir orçamento?"
              description={`O orçamento ${formatNumeroOrcamento(orcamento.numero)} de ${orcamento.cliente_nome} será excluído permanentemente.`}
              confirmLabel="Excluir"
              destructive
              onConfirm={() => {
                deleteOrcamento(orcamento.id)
                toast.success('Orçamento excluído')
                navigate('/')
              }}
            >
              {(open) => (
                <button
                  onClick={open}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Excluir
                </button>
              )}
            </ConfirmDialog>
          </div>
        </div>

      </div>

      {/* Botões de compartilhamento fixos no rodapé */}
      <div
        className="fixed left-0 right-0 max-w-lg mx-auto bg-white border-t border-gray-200 p-3 flex gap-2 z-20"
        style={{ bottom: 'calc(56px + env(safe-area-inset-bottom))' }}
      >
        {/* Salvar imagem */}
        <button
          onClick={handleSalvarImagem}
          disabled={gerando}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <ImageIcon className="w-4 h-4" />
          {gerando ? 'Gerando...' : 'Salvar'}
        </button>

        {/* Compartilhar imagem */}
        <button
          onClick={handleCompartilharImagem}
          disabled={gerando}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
        >
          <Share2 className="w-4 h-4" />
          {gerando ? '...' : 'Compartilhar'}
        </button>

        {/* WhatsApp (texto) */}
        <button
          onClick={handleWhatsApp}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
        </button>
      </div>
    </AppShell>
  )
}
