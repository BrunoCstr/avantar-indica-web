"use client"

import { useState, useEffect, useCallback } from "react"
import { BackButton } from "@/components/back-button"
import { BottomNav } from "@/components/bottom-nav"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { PageContainer, PageBackground } from "@/components/page-container"
import { Search, SlidersHorizontal, Clipboard, LayersIcon, X } from "lucide-react"
import { useAuth } from "@/context/Auth"
import { 
  subscribeToStatusItems, 
  filterStatusItems, 
  getStatusStats,
  UnifiedStatusItem,
  getInitials,
  limitText,
  getStatusColor,
  getStatusBgColor,
  formatPhoneForDisplay
} from "@/services/status/status"
import { formatTimeAgo } from "@/utils/formatTimeAgo"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

export default function StatusPage() {
  const { userData } = useAuth()
  const [search, setSearch] = useState("")
  const [showFilter, setShowFilter] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusItems, setStatusItems] = useState<UnifiedStatusItem[]>([])
  const [selectedBulk, setSelectedBulk] = useState<UnifiedStatusItem | null>(null)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [selectedDetail, setSelectedDetail] = useState<UnifiedStatusItem | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const filterOptions = [
    // Filtros por tipo
    'APENAS OPORTUNIDADES',
    'APENAS INDICAÇÕES',
    'APENAS LOTES EM MASSA',
    // Separador visual (não será usado como filtro real)
    '---',
    // Filtros por status
    'PENDENTE CONTATO',
    'CONTATO REALIZADO',
    'INICIO DE PROPOSTA',
    'PROPOSTA APRESENTADA',
    'AGUARDANDO CLIENTE',
    'AGUARDANDO PAGAMENTO',
    'FECHADO',
    'NÃO FECHADO',
    'NÃO INTERESSOU',
    'SEGURO RECUSADO',
  ]

  // Subscrever aos dados do Firestore em tempo real
  useEffect(() => {
    if (!userData?.uid) return

    setIsLoading(true)

    const unsubscribe = subscribeToStatusItems(
      userData.uid,
      (items) => {
        setStatusItems(items)
        setIsLoading(false)
        setRefreshing(false)
      },
      (error) => {
        console.error('Erro ao buscar status:', error)
        setIsLoading(false)
        setRefreshing(false)
      }
    )

    return () => unsubscribe()
  }, [userData?.uid])

  // Função do Pull Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true)
    // A atualização acontecerá automaticamente via listeners do Firestore
    // O setRefreshing(false) será chamado quando os dados forem atualizados
    
    // Timeout de segurança caso não haja atualizações
    setTimeout(() => {
      setRefreshing(false)
    }, 3000)
  }, [])

  // Filtrar dados baseado na busca e filtros selecionados
  const filteredData = filterStatusItems(statusItems, search, selectedFilters)

  // Calcular estatísticas
  const stats = getStatusStats(statusItems)

  const handleSelectFilter = (option: string) => {
    if (option === '---') return // Ignora o separador
    
    if (selectedFilters.includes(option)) {
      setSelectedFilters(selectedFilters.filter(item => item !== option))
    } else {
      setSelectedFilters([...selectedFilters, option])
    }
  }

  // Componente de Dropdown de Filtros
  const FilterDropdown = () => {
    if (!showFilter) return null

    return (
      <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-[#190d26] border border-gray-200 dark:border-tertiary-purple rounded-xl shadow-lg z-50 overflow-hidden">
        <ScrollArea className="max-h-96">
          <div className="p-2">
            {filterOptions.map((option, index) => {
              if (option === '---') {
                return <div key={index} className="border-t border-gray-200 dark:border-tertiary-purple my-2" />
              }
              
              const isSelected = selectedFilters.includes(option)
              
              return (
                <button
                  key={option}
                  onClick={() => handleSelectFilter(option)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                    isSelected
                      ? 'bg-[#4A04A5] text-white font-semibold'
                      : 'hover:bg-gray-100 dark:hover:bg-[#4A04A5]/20 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    )
  }

  // Modal de detalhes do lote em massa
  const BulkModal = () => {
    if (!selectedBulk) return null

    const progress = Math.min(Number(selectedBulk.progress) || 0, 100)

    return (
      <Dialog open={showBulkModal} onOpenChange={setShowBulkModal}>
        <DialogContent className="max-w-md">
          <DialogHeader className="bg-[#4A04A5] -m-6 mb-6 p-6 rounded-t-lg border-b-4 border-[#C352F2]">
            <DialogTitle className="text-white text-xl">Detalhes do Lote</DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[450px] pr-4">
            {/* Card de progresso */}
            <div className="mb-5">
              <p className="text-[#4A04A5] dark:text-white text-sm font-semibold mb-3">
                ⚡ Progresso
              </p>
              
              <div className="bg-white dark:bg-[#190d26] h-4 rounded-full overflow-hidden mb-2 border border-[#4A04A5]/20">
                <div
                  className="h-full bg-[#4A04A5] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <p className="text-[#4A04A5] dark:text-white text-base font-bold text-center">
                {progress}% concluído
              </p>
            </div>

            {/* Cards de estatísticas */}
            <div className="flex gap-3 mb-6">
              <div className="flex-1 bg-white dark:bg-[#190d26] rounded-xl p-4 border border-blue-500/20">
                <p className="text-gray-600 dark:text-gray-400 text-xs font-semibold mb-1">
                  Total
                </p>
                <p className="text-black dark:text-white text-xl font-bold">
                  {selectedBulk.total || 0}
                </p>
              </div>

              <div className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-500/20">
                <p className="text-gray-600 dark:text-gray-400 text-xs font-semibold mb-1">
                  Processadas
                </p>
                <p className="text-green-600 dark:text-green-400 text-xl font-bold">
                  {selectedBulk.processed || 0}
                </p>
              </div>
            </div>

            {/* Card de data */}
            {selectedBulk.updatedAt && (
              <div className="mb-5">
                <p className="text-gray-600 dark:text-gray-400 text-xs font-semibold">
                  Enviado {selectedBulk.updatedAt}
                </p>
              </div>
            )}

            {/* Card de status */}
            <div className="mb-5">
              <p className="text-[#4A04A5] dark:text-white text-sm font-semibold mb-2">
                Status
              </p>
              <div className={`rounded-lg p-3 border ${
                selectedBulk.status === 'Em Andamento'
                  ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                  : selectedBulk.status === 'Concluído'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-gray-50 dark:bg-gray-800/20 border-gray-200 dark:border-gray-700'
              }`}>
                <p className={`text-base font-medium ${
                  selectedBulk.status === 'Em Andamento'
                    ? 'text-orange-600 dark:text-orange-400'
                    : selectedBulk.status === 'Concluído'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {selectedBulk.status}
                </p>
              </div>
            </div>

            {/* Lista de indicações */}
            <div>
              <p className="text-[#4A04A5] dark:text-white text-sm font-semibold mb-2">
                Indicações ({selectedBulk.indications?.length || 0})
              </p>

              {selectedBulk.indications && selectedBulk.indications.length > 0 ? (
                <div className="bg-white dark:bg-[#190d26] rounded-lg p-3 border border-[#4A04A5]/10">
                  <ScrollArea className="max-h-32">
                    {selectedBulk.indications.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className={`flex items-center py-2 ${
                          idx < selectedBulk.indications!.length - 1 ? 'border-b border-[#4A04A5]/5' : ''
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full bg-[#4A04A5] mr-3" />
                        <p className="text-sm text-black dark:text-white flex-1">
                          {item.name}
                        </p>
                        {item.phone && (
                          <p className="text-xs text-[#4A04A5] dark:text-[#C352F2] font-medium">
                            {formatPhoneForDisplay(item.phone)}
                          </p>
                        )}
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              ) : (
                <div className="bg-white dark:bg-[#190d26] rounded-lg p-4 border border-[#4A04A5]/10 text-center">
                  <Clipboard className="w-6 h-6 text-[#4A04A5] mx-auto mb-2 opacity-70" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Nenhuma indicação encontrada neste lote.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    )
  }

  // Modal de detalhes de indicação/oportunidade
  const DetailModal = () => {
    if (!selectedDetail) return null

    return (
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-md border-0">
          <DialogHeader className="bg-[#4A04A5] -m-6 mb-6 p-6 rounded-t-lg border-b-4 border-[#C352F2]">
            <DialogTitle className="text-white text-xl">
              Detalhes da {selectedDetail.type === 'opportunity' ? 'Oportunidade' : 'Indicação'}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[400px] pr-4">
            {/* Card de data */}
            {selectedDetail.updatedAt && (
              <div className="mb-5">
                <p className="text-gray-600 dark:text-gray-400 text-xs font-semibold">
                  Última atualização: {selectedDetail.updatedAt}
                </p>
              </div>
            )}

            {/* Nome */}
            <div className="mb-5">
              <p className="text-[#4A04A5] dark:text-white text-sm font-semibold mb-2">
                Nome
              </p>
              <div className="bg-white dark:bg-[#190d26] rounded-lg p-3 border border-[#4A04A5]/10">
                <p className="text-black dark:text-white text-base font-medium">
                  {selectedDetail.name}
                </p>
              </div>
            </div>

            {/* Produto */}
            <div className="mb-5">
              <p className="text-[#4A04A5] dark:text-white text-sm font-semibold mb-2">
                Produto
              </p>
              <div className="bg-white dark:bg-[#190d26] rounded-lg p-3 border border-[#4A04A5]/10">
                <p className="text-black dark:text-white text-base font-medium">
                  {selectedDetail.product}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="mb-5">
              <p className="text-[#4A04A5] dark:text-white text-sm font-semibold mb-2">
                Status
              </p>
              <div className="bg-white dark:bg-[#190d26] rounded-lg p-3 border border-[#4A04A5]/10">
                <Badge
                  style={{
                    backgroundColor: getStatusBgColor(selectedDetail.status),
                    color: getStatusColor(selectedDetail.status),
                  }}
                  className="text-sm font-semibold"
                >
                  {selectedDetail.status}
                </Badge>
              </div>
            </div>

            {/* Card de tipo */}
            <div className="bg-white dark:bg-[#190d26] rounded-xl p-4 border border-[#4A04A5]/10">
              <p className="text-[#820AD1] dark:text-[#C352F2] text-sm font-semibold mb-2">
                {selectedDetail.type === 'opportunity' ? 'Tipo: Oportunidade' : 'Tipo: Indicação'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedDetail.type === 'opportunity'
                  ? 'Esta é uma oportunidade de negócio identificada, ou seja, o lead já está interessado em adquirir o produto.'
                  : 'O tipo ainda está como indicação, isso significa que ou está pendente o contato, ou o contato foi realizado e está aguardando a resposta do lead.'}
              </p>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      <DesktopSidebar />

      <PageContainer className="pb-24 lg:pb-0">
        {/* Background - Mobile: bg-white-responsive | Desktop: cor sólida do tema */}
        <div className="lg:hidden">
          <PageBackground className="bg-white-responsive" />
        </div>
        <div className="hidden lg:block">
          <PageBackground />
        </div>

        <div className="relative z-10 p-6 lg:px-8 lg:py-6">
          <div className="mb-6 flex items-center justify-between lg:border-b lg:border-gray-200 dark:lg:border-tertiary-purple lg:pb-6">
            <div className="flex items-center gap-4">
              <div className="lg:hidden">
                <BackButton bgColor="purple" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[#4A04A5] lg:text-black lg:dark:text-white">Status</h1>
            </div>
            <div className="w-12 lg:hidden" />
          </div>

          {/* Search Bar */}
          <div className="mb-6 relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/80" />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="outline-none w-full border-b-4 border-[#C352F2] bg-[#4A04A5] text-white placeholder:text-white/60 pl-12 pr-14 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#29F3DF]/50"
              />
              <button 
                onClick={() => setShowFilter(!showFilter)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
              >
                {showFilter ? (
                  <X className="w-5 h-5" />
                ) : (
                <SlidersHorizontal className="w-5 h-5" />
                )}
              </button>
              
              <FilterDropdown />
            </div>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            <div className="bg-white dark:lg:bg-[#190d26] rounded-2xl p-3 lg:border-2 border-transparent dark:border-tertiary-purple shadow-md">
              <div className="text-2xl font-bold text-[#4A04A5] lg:text-black lg:dark:text-white mb-2">
                {stats['PENDENTE CONTATO'] || 0}
              </div>
              <div className="text-xs text-black lg:text-black lg:dark:text-gray">Pendente</div>
            </div>

            <div className="bg-white dark:lg:bg-[#190d26] rounded-2xl p-3 lg:border-2 border-transparent dark:border-tertiary-purple shadow-md">
              <div className="text-2xl font-bold text-[#4A04A5] lg:text-black lg:dark:text-white mb-2">
                {(stats['PROPOSTA APRESENTADA'] || 0) +
                  (stats['CONTATO REALIZADO'] || 0) +
                  (stats['AGUARDANDO CLIENTE'] || 0) +
                  (stats['INICIO DE PROPOSTA'] || 0) +
                  (stats['AGUARDANDO PAGAMENTO'] || 0)}
              </div>
              <div className="text-xs text-black lg:text-black lg:dark:text-gray">Em contato</div>
            </div>

            <div className="bg-white dark:lg:bg-[#190d26] rounded-2xl p-3 lg:border-2 border-transparent dark:border-tertiary-purple shadow-md">
              <div className="text-2xl font-bold text-[#4A04A5] lg:text-black lg:dark:text-white mb-2">
                {stats['FECHADO'] || 0}
              </div>
              <div className="text-xs text-black lg:text-black lg:dark:text-gray">Fechados</div>
            </div>

            <div className="bg-white dark:lg:bg-[#190d26] rounded-2xl p-3 lg:border-2 border-transparent dark:border-tertiary-purple shadow-md">
              <div className="text-2xl font-bold text-[#4A04A5] lg:text-black lg:dark:text-white mb-2">
                {(stats['NÃO FECHADO'] || 0) +
                  (stats['SEGURO RECUSADO'] || 0) +
                  (stats['NÃO INTERESSOU'] || 0)}
              </div>
              <div className="text-xs text-black lg:text-black lg:dark:text-gray">Não fechado</div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C352F2]"></div>
              </div>
              <p className="text-black lg:text-black lg:dark:text-gray text-sm">
                Carregando...
              </p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#C352F2]/10 flex items-center justify-center">
                <Clipboard className="w-10 h-10 text-[#C352F2]" />
              </div>
              <h3 className="text-xl font-bold text-[#4A04A5] lg:text-black lg:dark:text-white mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-black lg:text-black lg:dark:text-gray text-sm leading-relaxed px-8">
                {search || selectedFilters.length > 0
                  ? 'Nenhum item corresponde aos filtros aplicados. Tente ajustar sua busca.'
                  : 'Você ainda não possui oportunidades ou indicações registradas. Quando você indicar alguém, elas aparecerão aqui!'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredData.map((item) => {
                if (item.type === 'bulk') {
                  // Card especial para indicação em massa
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedBulk(item)
                        setShowBulkModal(true)
                      }}
                      className="bg-white dark:lg:bg-[#190d26] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-tertiary-purple cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-[#820AD1] flex items-center justify-center mr-4">
                          <LayersIcon className="w-6 h-6 text-white" />
                        </div>

                        {/* Informações */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-[#4A04A5] lg:text-black lg:dark:text-white text-base">
                              Lote em massa
                            </h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              {item.updatedAt}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {item.product}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge
                              style={{
                                backgroundColor: item.status === 'Concluído' ? '#dcfce7' : '#E6DBFF',
                                color: item.status === 'Concluído' ? '#10B981' : '#820AD1',
                              }}
                              className="text-xs font-semibold"
                            >
                              {item.status}
                            </Badge>
                            <Badge className="bg-purple-100 text-[#820AD1] text-xs">
                              Indicação em massa
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                }

                // Card normal para indicação/oportunidade
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedDetail(item)
                      setShowDetailModal(true)
                    }}
                    className="bg-white dark:lg:bg-[#190d26] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-tertiary-purple cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-[#4A04A5] flex items-center justify-center mr-4">
                        <span className="text-white font-bold text-sm">
                          {getInitials(item.name)}
                        </span>
                      </div>

                      {/* Informações */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-[#4A04A5] lg:text-black lg:dark:text-white text-base">
                            {limitText(item.name)}
                          </h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {item.updatedAt}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {item.product}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge
                            style={{
                              backgroundColor: getStatusBgColor(item.status),
                              color: getStatusColor(item.status),
                            }}
                            className="text-xs font-semibold"
                          >
                            {item.status}
                          </Badge>
                          <Badge
                            style={{
                              backgroundColor: item.type === 'opportunity' ? '#dcfce7' : '#dbeafe',
                              color: item.type === 'opportunity' ? '#16a34a' : '#2563eb',
                            }}
                            className="text-xs"
                          >
                            {item.type === 'opportunity' ? 'Oportunidade' : 'Indicação'}
                          </Badge>
              </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              </div>
          )}
        </div>

        <BottomNav />

        {/* Modals */}
        <BulkModal />
        <DetailModal />
      </PageContainer>
    </>
  )
}
