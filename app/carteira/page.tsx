"use client"

import { useState, useEffect, useCallback } from "react"
import { BackButton } from "@/components/back-button"
import { BottomNav } from "@/components/bottom-nav"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { Eye, EyeOff, DollarSign, RefreshCw } from "lucide-react"
import DashboardChart from "@/components/dashboard-chart"

interface WithdrawalRequest {
  withdrawId: string
  amount: number
  status: "PAGO" | "RECUSADO" | "PENDENTE"
  createdAt: {
    toDate: () => Date
  }
}

interface UserData {
  uid: string
  displayName?: string
  pixKey?: string
  rule?: string
  affiliated_to?: string
  unitName?: string
  profilePicture?: string
}

export default function CarteiraPage() {
  const [data, setData] = useState<WithdrawalRequest[]>([])
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)
  const [showBalance, setShowBalance] = useState(true)
  const [balance, setBalance] = useState(998600.0)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalMessage, setModalMessage] = useState({
    title: '',
    description: '',
  })
  const [isLoadingButton, setIsLoadingButton] = useState(false)
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [valorSaque, setValorSaque] = useState("")

  // Mock user data - substitua pela implementação real do contexto de auth
  const userData: UserData = {
    uid: "mock-user-id",
    displayName: "Usuário Teste",
    pixKey: "test@email.com",
    rule: "vendedor",
    affiliated_to: "unit-001",
    unitName: "Unidade Teste",
    profilePicture: ""
  }

  const isLoading = isLoadingBalance

  useEffect(() => {
    if (!userData?.uid) return

    setIsLoadingBalance(true)

    const fetchData = async () => {
      try {
        // Mock data - substitua pela implementação real da API
        const mockData: WithdrawalRequest[] = [
          {
            withdrawId: "1",
            amount: 700.0,
            status: "RECUSADO",
            createdAt: {
              toDate: () => new Date("2025-09-07")
            }
          },
          {
            withdrawId: "2",
            amount: 700.0,
            status: "PAGO",
            createdAt: {
              toDate: () => new Date("2025-09-06")
            }
          }
        ]
        setData(mockData)
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error)
        setModalMessage({
          title: 'Erro',
          description: 'Não foi possível carregar suas solicitações de saque',
        })
        setIsModalVisible(true)
      }
    }

    const fetchBalance = async () => {
      try {
        // Mock balance - substitua pela implementação real da API
        const mockBalance = 998600.0
        setBalance(mockBalance)
      } catch (error) {
        console.error('Erro ao buscar balance do usuário:', error)
      } finally {
        setIsLoadingBalance(false)
      }
    }

    fetchData()
    fetchBalance()
  }, [userData?.uid])

  // Função do Pull Refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      if (userData?.uid) {
        // Recarrega os dados de saque
        const mockData: WithdrawalRequest[] = [
          {
            withdrawId: "1",
            amount: 700.0,
            status: "RECUSADO",
            createdAt: {
              toDate: () => new Date("2025-09-07")
            }
          },
          {
            withdrawId: "2",
            amount: 700.0,
            status: "PAGO",
            createdAt: {
              toDate: () => new Date("2025-09-06")
            }
          }
        ]
        setData(mockData)
        
        // Recarrega o saldo
        const mockBalance = 998600.0
        setBalance(mockBalance)
      }
    } catch (error) {
      console.error("Erro ao atualizar dados da carteira:", error)
    } finally {
      setRefreshing(false)
    }
  }, [userData?.uid])

  async function handleWithdrawalRequest() {
    // Verificar se o usuário tem chave PIX cadastrada
    if (!userData?.pixKey || userData.pixKey.trim() === '') {
      setModalMessage({
        title: 'Chave PIX não cadastrada',
        description:
          'Para realizar um saque, você precisa cadastrar sua chave PIX no perfil. Acesse Perfil > Dados para Pagamento para atualizar.',
      })
      setIsModalVisible(true)
      return
    }

    if (balance >= 700) {
      setShowWithdrawalModal(true)
    } else {
      setModalMessage({
        title: 'Saldo insuficiente',
        description: `O saldo em sua carteira precisa ser no mínimo R$ 700,00 para realizar o saque!`,
      })
      setIsModalVisible(true)
    }
  }

  async function handleConfirmWithdrawal(amount: number) {
    setIsLoadingButton(true)
    setShowWithdrawalModal(false)

    try {
      // Mock da criação da solicitação - substitua pela implementação real da API
      console.log('Criando solicitação de saque:', amount)

      setModalMessage({
        title: 'Saque solicitado',
        description: `Saque de ${new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(
          amount,
        )} foi solicitado à unidade: ${userData?.unitName}, o prazo médio de liberação é de 10 dias úteis, você pode acompanhar o status em sua carteira!`,
      })
      setIsModalVisible(true)

      // Recarregar os dados da carteira
      if (userData?.uid) {
        // Simular recarga de dados
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error('Erro ao criar solicitação de saque:', error)
      setModalMessage({
        title: 'Erro!',
        description: `Erro ao solicitar saque. Tente novamente.`,
      })
      setIsModalVisible(true)
    } finally {
      setIsLoadingButton(false)
    }
  }

  const handleSaque = () => {
    const valor = Number.parseFloat(valorSaque)
    if (valor < 700) {
      alert("Valor mínimo para saque é R$ 700,00")
      return
    }
    if (valor > balance) {
      alert("Saldo insuficiente")
      return
    }
    handleConfirmWithdrawal(valor)
    setShowWithdrawalModal(false)
    setValorSaque("")
  }

  const adicionarValor = (valor: number) => {
    const atual = Number.parseFloat(valorSaque || "0")
    setValorSaque((atual + valor).toFixed(2))
  }

  const limparValor = () => {
    setValorSaque("")
  }

  const setarMaximo = () => {
    setValorSaque(balance.toFixed(2))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#4A04A5]"></div>
      </div>
    )
  }

  return (
    <>
      <DesktopSidebar />

      <div className="min-h-screen relative pb-24 lg:pb-0 lg:ml-64">
        {/* Background branco */}
        <div className="fixed inset-0 lg:left-64 bg-white-responsive" />

        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Pull to refresh indicator */}
          {refreshing && (
            <div className="flex justify-center py-4">
              <RefreshCw className="w-6 h-6 text-[#4A04A5] animate-spin" />
            </div>
          )}

          {/* Header com botão de voltar */}
          <div className="pt-10">
            <div className="flex justify-between items-center px-6">
              <div className="lg:hidden">
                <BackButton bgColor="#4A04A5"/>
              </div>
            </div>
          </div>

          {/* Card principal com saldo */}
          <div className="px-6 mt-6">
            <div className="bg-[#f4f0ff] rounded-3xl h-30 flex justify-center items-center relative">
              <div className="w-full h-full bg-gradient-to-r from-[#4E00A7] to-[#6800E0] rounded-2xl flex flex-col justify-center items-center">
                <p className="text-white text-sm font-normal">Saldo Disponível para Saque</p>
                <div className="flex items-end justify-center mt-2">
                  <span className="text-[#29F3DF] text-lg font-bold">R$ </span>
                  {showBalance ? (
                    <div className="flex items-end">
                      <span className="text-[#29F3DF] text-4xl font-bold">
                        {Math.floor(balance).toLocaleString('pt-BR')}
                      </span>
                      <span className="text-[#29F3DF] text-lg font-bold">
                        ,{(balance % 1).toFixed(2).replace('0.', '')}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[#29F3DF] text-4xl font-bold">******</span>
                  )}
                  <button
                    className="ml-3 flex justify-center items-center -top-1"
                    onClick={() => setShowBalance(!showBalance)}
                  >
                    {showBalance ? (
                      <EyeOff className="w-5 h-5 text-white" />
                    ) : (
                      <Eye className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Área de transações */}
            <div className="bg-white border border-[#CDCDCD] border-t-0 rounded-br-3xl rounded-bl-3xl h-32 px-4 py-3">
              {data.length > 0 ? (
                <div className="space-y-1 h-full overflow-y-auto">
                  {data.map((item) => (
                    <div key={item.withdrawId} className="bg-[#EDE9FF] w-full p-1 px-3 mt-1 rounded-md flex items-center">
                      <div className="bg-[#4A04A5] rounded-md w-8 h-8 flex justify-center items-center mr-3">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 flex justify-between items-center">
                        <span className="text-[#4A04A5] text-sm font-normal">
                          {item.createdAt.toDate().toLocaleDateString('pt-BR')}
                        </span>
                        <span className="text-[#4A04A5] text-sm font-semibold">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(item.amount)}
                        </span>
                        <span
                          className="font-bold text-sm"
                          style={{
                            color: item.status === 'PAGO' ? '#10B981' : 
                                   item.status === 'RECUSADO' ? '#EF4444' : '#4A04A5'
                          }}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-center items-center">
                  <DollarSign className="w-10 h-10 text-[#4A04A5]" />
                  <p className="text-[#4A04A5] text-sm font-normal text-center mt-2">
                    Nenhuma solicitação de saque encontrada
                  </p>
                  <p className="text-gray-500 text-sm font-normal text-center mt-1">
                    Suas solicitações aparecerão aqui
                  </p>
                </div>
              )}
            </div>

            {/* Botão Sacar */}
            <div className="mt-6">
              <button
                onClick={handleWithdrawalRequest}
                disabled={isLoadingButton}
                className="w-full h-20 bg-gradient-to-b from-[#9743F8] to-[#4F00A9] rounded-lg border border-[#29F3DF] flex justify-center items-center"
              >
                {isLoadingButton ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                ) : (
                  <span className="text-white font-bold text-3xl">Sacar</span>
                )}
              </button>
            </div>

            {/* Dashboard Chart */}
            <div className="mt-6">
              <DashboardChart />
            </div>
          </div>
        </div>

        <BottomNav />
      </div>

      {/* Modal Customizado */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <div className="text-center">
              <h3 className="text-xl font-bold text-[#4A04A5] mb-4">{modalMessage.title}</h3>
              <p className="text-gray-600 mb-6">{modalMessage.description}</p>
              <button
                onClick={() => setIsModalVisible(false)}
                className="w-full bg-[#4A04A5] text-white font-bold py-3 px-6 rounded-2xl"
              >
                FECHAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Saque */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#170138] rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setShowWithdrawalModal(false)}
                className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-xl font-bold text-white">Valor do Saque</h2>
              <div className="w-8 h-8" />
            </div>

            <div className="mb-6">
              <p className="text-white text-sm mb-2">Saldo disponível</p>
              <div className="flex items-baseline gap-2">
                <span className="text-white text-2xl font-bold">
                  {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center ml-2"
                >
                  {showBalance ? <EyeOff className="w-3 h-3 text-white" /> : <Eye className="w-3 h-3 text-white" />}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-white mb-3">Digite o valor</p>
              <div className="bg-[#4A04A5] rounded-2xl p-6 text-center">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-white text-2xl">R$</span>
                  <input
                    type="number"
                    value={valorSaque}
                    onChange={(e) => setValorSaque(e.target.value)}
                    placeholder="0,00"
                    className="bg-transparent text-white text-4xl font-bold text-center outline-none w-full"
                    step="0.01"
                    min="700"
                  />
                </div>
              </div>
              <p className="text-white text-xs text-center mt-2">Valor mínimo: R$ 700,00</p>
            </div>

            <div className="mb-6">
              <p className="text-white mb-3">Valores rápidos</p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => adicionarValor(700)}
                  className="bg-[#4A04A5] hover:bg-[#4A04A5]/80 text-white font-bold py-3 px-3 rounded-xl transition-colors text-sm"
                >
                  +R$ 700
                </button>
                <button
                  onClick={() => adicionarValor(1000)}
                  className="bg-[#4A04A5] hover:bg-[#4A04A5]/80 text-white font-bold py-3 px-3 rounded-xl transition-colors text-sm"
                >
                  +R$ 1.000
                </button>
                <button
                  onClick={() => adicionarValor(1500)}
                  className="bg-[#4A04A5] hover:bg-[#4A04A5]/80 text-white font-bold py-3 px-3 rounded-xl transition-colors text-sm"
                >
                  +R$ 1.500
                </button>
                <button
                  onClick={() => adicionarValor(2000)}
                  className="bg-[#4A04A5] hover:bg-[#4A04A5]/80 text-white font-bold py-3 px-3 rounded-xl transition-colors text-sm"
                >
                  +R$ 2.000
                </button>
                <button
                  onClick={setarMaximo}
                  className="bg-[#4A04A5] hover:bg-[#4A04A5]/80 text-white font-bold py-3 px-3 rounded-xl transition-colors text-sm"
                >
                  Máximo
                </button>
                <button
                  onClick={limparValor}
                  className="bg-[#4A04A5] hover:bg-[#4A04A5]/80 text-white font-bold py-3 px-3 rounded-xl transition-colors text-sm"
                >
                  Limpar
                </button>
              </div>
            </div>

            <div className="bg-[#4A04A5]/50 rounded-2xl p-4 mb-6">
              <ul className="text-white text-sm space-y-2">
                <li>• Valor mínimo para saque: R$ 700,00.</li>
                <li>• O saque será processado pela sua unidade.</li>
                <li>• Você receberá uma notificação no APP e em seu e-mail quando o pagamento for realizado.</li>
              </ul>
            </div>

            <button
              onClick={handleSaque}
              disabled={!valorSaque || Number.parseFloat(valorSaque) < 700 || isLoadingButton}
              className="w-full bg-[#C352F2] hover:bg-[#C352F2]/90 disabled:bg-[#C352F2]/30 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl transition-colors text-lg"
            >
              {isLoadingButton ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              ) : (
                'Confirmar Saque'
              )}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
