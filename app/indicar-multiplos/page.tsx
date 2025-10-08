"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BackButton } from "@/components/back-button"
import { BottomNav } from "@/components/bottom-nav"
import { ChevronDown, Users, Send } from "lucide-react"

interface Indicacao {
  nome: string
  email: string
  telefone: string
  produto: string
  observacoes: string
}

export default function IndicarMultiplosPage() {
  const router = useRouter()
  const [indicacoes, setIndicacoes] = useState<Indicacao[]>([])
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    produto: "",
    observacoes: "",
  })
  const [consentimento, setConsentimento] = useState(false)

  const handleAddIndicacao = (e: React.FormEvent) => {
    e.preventDefault()
    if (!consentimento) {
      alert("Você precisa confirmar que obteve consentimento do indicado")
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
      alert("Adicione pelo menos uma indicação")
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
    alert(`${indicacoes.length} indicações enviadas com sucesso!`)
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen relative pb-24">
      <div className="fixed inset-0 bg-dark-responsive" />

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
              className="w-full border-2 border-[#29F3DF] text-white placeholder:text-white/60 px-6 py-4 rounded-2xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20"
              required
            />

            <input
              type="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border-2 border-[#29F3DF] text-white placeholder:text-white/60 px-6 py-4 rounded-2xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20"
              required
            />

            <input
              type="tel"
              placeholder="Telefone"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              className="w-full border-2 border-[#29F3DF] text-white placeholder:text-white/60 px-6 py-4 rounded-2xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20"
              required
            />

            <div className="relative">
              <select
                value={formData.produto}
                onChange={(e) => setFormData({ ...formData, produto: e.target.value })}
                className="w-full border-2 border-[#29F3DF] text-white px-6 py-4 rounded-2xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20 appearance-none"
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
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5 pointer-events-none" />
            </div>

            <textarea
              placeholder="Observações (Opcional)"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              className="w-full border-2 border-[#29F3DF] text-white placeholder:text-white/60 px-6 py-4 rounded-2xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20 min-h-[100px] resize-none"
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
                  className="w-10 h-10 rounded-xl bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
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
  )
}
