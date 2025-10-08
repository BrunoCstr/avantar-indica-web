"use client"

import { useState } from "react"
import { ArrowLeft, ChevronDown } from "lucide-react"

interface IndicarModalProps {
  isOpen: boolean
  onClose: () => void
}

export function IndicarModal({ isOpen, onClose }: IndicarModalProps) {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    produto: "",
    observacoes: "",
  })
  const [consentimento, setConsentimento] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!consentimento) {
      alert("Você precisa confirmar que obteve consentimento do indicado")
      return
    }
    
    // Salva indicação
    const indicacoes = JSON.parse(localStorage.getItem("avantar_indicacoes") || "[]")
    indicacoes.push({
      ...formData,
      id: Date.now(),
      status: "Pendente",
      data: new Date().toISOString(),
    })
    localStorage.setItem("avantar_indicacoes", JSON.stringify(indicacoes))
    
    alert("Indicação enviada com sucesso!")
    
    // Reset form and close modal
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      produto: "",
      observacoes: "",
    })
    setConsentimento(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#170138] border-2 border-[#29F3DF] rounded-3xl p-6 mx-auto">
        {/* Header */}
        <div className="flex w-full justify-between items-center gap-4 mb-6">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-[#29F3DF]/20 flex items-center justify-center hover:bg-[#29F3DF]/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#29F3DF]" />
          </button>
          <h2 className="text-[#29F3DF] font-bold text-2xl mr-32">Indicar</h2>
          <div></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome e sobrenome */}
          <div>
            <input
              type="text"
              placeholder="Nome e sobrenome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full bg-[#170138] border-2 border-[#29F3DF] text-white placeholder:text-[#29F3DF]/70 px-4 py-3 rounded-xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20"
              required
            />
          </div>

          {/* E-mail */}
          <div>
            <input
              type="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#170138] border-2 border-[#29F3DF] text-white placeholder:text-[#29F3DF]/70 px-4 py-3 rounded-xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20"
              required
            />
          </div>

          {/* Telefone */}
          <div>
            <input
              type="tel"
              placeholder="Telefone"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              className="w-full bg-[#170138] border-2 border-[#29F3DF] text-white placeholder:text-[#29F3DF]/70 px-4 py-3 rounded-xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20"
              required
            />
          </div>

          {/* Produto desejado */}
          <div className="relative">
            <select
              value={formData.produto}
              onChange={(e) => setFormData({ ...formData, produto: e.target.value })}
              className="w-full bg-[#170138] border-2 border-[#29F3DF] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20 appearance-none"
              required
            >
              <option value="" disabled className="bg-[#170138] text-white">
                Produto desejado
              </option>
              <option value="seguro-auto" className="bg-[#170138] text-white">Seguro Auto</option>
              <option value="seguro-residencial" className="bg-[#170138] text-white">Seguro Residencial</option>
              <option value="seguro-vida" className="bg-[#170138] text-white">Seguro de Vida</option>
              <option value="consorcio-auto" className="bg-[#170138] text-white">Consórcio Auto</option>
              <option value="consorcio-imovel" className="bg-[#170138] text-white">Consórcio Imóvel</option>
              <option value="plano-saude" className="bg-[#170138] text-white">Plano de Saúde</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#29F3DF]/70 w-5 h-5 pointer-events-none" />
          </div>

          {/* Observações */}
          <div>
            <textarea
              placeholder="Observações..."
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              className="w-full bg-[#170138] border-2 border-[#29F3DF] text-white placeholder:text-[#29F3DF]/70 px-4 py-3 rounded-xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20 min-h-[100px] resize-none"
            />
          </div>

          {/* Consentimento */}
          <div className="flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              id="consentimento"
              checked={consentimento}
              onChange={(e) => setConsentimento(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-2 border-[#29F3DF] bg-[#170138] checked:bg-[#29F3DF] checked:border-[#29F3DF] cursor-pointer"
            />
            <label htmlFor="consentimento" className="text-[#29F3DF]/90 text-sm cursor-pointer leading-relaxed">
              Confirmo que obtive consentimento do indicado para enviar seus dados.
            </label>
          </div>

          {/* Botão ENVIAR */}
          <button
            type="submit"
            className="w-full bg-[#29F3DF] hover:bg-[#29F3DF]/90 text-[#170138] font-bold py-4 px-6 rounded-xl transition-colors text-lg mt-4"
          >
            ENVIAR
          </button>
        </form>
      </div>
    </div>
  )
}
