import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '@/components/layout/AppShell'
import { ProdutoCombobox } from '@/components/orcamento/ProdutoCombobox'
import { ItemRow } from '@/components/orcamento/ItemRow'
import { useProdutos } from '@/hooks/useProdutos'
import { useOrcamentos } from '@/hooks/useOrcamentos'
import type { ItemOrcamento, Produto } from '@/lib/types'
import { TIPOS_EVENTO as TIPOS, calcularSubtotal, calcularTotal } from '@/lib/types'
import { formatCurrency, formatInputCurrency, parseCurrency, sanitizeCurrencyInput } from '@/lib/utils'

type Mode = 'novo' | 'editar'

export function OrcamentoForm() {
  const { id } = useParams<{ id?: string }>()
  const mode: Mode = id ? 'editar' : 'novo'
  const navigate = useNavigate()

  const { produtosAtivos } = useProdutos()
  const { getOrcamento, createOrcamento, updateOrcamento } = useOrcamentos()

  // Form state
  const [clienteNome, setClienteNome] = useState('')
  const [clienteTel, setClienteTel] = useState('')
  const [tipoEvento, setTipoEvento] = useState(TIPOS[0] as string)
  const [dataEvento, setDataEvento] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [desconto, setDesconto] = useState('')
  const [validadeDias, setValidadeDias] = useState('7')
  const [itens, setItens] = useState<ItemOrcamento[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Carregar dados para edição
  useEffect(() => {
    if (mode === 'editar' && id) {
      const orcamento = getOrcamento(id)
      if (!orcamento) {
        toast.error('Orçamento não encontrado')
        navigate('/')
        return
      }
      setClienteNome(orcamento.cliente_nome)
      setClienteTel(orcamento.cliente_tel ?? '')
      setTipoEvento(orcamento.tipo_evento)
      setDataEvento(orcamento.data_evento ?? '')
      setObservacoes(orcamento.observacoes ?? '')
      setDesconto(formatInputCurrency(orcamento.desconto))
      setValidadeDias(orcamento.validade_dias != null ? String(orcamento.validade_dias) : '7')
      setItens(orcamento.itens)
    }
  }, [mode, id, getOrcamento, navigate])

  // Handlers de itens
  function addProdutoDosCatalogo(produto: Produto) {
    const novoItem: ItemOrcamento = {
      id: crypto.randomUUID(),
      produto_id: produto.id,
      nome_produto: produto.nome,
      preco_unit: produto.preco_unit,
      quantidade: 1,
      unidade: produto.unidade,
    }
    setItens((prev) => [...prev, novoItem])
  }

  function addItemPersonalizado() {
    const novoItem: ItemOrcamento = {
      id: crypto.randomUUID(),
      nome_produto: '',
      preco_unit: 0,
      quantidade: 1,
      unidade: 'un',
    }
    setItens((prev) => [...prev, novoItem])
  }

  function updateItem(itemId: string, updates: Partial<ItemOrcamento>) {
    setItens((prev) =>
      prev.map((item) => item.id === itemId ? { ...item, ...updates } : item)
    )
  }

  function removeItem(itemId: string) {
    setItens((prev) => prev.filter((item) => item.id !== itemId))
  }

  // Totais
  const subtotal = calcularSubtotal(itens)
  const descontoCentavos = parseCurrency(desconto)
  const total = calcularTotal(itens, descontoCentavos)

  // Validação
  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!clienteNome.trim()) errs.clienteNome = 'Nome do cliente é obrigatório'
    if (!tipoEvento) errs.tipoEvento = 'Tipo do evento é obrigatório'
    if (itens.length === 0) errs.itens = 'Adicione pelo menos um item'
    const itensInvalidos = itens.filter((i) => !i.nome_produto.trim() || i.preco_unit <= 0)
    if (itensInvalidos.length > 0) errs.itens = 'Preencha nome e preço de todos os itens'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function buildInput() {
    const validadeNum = parseInt(validadeDias, 10)
    return {
      cliente_nome: clienteNome.trim(),
      cliente_tel: clienteTel.trim() || undefined,
      tipo_evento: tipoEvento,
      data_evento: dataEvento || undefined,
      observacoes: observacoes.trim() || undefined,
      desconto: descontoCentavos,
      validade_dias: !isNaN(validadeNum) && validadeNum > 0 ? validadeNum : undefined,
      itens,
    }
  }

  function handleSalvarRascunho() {
    if (!clienteNome.trim()) {
      toast.error('Informe o nome do cliente')
      return
    }
    if (mode === 'novo') {
      const novo = createOrcamento(buildInput())
      toast.success('Rascunho salvo!')
      navigate(`/orcamento/${novo.id}`)
    } else if (id) {
      updateOrcamento(id, buildInput())
      toast.success('Rascunho atualizado!')
      navigate(`/orcamento/${id}`)
    }
  }

  function handleFinalizar() {
    if (!validate()) {
      toast.error('Corrija os campos destacados')
      return
    }
    if (mode === 'novo') {
      const novo = createOrcamento(buildInput())
      toast.success('Orçamento criado!')
      navigate(`/orcamento/${novo.id}`)
    } else if (id) {
      updateOrcamento(id, buildInput())
      toast.success('Orçamento atualizado!')
      navigate(`/orcamento/${id}`)
    }
  }

  return (
    <AppShell
      title={mode === 'novo' ? 'Novo orçamento' : 'Editar orçamento'}
      backHref={mode === 'editar' && id ? `/orcamento/${id}` : '/'}
      hideNav
    >
      <div className="p-4 space-y-6 pb-36">

        {/* ---- Seção: Cliente ---- */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Dados do cliente
          </h2>

          {/* Nome */}
          <div>
            <input
              type="text"
              value={clienteNome}
              onChange={(e) => setClienteNome(e.target.value)}
              placeholder="Nome do cliente *"
              className={`w-full px-4 py-3.5 rounded-2xl border text-sm transition-colors outline-none ${
                errors.clienteNome
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-200 bg-white focus:border-pink-400'
              }`}
              autoFocus={mode === 'novo'}
            />
            {errors.clienteNome && (
              <p className="text-xs text-red-500 mt-1 ml-1">{errors.clienteNome}</p>
            )}
          </div>

          {/* Telefone */}
          <input
            type="tel"
            value={clienteTel}
            onChange={(e) => setClienteTel(e.target.value)}
            placeholder="WhatsApp / Telefone"
            className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm outline-none focus:border-pink-400 transition-colors"
          />

          {/* Tipo de evento + Data */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <select
                value={tipoEvento}
                onChange={(e) => setTipoEvento(e.target.value)}
                className={`w-full px-4 py-3.5 rounded-2xl border text-sm outline-none transition-colors ${
                  errors.tipoEvento
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-200 bg-white focus:border-pink-400'
                }`}
              >
                {TIPOS.map((tipo) => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
                <option value="Outro">Outro</option>
              </select>
              {errors.tipoEvento && (
                <p className="text-xs text-red-500 mt-1 ml-1">{errors.tipoEvento}</p>
              )}
            </div>
            <input
              type="date"
              value={dataEvento}
              onChange={(e) => setDataEvento(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm outline-none focus:border-pink-400 transition-colors"
            />
          </div>
        </section>

        {/* ---- Seção: Itens ---- */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Itens do orçamento
          </h2>

          {/* Busca de produto */}
          <ProdutoCombobox
            produtos={produtosAtivos}
            onSelect={addProdutoDosCatalogo}
            onAddPersonalizado={addItemPersonalizado}
          />

          {/* Itens */}
          {itens.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-2xl">
              <p className="text-sm text-gray-400">
                Busque um produto acima ou adicione um item personalizado
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {itens.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onUpdate={updateItem}
                  onRemove={removeItem}
                />
              ))}
            </div>
          )}

          {errors.itens && (
            <p className="text-xs text-red-500 ml-1">{errors.itens}</p>
          )}
        </section>

        {/* ---- Seção: Validade + Observações ---- */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Condições
          </h2>

          {/* Validade */}
          <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-200 px-4 py-3">
            <span className="text-sm text-gray-600 flex-1">Validade do orçamento</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                value={validadeDias}
                onChange={(e) => setValidadeDias(e.target.value)}
                min={1}
                max={365}
                className="w-16 text-center px-2 py-1 rounded-xl border border-gray-200 text-sm outline-none focus:border-pink-400 transition-colors"
              />
              <span className="text-sm text-gray-500">dias</span>
            </div>
          </div>

          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Observações, combinados, forma de entrega..."
            rows={3}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm outline-none focus:border-pink-400 transition-colors resize-none"
          />
        </section>

        {/* ---- Seção: Totais ---- */}
        <section className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
          {/* Subtotal */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium text-gray-800">{formatCurrency(subtotal)}</span>
          </div>

          {/* Desconto */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-gray-500">Desconto</span>
            <div className="relative w-36">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">R$</span>
              <input
                type="text"
                inputMode="decimal"
                value={desconto}
                onChange={(e) => setDesconto(sanitizeCurrencyInput(e.target.value))}
                onFocus={(e) => e.target.select()}
                placeholder="0,00"
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-sm text-right outline-none focus:border-pink-400 transition-colors"
              />
            </div>
          </div>

          {/* Divisor */}
          <div className="border-t border-gray-100" />

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="text-xl font-bold text-pink-600">{formatCurrency(total)}</span>
          </div>
        </section>

      </div>

      {/* Botões fixos no rodapé */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-gray-200 p-4 flex gap-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
      >
        <button
          type="button"
          onClick={handleSalvarRascunho}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          Salvar rascunho
        </button>
        <button
          type="button"
          onClick={handleFinalizar}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold transition-colors"
        >
          <CheckCircle2 className="w-4 h-4" />
          Finalizar
        </button>
      </div>
    </AppShell>
  )
}
