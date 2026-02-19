import { useParams, useNavigate } from 'react-router-dom'
import logoUrl from '/logo.png'
import { useEffect, useRef } from 'react'
import {
  Pencil, FileDown, Share2, Copy, CheckCircle2, XCircle,
  Send, RotateCcw, Trash2
} from 'lucide-react'
import { toast } from 'sonner'
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
  const printRef = useRef<HTMLDivElement>(null)

  const orcamento = (id ? getOrcamento(id) : undefined)!

  useEffect(() => {
    if (!orcamento && id) {
      toast.error('Orçamento não encontrado')
      navigate('/')
    }
  }, [orcamento, id, navigate])

  if (!orcamento) return null

  const subtotal = calcularSubtotal(orcamento.itens)
  const total = calcularTotal(orcamento.itens, orcamento.desconto)

  // ---- PDF ----
  function handleExportarPDF() {
    // Marca o container para o CSS de impressão
    if (printRef.current) {
      printRef.current.setAttribute('data-print', 'true')
    }
    window.print()
    // Remove a marcação depois (cleanup)
    setTimeout(() => {
      if (printRef.current) {
        printRef.current.removeAttribute('data-print')
      }
    }, 500)
  }

  // ---- WhatsApp / Share ----
  function buildShareText(): string {
    const linhas = [
      `*${config.nome_negocio}* 🍬`,
      `*${formatNumeroOrcamento(orcamento.numero)}*`,
      ``,
      `Cliente: ${orcamento.cliente_nome}`,
      orcamento.cliente_tel ? `Telefone: ${orcamento.cliente_tel}` : '',
      `Evento: ${orcamento.tipo_evento}${orcamento.data_evento ? ` - ${formatDate(orcamento.data_evento)}` : ''}`,
      ``,
      `*Itens:*`,
      ...orcamento.itens.map(
        (item) => `• ${formatQtd(item.quantidade)}x ${item.nome_produto} — ${formatCurrency(item.preco_unit * item.quantidade)}`
      ),
      ``,
      subtotal !== total ? `Subtotal: ${formatCurrency(subtotal)}` : '',
      subtotal !== total ? `Desconto: -${formatCurrency(orcamento.desconto)}` : '',
      `*Total: ${formatCurrency(total)}*`,
      orcamento.observacoes ? `\n_${orcamento.observacoes}_` : '',
    ]
    return linhas.filter(Boolean).join('\n')
  }

  async function handleCompartilhar() {
    const text = buildShareText()
    if (navigator.share) {
      try {
        await navigator.share({ title: `Orçamento ${formatNumeroOrcamento(orcamento.numero)}`, text })
        return
      } catch {
        // fallback para clipboard se o usuário cancelou
      }
    }
    await navigator.clipboard.writeText(text)
    toast.success('Texto copiado para a área de transferência!')
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
    toast.success(`Status atualizado: ${novoStatus}`)
  }

  // ---- Duplicar ----
  function handleDuplicar() {
    const copia = duplicarOrcamento(orcamento.id)
    if (copia) {
      toast.success('Orçamento duplicado!')
      navigate(`/orcamento/${copia.id}`)
    }
  }

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
      {/* ============================================
          LAYOUT DE IMPRESSÃO / PDF
          ============================================ */}
      <div ref={printRef} className="p-4 space-y-4 pb-56">

        {/* Cabeçalho do orçamento (para impressão) */}
        <div className="hidden print:block mb-6 text-center">
          <img src={logoUrl} alt="Katia Doces" className="h-24 w-auto object-contain mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-pink-600">{config.nome_negocio}</h1>
          {config.telefone && <p className="text-sm text-gray-600">Tel: {config.telefone}</p>}
          {config.instagram && <p className="text-sm text-gray-600">Instagram: {config.instagram}</p>}
          {config.pix && <p className="text-sm text-gray-600">Pix: {config.pix}</p>}
          <div className="border-t-2 border-pink-200 mt-3 pt-3">
            <p className="font-bold text-lg">{formatNumeroOrcamento(orcamento.numero)}</p>
            <p className="text-sm text-gray-500">Emitido em {formatDateTime(orcamento.created_at)}</p>
          </div>
        </div>

        {/* Card: Status + Info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-gray-400">{formatNumeroOrcamento(orcamento.numero)}</span>
            <StatusBadge status={orcamento.status} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{orcamento.cliente_nome}</h2>
          {orcamento.cliente_tel && (
            <a
              href={`https://wa.me/55${orcamento.cliente_tel.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-green-600 hover:underline"
            >
              {orcamento.cliente_tel}
            </a>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            <p className="text-sm text-gray-600">
              <span className="text-gray-400">Evento:</span> {orcamento.tipo_evento}
            </p>
            {orcamento.data_evento && (
              <p className="text-sm text-gray-600">
                <span className="text-gray-400">Data:</span> {formatDate(orcamento.data_evento)}
              </p>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Criado em {formatDateTime(orcamento.created_at)}
          </p>
        </div>

        {/* Tabela de itens */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          {/* Cabeçalho da tabela */}
          <div className="grid grid-cols-12 gap-1 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wide">
            <div className="col-span-5">Produto</div>
            <div className="col-span-2 text-center">Qtd</div>
            <div className="col-span-2 text-right">Preço</div>
            <div className="col-span-3 text-right">Total</div>
          </div>

          {/* Linhas */}
          {orcamento.itens.map((item, idx) => (
            <div
              key={item.id}
              className={`grid grid-cols-12 gap-1 px-4 py-3 text-sm ${
                idx !== orcamento.itens.length - 1 ? 'border-b border-gray-50' : ''
              }`}
            >
              <div className="col-span-5 font-medium text-gray-800 truncate pr-1">
                {item.nome_produto}
              </div>
              <div className="col-span-2 text-center text-gray-600">
                {formatQtd(item.quantidade)}{item.unidade !== 'un' ? ` ${item.unidade}` : ''}
              </div>
              <div className="col-span-2 text-right text-gray-600">
                {formatCurrency(item.preco_unit)}
              </div>
              <div className="col-span-3 text-right font-semibold text-gray-800">
                {formatCurrency(item.preco_unit * item.quantidade)}
              </div>
            </div>
          ))}
        </div>

        {/* Totais */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-2">
          {subtotal !== total && (
            <>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Desconto</span>
                <span className="text-red-500">-{formatCurrency(orcamento.desconto)}</span>
              </div>
              <div className="border-t border-gray-100" />
            </>
          )}
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-900">Total</span>
            <span className="text-2xl font-black text-pink-600">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Observações */}
        {orcamento.observacoes && (
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
            <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">Observações</p>
            <p className="text-sm text-amber-900 whitespace-pre-wrap">{orcamento.observacoes}</p>
          </div>
        )}

        {/* Ações de status (ocultas na impressão) */}
        <div className="print:hidden space-y-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Ações</p>

          <div className="flex flex-wrap gap-2">
            {/* Botão Enviado */}
            {orcamento.status === 'rascunho' && (
              <button
                onClick={() => handleStatus('enviado')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                <Send className="w-4 h-4" />
                Marcar como Enviado
              </button>
            )}

            {/* Botão Aprovado */}
            {(orcamento.status === 'rascunho' || orcamento.status === 'enviado') && (
              <button
                onClick={() => handleStatus('aprovado')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Marcar como Aprovado
              </button>
            )}

            {/* Botão Cancelar */}
            {orcamento.status !== 'cancelado' && orcamento.status !== 'aprovado' && (
              <button
                onClick={() => handleStatus('cancelado')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Cancelar
              </button>
            )}

            {/* Reabrir */}
            {orcamento.status === 'cancelado' && (
              <button
                onClick={() => handleStatus('rascunho')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reabrir
              </button>
            )}

            {/* Duplicar */}
            <button
              onClick={handleDuplicar}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              <Copy className="w-4 h-4" />
              Duplicar
            </button>

            {/* Excluir */}
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
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </button>
              )}
            </ConfirmDialog>
          </div>
        </div>

      </div>

      {/* Botões de compartilhamento (fixos no rodapé, ocultos na impressão) */}
      <div className="fixed left-0 right-0 max-w-lg mx-auto bg-white border-t border-gray-200 p-4 print:hidden flex gap-3 z-20"
        style={{ bottom: 'calc(56px + env(safe-area-inset-bottom))' }}
      >
        {/* PDF */}
        <button
          onClick={handleExportarPDF}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <FileDown className="w-4 h-4" />
          PDF
        </button>

        {/* WhatsApp */}
        <button
          onClick={handleWhatsApp}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
        </button>

        {/* Compartilhar */}
        <button
          onClick={handleCompartilhar}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Compartilhar
        </button>
      </div>
    </AppShell>
  )
}
