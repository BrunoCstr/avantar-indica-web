"use client"

import { useState, useEffect } from "react"
import { BackButton } from "@/components/back-button"
import { BottomNav } from "@/components/bottom-nav"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { Search, SlidersHorizontal, Clipboard } from "lucide-react"

interface Indicacao {
  id: number
  nome: string
  email: string
  telefone: string
  produto: string
  status: "Pendente" | "Em contato" | "Fechados" | "Não fechado"
  data: string
  observacoes?: string
}

export default function StatusPage() {
  const [indicacoes, setIndicacoes] = useState<Indicacao[]>([])
  const [filtro, setFiltro] = useState<string>("todos")
  const [busca, setBusca] = useState("")

  useEffect(() => {
    const data = localStorage.getItem("avantar_indicacoes")
    if (data) {
      setIndicacoes(JSON.parse(data))
    }
  }, [])

  const contadores = {
    pendente: indicacoes.filter((i) => i.status === "Pendente").length,
    emContato: indicacoes.filter((i) => i.status === "Em contato").length,
    fechados: indicacoes.filter((i) => i.status === "Fechados").length,
    naoFechado: indicacoes.filter((i) => i.status === "Não fechado").length,
  }

  const indicacoesFiltradas = indicacoes.filter((ind) => {
    const matchBusca =
      ind.nome.toLowerCase().includes(busca.toLowerCase()) ||
      ind.email.toLowerCase().includes(busca.toLowerCase()) ||
      ind.telefone.includes(busca)

    if (filtro === "todos") return matchBusca
    return matchBusca && ind.status === filtro
  })

  return (
    <>
      <DesktopSidebar />

      <div className="min-h-screen relative bg-gradient-to-b from-[#F6F3FF] to-white pb-24 lg:pb-0 lg:ml-64">
        <div className="fixed inset-0 lg:left-64 bg-white-responsive" />

        <div className="relative z-10 p-6 lg:px-8 lg:py-6">
          <div className="mb-6 flex items-center justify-between lg:border-b lg:border-gray-200 lg:pb-6">
            <div className="flex items-center gap-4">
              <div className="lg:hidden">
                <BackButton bgColor="#4A04A5" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[#4A04A5]">Status das Propostas</h1>
            </div>
            <div className="w-12 lg:hidden" />
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/80" />
              <input
                type="text"
                placeholder="Buscar..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full border-b-4 border-[#C352F2] bg-[#4A04A5] text-white placeholder:text-white/60 pl-12 pr-14 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#29F3DF]/50"
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white">
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 lg:grid-cols-4 gap-2 mb-2">
            <button
              onClick={() => setFiltro("Pendente")}
              className={`bg-white rounded-2xl p-1 shadow-sm border-2 transition-all hover:shadow-md ${
                filtro === "Pendente" ? "border-[#F28907]" : "border-transparent"
              }`}
            >
              <div className="text-2xl font-bold text-[#4A04A5] mb-2">{contadores.pendente}</div>
              <div className="text-xs text-gray-600">Pendente</div>
            </button>

            <button
              onClick={() => setFiltro("Em contato")}
              className={`bg-white rounded-2xl p-1 shadow-sm border-2 transition-all hover:shadow-md ${
                filtro === "Em contato" ? "border-blue-500" : "border-transparent"
              }`}
            >
              <div className="text-2xl font-bold text-[#4A04A5] mb-2">{contadores.emContato}</div>
              <div className="text-xs text-gray-600">Em contato</div>
            </button>

            <button
              onClick={() => setFiltro("Fechados")}
              className={`bg-white rounded-2xl p-1 shadow-sm border-2 transition-all hover:shadow-md ${
                filtro === "Fechados" ? "border-green-500" : "border-transparent"
              }`}
            >
              <div className="text-2xl font-bold text-[#4A04A5] mb-2">{contadores.fechados}</div>
              <div className="text-xs text-gray-600">Fechados</div>
            </button>

            <button
              onClick={() => setFiltro("Não fechado")}
              className={`bg-white rounded-2xl p-1 shadow-sm border-2 transition-all hover:shadow-md ${
                filtro === "Não fechado" ? "border-red-500" : "border-transparent"
              }`}
            >
              <div className="text-2xl font-bold text-[#4A04A5] mb-2">{contadores.naoFechado}</div>
              <div className="text-xs text-gray-600">Não fechado</div>
            </button>
          </div>

          {indicacoesFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#C352F2]/10 flex items-center justify-center">
                <Clipboard className="w-10 h-10 text-[#C352F2]" />
              </div>
              <h3 className="text-xl font-bold text-[#4A04A5] mb-2">Nenhum resultado encontrado</h3>
              <p className="text-gray-600 text-sm leading-relaxed px-8">
                Você ainda não possui oportunidades ou indicações registradas. Quando você indicar alguém, elas
                aparecerão aqui!
              </p>
            </div>
          ) : (
            <>
              {filtro !== "todos" && (
                <button
                  onClick={() => setFiltro("todos")}
                  className="text-[#4A04A5] hover:text-[#29F3DF] text-sm font-medium mb-4"
                >
                  ← Ver todas
                </button>
              )}

              <div className="hidden lg:block bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#4A04A5] text-white">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold">Nome</th>
                      <th className="text-left py-4 px-6 font-semibold">Contato</th>
                      <th className="text-left py-4 px-6 font-semibold">Produto</th>
                      <th className="text-left py-4 px-6 font-semibold">Data</th>
                      <th className="text-left py-4 px-6 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {indicacoesFiltradas.map((ind, index) => (
                      <tr
                        key={ind.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                      >
                        <td className="py-4 px-6">
                          <p className="font-bold text-[#4A04A5]">{ind.nome}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-gray-600">{ind.email}</p>
                          <p className="text-sm text-gray-600">{ind.telefone}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-[#29F3DF] font-medium">{ind.produto}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-gray-600">
                            {new Date(ind.data).toLocaleDateString("pt-BR")}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                              ind.status === "Pendente"
                                ? "bg-orange-100 text-orange-700"
                                : ind.status === "Em contato"
                                  ? "bg-blue-100 text-blue-700"
                                  : ind.status === "Fechados"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                            }`}
                          >
                            {ind.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card view */}
              <div className="lg:hidden space-y-4">
                {indicacoesFiltradas.map((ind) => (
                  <div key={ind.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-[#4A04A5] text-lg mb-1">{ind.nome}</h3>
                        <p className="text-sm text-gray-600">{ind.email}</p>
                        <p className="text-sm text-gray-600">{ind.telefone}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          ind.status === "Pendente"
                            ? "bg-orange-100 text-orange-700"
                            : ind.status === "Em contato"
                              ? "bg-blue-100 text-blue-700"
                              : ind.status === "Fechados"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                        }`}
                      >
                        {ind.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-[#29F3DF] font-medium">{ind.produto}</span>
                      <span className="text-xs text-gray-400">{new Date(ind.data).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <BottomNav />
      </div>
    </>
  )
}
