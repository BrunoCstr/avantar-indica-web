"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { StatsCard } from "@/components/stats-card"
import { IndicarModal } from "@/components/indicar-modal"
import { BellRing, Shield, TrendingUp, Users, DollarSign, Target } from "lucide-react"
import Link from "next/link"

interface User {
  nome: string
  telefone: string
  email: string
  chavePix: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isIndicarModalOpen, setIsIndicarModalOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("avantar_token")
    if (!token) {
      router.push("/login")
      return
    }

    const userData = localStorage.getItem("avantar_user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [router])

  if (!user) {
    return (
      <div className="min-h-screen bg-[#4A04A5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#29F3DF] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white mt-4">Carregando...</p>
        </div>
      </div>
    )
  }

  const firstName = user.nome.split(" ")[0]

  return (
    <>
      <DesktopSidebar />

      <div className="min-h-screen relative pb-24 lg:pb-0 lg:ml-64">
        {/* Background image */}
        <div className="fixed inset-0 lg:left-64 bg-dark-responsive" />

        {/* Content */}
        <div className="relative z-10">
          {/* Header - Desktop version mais compacta */}
          <div className="p-6 lg:px-8 lg:py-4 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-[#29F3DF] to-[#C352F2] p-0.5">
                <div className="w-full h-full rounded-full bg-[#4A04A5] flex items-center justify-center overflow-hidden">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-10-08%20at%2008.53.18%20(1)-rX4Qs-yLD9hO2Z3nnrE6RlwFyw2MmUebYn8r.jpeg"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-2xl lg:text-xl font-bold text-white">
                  Olá, <span className="text-[#29F3DF]">{firstName}</span>
                </h1>
                <p className="text-white/80 text-sm">Seja bem-vindo de volta!</p>
              </div>
            </div>
            <button className="w-12 h-12 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
              <BellRing className="w-7 h-7 lg:w-5 lg:h-5 text-[#29F3DF]" />
            </button>
          </div>

          {/* Stats Cards - Desktop */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-4 px-8 py-4">
            <StatsCard title="Total de Indicações" value="0" icon={Users} color="cyan" />
            <StatsCard
              title="Indicações Fechadas"
              value="0"
              icon={Target}
              trend={{ value: "0%", isPositive: true }}
              color="purple"
            />
            <StatsCard
              title="Comissão Total"
              value="R$ 0,00"
              icon={DollarSign}
              trend={{ value: "R$ 0", isPositive: true }}
              color="orange"
            />
            <StatsCard title="Taxa de Conversão" value="0%" icon={TrendingUp} color="pink" />
          </div>

          {/* Main Content Area */}
          <div className="lg:px-8 lg:py-4">
            <div className="lg:grid lg:grid-cols-12 lg:gap-6">
              {/* Main content - 8 columns on desktop */}
              <div className="lg:col-span-8 space-y-4 lg:space-y-4">
                {/* Action Buttons - Desktop Layout */}
                <div className="px-6 lg:px-0">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    <button
                      onClick={() => setIsIndicarModalOpen(true)}
                      className="cursor-pointer bg-gradient-to-br from-[#29F3DF]/20 to-[#29F3DF]/5 border-2 border-[#29F3DF] rounded-xl p-4 lg:p-6 hover:from-[#29F3DF]/30 hover:to-[#29F3DF]/10 transition-all flex flex-col items-center justify-center gap-2 lg:gap-3 group"
                    >
                      <div className="flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-[#29F3DF]/20 group-hover:bg-[#29F3DF]/30 transition-colors">
                        <img 
                          src="/indicar_icon.svg" 
                          alt="Indicar" 
                          className="w-6 h-6 lg:w-7 lg:h-7"
                        />
                      </div>
                      <h3 className="text-white font-bold text-sm lg:text-base">INDICAR</h3>
                    </button>

                    <Link
                      href="/indicar-multiplos"
                      className="bg-gradient-to-br from-[#C352F2]/20 to-[#C352F2]/5 border-2 border-[#C352F2] rounded-xl p-4 lg:p-6 hover:from-[#C352F2]/30 hover:to-[#C352F2]/10 transition-all flex flex-col items-center justify-center gap-2 lg:gap-3 group"
                    >
                      <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-[#C352F2]/20 group-hover:bg-[#C352F2]/30 transition-colors flex items-center justify-center">
                        <img 
                          src="/indicar_em_massa_icon.svg" 
                          alt="Indicar em Massa" 
                          className="w-6 h-6 lg:w-7 lg:h-7"
                        />
                      </div>
                      <h3 className="text-white font-bold text-sm lg:text-base text-center">
                        INDICAR<br className="lg:hidden" /> MÚLTIPLOS
                      </h3>
                    </Link>
                    
                    {/* Botão REGRAS na mesma linha no desktop */}
                    <Link
                      href="/regras"
                      className="hidden lg:flex bg-gradient-to-br from-[#F28907] to-[#E06400] border-2 border-[#F28907]/50 rounded-xl p-6 hover:from-[#F28907]/90 hover:to-[#E06400]/90 transition-all flex-col items-center justify-center gap-3 group shadow-lg"
                    >
                      <div className="w-14 h-14 rounded-xl bg-white/20 group-hover:bg-white/30 transition-colors flex items-center justify-center">
                        <Shield className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-white font-bold text-base">REGRAS</h3>
                    </Link>
                  </div>
                </div>
                
                {/* Botão REGRAS em linha separada - mobile only */}
                <div className="px-6 lg:hidden">
                  <Link
                    href="/regras"
                    className="block w-full border-b-5 border-r-5 border-[#F28907] bg-[#E06400] hover:bg-[#F28907]/90 text-white font-bold py-7 px-6 rounded-2xl transition-colors text-center text-xl"
                  >
                    REGRAS
                  </Link>
                </div>

              {/* Indicações Card */}
              <div className="mx-6 lg:mx-0">
                <div className="bg-white rounded-2xl lg:rounded-xl p-6 shadow-sm lg:min-h-[350px] flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl lg:text-xl font-bold text-[#4A04A5]">Indicações</h2>
                    <button className="w-10 h-10 lg:w-9 lg:h-9 rounded-lg bg-[#4A04A5] flex items-center justify-center hover:bg-[#4A04A5]/90 transition-colors">
                      <svg className="w-5 h-5 lg:w-4 lg:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Empty State */}
                  <div className="text-center py-12 lg:py-20 flex-1 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 lg:w-20 lg:h-20 mx-auto mb-6 rounded-xl bg-[#C352F2]/10 flex items-center justify-center">
                      <Shield className="w-10 h-10 text-[#C352F2]" />
                    </div>
                    <h3 className="text-xl lg:text-lg font-bold text-[#4A04A5] mb-2">
                      Nenhuma indicação encontrada
                    </h3>
                    <p className="text-gray-600 text-sm max-w-md">
                      Você ainda não possui indicações registradas. Quando você indicar alguém, elas aparecerão aqui!
                    </p>
                  </div>
                </div>
              </div>
              </div>

              {/* Sidebar - 4 columns on desktop */}
              <div className="hidden lg:block lg:col-span-4 space-y-4">
                {/* Quick Stats */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <h3 className="text-base font-bold text-[#4A04A5] mb-4">Desempenho do Mês</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-xs">Meta de Indicações</span>
                      <span className="font-bold text-[#4A04A5] text-sm">0/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#29F3DF] to-[#C352F2] h-2 rounded-full transition-all"
                        style={{ width: "0%" }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-gray-600 text-xs">Comissão Prevista</span>
                      <span className="font-bold text-[#F28907] text-sm">R$ 0,00</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-xs">Próximo Pagamento</span>
                      <span className="font-bold text-[#4A04A5] text-sm">--/--/----</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <h3 className="text-base font-bold text-[#4A04A5] mb-4">Ações Rápidas</h3>
                  <div className="space-y-2">
                    <Link
                      href="/status"
                      className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-[#C352F2]/10 to-transparent hover:from-[#C352F2]/20 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#C352F2]/20 flex items-center justify-center group-hover:bg-[#C352F2]/30 transition-colors">
                        <Target className="w-4 h-4 text-[#C352F2]" />
                      </div>
                      <span className="text-sm font-medium text-[#4A04A5]">Status das Propostas</span>
                    </Link>

                    <Link
                      href="/carteira"
                      className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-[#29F3DF]/10 to-transparent hover:from-[#29F3DF]/20 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#29F3DF]/20 flex items-center justify-center group-hover:bg-[#29F3DF]/30 transition-colors">
                        <DollarSign className="w-4 h-4 text-[#29F3DF]" />
                      </div>
                      <span className="text-sm font-medium text-[#4A04A5]">Minha Carteira</span>
                    </Link>

                    <Link
                      href="/vendedores"
                      className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-[#F28907]/10 to-transparent hover:from-[#F28907]/20 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#F28907]/20 flex items-center justify-center group-hover:bg-[#F28907]/30 transition-colors">
                        <Users className="w-4 h-4 text-[#F28907]" />
                      </div>
                      <span className="text-sm font-medium text-[#4A04A5]">Vendedores</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Button - mobile only */}
          <div className="px-6 lg:hidden">
            <Link
              href="/status"
              className="block w-full mt-6 bg-gradient-to-r from-[#C352F2] to-[#C352F2]/80 hover:from-[#C352F2]/90 hover:to-[#C352F2]/70 border-b-5 border-r-5 border-[#8822ED] text-white font-bold py-7 px-6 rounded-2xl transition-all text-center text-xl shadow-lg"
            >
              STATUS DAS PROPOSTAS
            </Link>
          </div>
        </div>

        <BottomNav onIndicarClick={() => setIsIndicarModalOpen(true)} />
      </div>

      {/* Indicar Modal */}
      <IndicarModal 
        isOpen={isIndicarModalOpen} 
        onClose={() => setIsIndicarModalOpen(false)} 
      />
    </>
  )
}