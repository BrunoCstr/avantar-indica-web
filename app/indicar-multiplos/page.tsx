"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BackButton } from "@/components/back-button"
import { BottomNav } from "@/components/bottom-nav"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { PageContainer, PageBackground } from "@/components/page-container"
import { ChevronDown, Users, Send, UserPlus, Trash2, CheckCircle } from "lucide-react"
import { useAuth } from "@/context/Auth"
import { AlertModal } from "@/components/alert-modal"

interface Indicacao {
  nome: string
  email: string
  telefone: string
  produto: string
  observacoes: string
}

export default function IndicarMultiplosPage() {
  const router = useRouter()
  const { userData } = useAuth()
  const [indicacoes, setIndicacoes] = useState<Indicacao[]>([])
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    produto: "",
    observacoes: "",
  })
  const [consentimento, setConsentimento] = useState(false)
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [alertTitle, setAlertTitle] = useState("Atenção")

  // Verifica se o usuário tem permissão para acessar esta página
  useEffect(() => {
    if (userData && userData.rule === "nao_definida") {
      setAlertTitle("Cadastro Pendente")
      setAlertMessage("Seu cadastro ainda não foi aprovado pela unidade. Aguarde a aprovação para poder fazer indicações.")
      setShowAlertModal(true)
      
      // Redireciona após fechar o modal
      setTimeout(() => {
        router.push("/dashboard")
      }, 500)
    }
  }, [userData, router])

  const handleAddIndicacao = (e: React.FormEvent) => {
    e.preventDefault()
    if (!consentimento) {
      setAlertTitle("Atenção")
      setAlertMessage("Você precisa confirmar que obteve consentimento do indicado")
      setShowAlertModal(true)
      return
    }
    setIndicacoes([...indicacoes, formData])
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      produto: "",
      observacoes: "",
    })
    setConsentimento(false)
  }

  const handleEnviarTodas = () => {
    if (indicacoes.length === 0) {
      setAlertTitle("Atenção")
      setAlertMessage("Adicione pelo menos uma indicação")
      setShowAlertModal(true)
      return
    }
    // Salva todas as indicações
    const indicacoesExistentes = JSON.parse(localStorage.getItem("avantar_indicacoes") || "[]")
    const novasIndicacoes = indicacoes.map((ind) => ({
      ...ind,
      id: Date.now() + Math.random(),
      status: "Pendente",
      data: new Date().toISOString(),
    }))
    localStorage.setItem("avantar_indicacoes", JSON.stringify([...indicacoesExistentes, ...novasIndicacoes]))
    
    setAlertTitle("Sucesso!")
    setAlertMessage(`${indicacoes.length} ${indicacoes.length === 1 ? 'indicação enviada' : 'indicações enviadas'} com sucesso!`)
    setShowAlertModal(true)
    
    // Redireciona após fechar o modal
    setTimeout(() => {
      router.push("/dashboard")
    }, 500)
  }

  return (
    <>
      {/* Sidebar apenas para Desktop */}
      <div className="hidden lg:block">
      <DesktopSidebar />
      </div>

      <PageContainer showHeader={true}>
        {/* Background - Desktop com cor sólida */}
        <div className="hidden lg:block">
          <PageBackground />
        </div>

        {/* Background - Mobile com imagem bg_dark_responsive */}
        <div className="lg:hidden fixed inset-0 z-0">
          <div className="absolute inset-0 bg-dark-responsive" />
        </div>

        {/* MOBILE VERSION - Mantém exatamente como está */}
        <div className="lg:hidden min-h-screen relative pb-24">
          <div className="relative z-10 p-6">
            <div className="mb-6 flex items-center justify-between">
              <BackButton />
              {indicacoes.length > 0 && (
                <button
                  onClick={handleEnviarTodas}
                  className="bg-[#29F3DF] hover:bg-[#29F3DF]/90 text-[#170138] font-bold py-2 px-6 rounded-xl transition-colors"
                >
                  Enviar Todas ({indicacoes.length})
                </button>
              )}
            </div>

            <h1 className="text-3xl font-bold text-white text-center mb-8">Indicações Múltiplas</h1>

            {/* Card de Nova Indicação */}
            <div className="bg-[#4A04A5]/40 rounded-3xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#29F3DF]/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#29F3DF]" />
                </div>
                <h2 className="text-xl font-bold text-white">Nova Indicação</h2>
              </div>
              <p className="text-white/80 text-sm mb-6">Preencha os dados para adicionar uma nova indicação</p>

              <form onSubmit={handleAddIndicacao} className="space-y-4">
                <input
                  type="text"
                  placeholder="Nome Completo"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full border-2 border-[#29F3DF] text-white placeholder:text-white/60 px-6 py-4 rounded-2xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20 bg-transparent"
                  required
                />

                <input
                  type="email"
                  placeholder="E-mail"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border-2 border-[#29F3DF] text-white placeholder:text-white/60 px-6 py-4 rounded-2xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20 bg-transparent"
                  required
                />

                <input
                  type="tel"
                  placeholder="Telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full border-2 border-[#29F3DF] text-white placeholder:text-white/60 px-6 py-4 rounded-2xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20 bg-transparent"
                  required
                />

                <div className="relative">
                  <select
                    value={formData.produto}
                    onChange={(e) => setFormData({ ...formData, produto: e.target.value })}
                    className="w-full border-2 border-[#29F3DF] text-white px-6 py-4 rounded-2xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20 appearance-none bg-transparent"
                    required
                  >
                    <option value="" disabled className="bg-[#170138]">
                      Selecione um produto
                    </option>
                    <option value="seguro-auto" className="bg-[#170138]">Seguro Auto</option>
                    <option value="seguro-residencial" className="bg-[#170138]">Seguro Residencial</option>
                    <option value="seguro-vida" className="bg-[#170138]">Seguro de Vida</option>
                    <option value="consorcio-auto" className="bg-[#170138]">Consórcio Auto</option>
                    <option value="consorcio-imovel" className="bg-[#170138]">Consórcio Imóvel</option>
                    <option value="plano-saude" className="bg-[#170138]">Plano de Saúde</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5 pointer-events-none" />
                </div>

                <textarea
                  placeholder="Observações (Opcional)"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full border-2 border-[#29F3DF] text-white placeholder:text-white/60 px-6 py-4 rounded-2xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20 min-h-[100px] resize-none bg-transparent"
                />

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consentimento-multiplos"
                    checked={consentimento}
                    onChange={(e) => setConsentimento(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-2 border-[#29F3DF] bg-transparent checked:bg-[#29F3DF] checked:border-[#29F3DF] cursor-pointer"
                  />
                  <label htmlFor="consentimento-multiplos" className="text-white text-sm cursor-pointer leading-relaxed">
                    Confirmo que obtive consentimento do indicado para enviar seus dados.
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#C352F2]/30 hover:bg-[#C352F2]/40 text-white font-bold py-4 px-6 rounded-2xl transition-colors text-lg border border-[#C352F2]"
                >
                  ADICIONAR
                </button>
              </form>
            </div>

            {/* Lista de Indicações Adicionadas */}
            {indicacoes.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white mb-4">Indicações Adicionadas ({indicacoes.length})</h3>
                {indicacoes.map((ind, index) => (
                  <div key={index} className="bg-[#4A04A5]/40 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[#29F3DF]">{ind.nome}</h4>
                      <p className="text-sm text-white">{ind.email}</p>
                      <p className="text-sm text-white">{ind.telefone}</p>
                      <p className="text-xs text-[#29F3DF] mt-1">{ind.produto}</p>
                    </div>
                    <button
                      onClick={() => setIndicacoes(indicacoes.filter((_, i) => i !== index))}
                      className="w-10 h-10 rounded-xl bg-red-500 hover:bg-red flex items-center justify-center transition-colors"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Floating Action Button */}
            {indicacoes.length > 0 && (
              <div className="fixed bottom-28 right-6 z-50">
                <button
                  onClick={handleEnviarTodas}
                  className="w-16 h-16 bg-[#29F3DF] hover:bg-[#29F3DF]/90 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110"
                >
                  <Send className="w-7 h-7 text-[#4A04A5]" />
                </button>
              </div>
            )}
          </div>

          <BottomNav />
        </div>

        {/* DESKTOP VERSION - Nova Interface Web */}
        <div className="hidden lg:block relative z-10 min-h-screen">
          <div className="px-8 py-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-black dark:text-white">Indicações Múltiplas</h1>
                <p className="text-sm text-black dark:text-gray mt-1">
                  Adicione várias indicações de uma só vez
                </p>
              </div>
              {indicacoes.length > 0 && (
                <button
                  onClick={handleEnviarTodas}
                  className="bg-gradient-to-r from-[#29F3DF] to-[#29F3DF]/80 hover:from-[#29F3DF]/90 hover:to-[#29F3DF]/70 text-[#170138] font-bold py-3 px-8 rounded-xl transition-all shadow-lg flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Enviar Todas ({indicacoes.length})
                </button>
              )}
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Formulário - 7 colunas */}
              <div className="col-span-7">
                <div className="bg-white dark:bg-[#190d26] border border-gray dark:border-[#4A04A5]/30 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#29F3DF]/20 to-[#29F3DF]/5 flex items-center justify-center">
                      <UserPlus className="w-6 h-6 text-[#29F3DF]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-black dark:text-white">Nova Indicação</h2>
                      <p className="text-sm text-black dark:text-gray">Preencha os dados abaixo</p>
                    </div>
                  </div>

                  <form onSubmit={handleAddIndicacao} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-black dark:text-gray mb-2">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        placeholder="Digite o nome completo"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        className="w-full border-2 border-gray dark:border-[#4A04A5] bg-white dark:bg-[#190d26] text-black dark:text-white placeholder:text-gray dark:placeholder:text-gray-500 px-4 py-3 rounded-xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black dark:text-gray mb-2">
                        E-mail
                      </label>
                      <input
                        type="email"
                        placeholder="email@exemplo.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full border-2 border-gray dark:border-[#4A04A5] bg-white dark:bg-[#190d26] text-black dark:text-white placeholder:text-gray dark:placeholder:text-gray-500 px-4 py-3 rounded-xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black dark:text-gray mb-2">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        placeholder="(00) 00000-0000"
                        value={formData.telefone}
                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                        className="w-full border-2 border-gray dark:border-[#4A04A5] bg-white dark:bg-[#190d26] text-black dark:text-white placeholder:text-gray dark:placeholder:text-gray-500 px-4 py-3 rounded-xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black dark:text-gray mb-2">
                        Produto
                      </label>
                      <div className="relative">
                        <select
                          value={formData.produto}
                          onChange={(e) => setFormData({ ...formData, produto: e.target.value })}
                          className="w-full border-2 border-gray dark:border-[#4A04A5] bg-white dark:bg-[#190d26] text-black dark:text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20 appearance-none"
                          required
                        >
                          <option value="" disabled>
                            Selecione um produto
                          </option>
                          <option value="seguro-auto">Seguro Auto</option>
                          <option value="seguro-residencial">Seguro Residencial</option>
                          <option value="seguro-vida">Seguro de Vida</option>
                          <option value="consorcio-auto">Consórcio Auto</option>
                          <option value="consorcio-imovel">Consórcio Imóvel</option>
                          <option value="plano-saude">Plano de Saúde</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-black dark:text-gray-500 w-5 h-5 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black dark:text-gray mb-2">
                        Observações (Opcional)
                      </label>
                      <textarea
                        placeholder="Adicione informações relevantes..."
                        value={formData.observacoes}
                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                        className="w-full border-2 border-gray dark:border-[#4A04A5] bg-white dark:bg-[#190d26] text-black dark:text-white placeholder:text-gray dark:placeholder:text-gray-500 px-4 py-3 rounded-xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20 min-h-[100px] resize-none"
                      />
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#4A04A5]/10 rounded-xl">
                      <input
                        type="checkbox"
                        id="consentimento-multiplos-desktop"
                        checked={consentimento}
                        onChange={(e) => setConsentimento(e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-2 border-[#29F3DF] bg-transparent checked:bg-[#29F3DF] checked:border-[#29F3DF] cursor-pointer"
                      />
                      <label htmlFor="consentimento-multiplos-desktop" className="text-black dark:text-gray text-sm cursor-pointer leading-relaxed">
                        Confirmo que obtive consentimento do indicado para enviar seus dados.
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#C352F2] to-[#C352F2]/80 hover:from-[#C352F2]/90 hover:to-[#C352F2]/70 text-white font-bold py-4 px-6 rounded-xl transition-all text-lg shadow-lg flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-5 h-5" />
                      ADICIONAR À LISTA
                    </button>
                  </form>
                </div>
              </div>

              {/* Lista de Indicações - 5 colunas */}
              <div className="col-span-5">
                <div className="bg-white dark:bg-[#190d26] border border-gray dark:border-[#4A04A5]/30 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#C352F2]/20 to-[#C352F2]/5 flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#C352F2]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-black dark:text-white">Lista de Indicações</h3>
                        <p className="text-xs text-black dark:text-gray">
                          {indicacoes.length} {indicacoes.length === 1 ? "indicação" : "indicações"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {indicacoes.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#C352F2]/10 to-[#C352F2]/5 flex items-center justify-center">
                        <Users className="w-8 h-8 text-[#C352F2]" />
                      </div>
                      <h4 className="text-base font-bold text-black dark:text-white mb-2">
                        Nenhuma indicação adicionada
                      </h4>
                      <p className="text-sm text-black dark:text-gray">
                        Preencha o formulário ao lado para adicionar indicações
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                      {indicacoes.map((ind, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-[#4A04A5]/10 to-transparent border border-[#4A04A5]/20 rounded-xl p-4 hover:from-[#4A04A5]/20 transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-[#29F3DF] text-base mb-1 truncate">{ind.nome}</h4>
                              <p className="text-sm text-black dark:text-gray truncate">{ind.email}</p>
                              <p className="text-sm text-black dark:text-gray">{ind.telefone}</p>
                              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-[#C352F2]/20 border border-[#C352F2]/30">
                                <p className="text-xs font-medium text-[#C352F2]">{ind.produto}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setIndicacoes(indicacoes.filter((_, i) => i !== index))}
                              className="ml-3 w-9 h-9 rounded-lg bg-red-500 hover:bg-red flex items-center justify-center transition-colors flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {indicacoes.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray dark:border-[#4A04A5]/30">
                      <button
                        onClick={handleEnviarTodas}
                        className="w-full bg-gradient-to-r from-[#29F3DF] to-[#29F3DF]/80 hover:from-[#29F3DF]/90 hover:to-[#29F3DF]/70 text-[#170138] font-bold py-3 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                        <Send className="w-5 h-5" />
                        Enviar {indicacoes.length} {indicacoes.length === 1 ? "Indicação" : "Indicações"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>

      {/* Alert Modal */}
      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        title={alertTitle}
        message={alertMessage}
      />
    </>
  )
}
