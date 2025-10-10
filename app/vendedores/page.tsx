"use client"

import { useState } from "react"
import { BackButton } from "@/components/back-button"
import { BottomNav } from "@/components/bottom-nav"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { PageContainer, PageBackground } from "@/components/page-container"
import { Search, UserPlus, Edit, Trash2, User } from "lucide-react"

interface Vendedor {
  id: number
  nome: string
  email: string
  comissao: number
  ativo: boolean
}

export default function VendedoresPage() {
  const [busca, setBusca] = useState("")
  const [vendedores, setVendedores] = useState<Vendedor[]>([
    {
      id: 1,
      nome: "Teste",
      email: "tecnologia@redersup.com.br",
      comissao: 30,
      ativo: true,
    },
    {
      id: 2,
      nome: "Teste | Sub-Indicador",
      email: "vasco@avantar.com.br",
      comissao: 30,
      ativo: true,
    },
  ])

  const vendedoresFiltrados = vendedores.filter(
    (v) => v.nome.toLowerCase().includes(busca.toLowerCase()) || v.email.toLowerCase().includes(busca.toLowerCase()),
  )

  return (
    <>
      <DesktopSidebar />

      <PageContainer className="pb-24 lg:pb-0">
        {/* Background - Mobile: bg roxo com pattern | Desktop: cor sólida do tema */}
        <div className="lg:hidden fixed inset-0 bg-dark-responsive">
          {/* Pattern background - apenas mobile */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, rgba(41, 243, 223, 0.3) 0%, transparent 50%),
                               radial-gradient(circle at 80% 80%, rgba(195, 82, 242, 0.3) 0%, transparent 50%)`,
              }}
            />
          </div>
        </div>
        <div className="hidden lg:block">
          <PageBackground />
        </div>

        <div className="relative z-10 p-6 lg:px-8 lg:py-6">
          <div className="mb-6 flex items-center justify-between lg:border-b lg:border-gray dark:lg:border-white/10 lg:pb-6">
            <div className="flex items-center gap-4">
              <div className="lg:hidden">
                <BackButton />
              </div>
              <h1 className="text-3xl font-bold text-white lg:text-black lg:dark:text-white">Vendedores</h1>
            </div>
            <button className="w-12 h-12 rounded-xl border-2 border-[#29F3DF] text-[#29F3DF] hover:bg-[#29F3DF]/10 flex items-center justify-center transition-colors lg:border-[#4A04A5] lg:text-[#4A04A5] lg:hover:bg-[#4A04A5]/10 lg:dark:border-[#29F3DF] lg:dark:text-[#29F3DF] lg:dark:hover:bg-[#29F3DF]/10">
              <UserPlus className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6 lg:max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/80 lg:text-gray-400 lg:dark:text-white/80" />
              <input
                type="text"
                placeholder="Pesquisar por nome..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full bg-[#170138] border-b-2 border-l-2 border-[#29F3DF] text-white placeholder:text-white/60 pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#29F3DF]/50 lg:bg-white lg:border-gray-300 lg:text-black lg:placeholder:text-gray-400 lg:focus:ring-[#4A04A5]/50 lg:focus:border-[#4A04A5] lg:dark:bg-[#170138] lg:dark:border-[#29F3DF] lg:dark:text-white lg:dark:placeholder:text-white/60 lg:dark:focus:ring-[#29F3DF]/50"
              />
            </div>
          </div>

          <div className="hidden lg:block bg-white dark:bg-[#190d26] border border-gray-100 dark:border-tertiary-purple rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#170138] text-white dark:bg-[#4A04A5] dark:text-white">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold">Vendedor</th>
                  <th className="text-left py-4 px-6 font-semibold">Email</th>
                  <th className="text-left py-4 px-6 font-semibold">Comissão</th>
                  <th className="text-left py-4 px-6 font-semibold">Status</th>
                  <th className="text-right py-4 px-6 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {vendedoresFiltrados.map((vendedor, index) => (
                  <tr
                    key={vendedor.id}
                    className={`border-b border-gray-100 dark:border-[#4A04A5] hover:bg-gray-50 dark:hover:bg-[#4A04A5]/10 ${index % 2 === 0 ? "bg-white dark:bg-[#190d26]" : "bg-gray-50/50 dark:bg-[#190d26]/50"}`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#29F3DF] to-[#C352F2] p-0.5 flex-shrink-0">
                          <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                          </div>
                        </div>
                        <span className="font-bold text-[#4A04A5] dark:text-white">{vendedor.nome}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray dark:text-gray">{vendedor.email}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-blue-600 dark:text-[#29F3DF] font-bold">{vendedor.comissao}%</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green dark:bg-green-900/30 text-black dark:text-black inline-block">
                        Ativo
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button className="w-10 h-10 rounded-xl bg-[#4A04A5]/10 hover:bg-[#4A04A5]/20 dark:bg-[#4A04A5]/20 dark:hover:bg-[#4A04A5]/30 flex items-center justify-center transition-colors">
                          <Edit className="w-5 h-5 text-[#4A04A5] dark:text-[#29F3DF]" />
                        </button>
                        <button className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 flex items-center justify-center transition-colors">
                          <Trash2 className="w-5 h-5 text-red dark:text-red" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="lg:hidden space-y-4">
            {vendedoresFiltrados.map((vendedor) => (
              <div key={vendedor.id} className="bg-white rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#29F3DF] to-[#C352F2] p-0.5 flex-shrink-0">
                    <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-7 h-7 text-gray-400" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#4A04A5] text-lg mb-1">{vendedor.nome}</h3>
                        <p className="text-sm text-gray-600 truncate">{vendedor.email}</p>
                      </div>
                      <span className="ml-2 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 flex-shrink-0">
                        Ativo
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <span className="text-sm text-blue-600 font-bold">Comissão: {vendedor.comissao}%</span>
                      <div className="flex items-center gap-2">
                        <button className="w-10 h-10 rounded-xl bg-[#4A04A5]/10 hover:bg-[#4A04A5]/20 flex items-center justify-center transition-colors">
                          <Edit className="w-5 h-5 text-[#4A04A5]" />
                        </button>
                        <button className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors">
                          <Trash2 className="w-5 h-5 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {vendedoresFiltrados.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/10 lg:bg-[#4A04A5]/10 flex items-center justify-center">
                <User className="w-10 h-10 text-white/60 lg:text-[#4A04A5] lg:dark:text-white/60" />
              </div>
              <p className="text-white/80 lg:text-gray-600 lg:dark:text-white/80">Nenhum vendedor encontrado</p>
            </div>
          )}
        </div>

        <BottomNav />
      </PageContainer>
    </>
  )
}
