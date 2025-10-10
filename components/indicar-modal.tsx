"use client"

import { useState } from "react"
import { ArrowLeft, ChevronDown } from "lucide-react"
import { useAuth } from "@/context/Auth"
import { AlertModal } from "@/components/alert-modal"

interface IndicarModalProps {
  isOpen: boolean
  onClose: () => void
}

export function IndicarModal({ isOpen, onClose }: IndicarModalProps) {
  const { userData } = useAuth()
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Verifica se o usuário tem permissão para indicar
    if (userData?.rule === "nao_definida") {
      setAlertMessage("Seu cadastro ainda não foi aprovado pela unidade. Aguarde a aprovação para poder fazer indicações.")
      setShowAlertModal(true)
      return
    }
    
    if (!consentimento) {
      setAlertMessage("Você precisa confirmar que obteve consentimento do indicado")
      setShowAlertModal(true)
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
    
    setAlertMessage("Indicação enviada com sucesso!")
    setShowAlertModal(true)
    
    // Reset form and close modal
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      produto: "",
      observacoes: "",
    })
    setConsentimento(false)
    
    // Fecha o modal após um delay para mostrar a mensagem
    setTimeout(() => {
      onClose()
    }, 100)
  }

  if (!isOpen) return null

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-fifth-purple dark:bg-purple-black border-2 border-blue rounded-3xl p-6 mx-auto">
        {/* Header */}
        <div className="flex w-full justify-between items-center gap-4 mb-6">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-blue/20 flex items-center justify-center hover:bg-blue/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-blue" />
          </button>
          <h2 className="text-blue font-bold text-2xl mr-32">Indicar</h2>
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
              className="w-full bg-fifth-purple dark:bg-purple-black border-2 border-blue text-white placeholder:text-blue/70 px-4 py-3 rounded-xl focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
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
              className="w-full bg-fifth-purple dark:bg-purple-black border-2 border-blue text-white placeholder:text-blue/70 px-4 py-3 rounded-xl focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
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
              className="w-full bg-fifth-purple dark:bg-purple-black border-2 border-blue text-white placeholder:text-blue/70 px-4 py-3 rounded-xl focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
              required
            />
          </div>

          {/* Produto desejado */}
          <div className="relative">
            <select
              value={formData.produto}
              onChange={(e) => setFormData({ ...formData, produto: e.target.value })}
              className="w-full bg-fifth-purple dark:bg-purple-black border-2 border-blue text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 appearance-none"
              required
            >
              <option value="" disabled className="bg-fifth-purple dark:bg-purple-black text-white">
                Produto desejado
              </option>
              <option value="seguro-auto" className="bg-fifth-purple dark:bg-purple-black text-white">Seguro Auto</option>
              <option value="seguro-residencial" className="bg-fifth-purple dark:bg-purple-black text-white">Seguro Residencial</option>
              <option value="seguro-vida" className="bg-fifth-purple dark:bg-purple-black text-white">Seguro de Vida</option>
              <option value="consorcio-auto" className="bg-fifth-purple dark:bg-purple-black text-white">Consórcio Auto</option>
              <option value="consorcio-imovel" className="bg-fifth-purple dark:bg-purple-black text-white">Consórcio Imóvel</option>
              <option value="plano-saude" className="bg-fifth-purple dark:bg-purple-black text-white">Plano de Saúde</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-blue/70 w-5 h-5 pointer-events-none" />
          </div>

          {/* Observações */}
          <div>
            <textarea
              placeholder="Observações..."
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              className="w-full bg-fifth-purple dark:bg-purple-black border-2 border-blue text-white placeholder:text-blue/70 px-4 py-3 rounded-xl focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 min-h-[100px] resize-none"
            />
          </div>

          {/* Consentimento */}
          <div className="flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              id="consentimento"
              checked={consentimento}
              onChange={(e) => setConsentimento(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-2 border-blue bg-fifth-purple dark:bg-purple-black checked:bg-blue checked:border-blue cursor-pointer"
            />
            <label htmlFor="consentimento" className="text-blue/90 text-sm cursor-pointer leading-relaxed">
              Confirmo que obtive consentimento do indicado para enviar seus dados.
            </label>
          </div>

          {/* Botão ENVIAR */}
          <button
            type="submit"
            className="w-full bg-blue hover:bg-blue-light text-fifth-purple dark:text-purple-black font-bold py-4 px-6 rounded-xl transition-colors text-lg mt-4"
          >
            ENVIAR
          </button>
        </form>
      </div>
    </div>

    {/* Alert Modal */}
    <AlertModal
      isOpen={showAlertModal}
      onClose={() => setShowAlertModal(false)}
      title={alertMessage.includes("sucesso") ? "Sucesso!" : alertMessage.includes("consentimento") ? "Atenção" : "Cadastro Pendente"}
      message={alertMessage}
    />
    </>
  )
}
