"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BackButton } from "@/components/back-button"
import { BottomNav } from "@/components/bottom-nav"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { PageContainer, PageBackground } from "@/components/page-container"
import { UISettings } from "@/components/ui-settings"
import { Bell, Lock, AlertTriangle, Eye, EyeOff } from "lucide-react"

export default function ConfiguracoesPage() {
  const router = useRouter()
  const [notifCampanhas, setNotifCampanhas] = useState(true)
  const [notifPropostas, setNotifPropostas] = useState(true)
  const [notifSaque, setNotifSaque] = useState(true)

  const [senhaAtual, setSenhaAtual] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")

  const [showSenhaAtual, setShowSenhaAtual] = useState(false)
  const [showNovaSenha, setShowNovaSenha] = useState(false)
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false)

  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("avantar_token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  const handleAlterarSenha = (e: React.FormEvent) => {
    e.preventDefault()

    if (novaSenha !== confirmarSenha) {
      alert("As senhas não coincidem!")
      return
    }

    if (novaSenha.length < 6) {
      alert("A nova senha deve ter no mínimo 6 caracteres!")
      return
    }

    // Aqui você faria a chamada à API para alterar a senha
    alert("Senha alterada com sucesso!")
    setSenhaAtual("")
    setNovaSenha("")
    setConfirmarSenha("")
  }

  const handleDesativarConta = () => {
    // Aqui você faria a chamada à API para desativar a conta
    alert("Conta desativada com sucesso!")
    localStorage.removeItem("avantar_token")
    localStorage.removeItem("avantar_user")
    router.push("/login")
  }

  return (
    <>
      <DesktopSidebar />

      <PageContainer className="pb-24 lg:pb-8">
        <PageBackground />

        <div className="relative z-10 p-6 max-w-4xl mx-auto">
          {/* Header Mobile */}
          <div className="mb-6 lg:hidden">
            <BackButton />
          </div>

          <h1 className="text-3xl font-bold text-white text-center mb-8">Configurações</h1>

          {/* Seção de Configurações de Interface */}
          <div className="mb-6">
            <UISettings />
          </div>

          {/* Seção de Notificações */}
          <div className="bg-white rounded-3xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#4A04A5]/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#4A04A5]" />
              </div>
              <h2 className="text-xl font-bold text-[#4A04A5]">Notificações</h2>
            </div>

            <div className="space-y-4">
              {/* Switch Campanhas */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-semibold text-[#4A04A5]">Notificações de Campanhas</p>
                  <p className="text-sm text-gray-600">Receba avisos sobre novas campanhas e promoções</p>
                </div>
                <button
                  onClick={() => setNotifCampanhas(!notifCampanhas)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    notifCampanhas ? "bg-[#29F3DF]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      notifCampanhas ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Switch Propostas */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-semibold text-[#4A04A5]">Notificações das Propostas</p>
                  <p className="text-sm text-gray-600">Receba atualizações sobre suas indicações</p>
                </div>
                <button
                  onClick={() => setNotifPropostas(!notifPropostas)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    notifPropostas ? "bg-[#29F3DF]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      notifPropostas ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Switch Saque */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-semibold text-[#4A04A5]">Notificações de Saque</p>
                  <p className="text-sm text-gray-600">Receba confirmações de saques realizados</p>
                </div>
                <button
                  onClick={() => setNotifSaque(!notifSaque)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    notifSaque ? "bg-[#29F3DF]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      notifSaque ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Seção de Alteração de Senha */}
          <div className="bg-white rounded-3xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#4A04A5]/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#4A04A5]" />
              </div>
              <h2 className="text-xl font-bold text-[#4A04A5]">Alteração de Senha</h2>
            </div>

            <form onSubmit={handleAlterarSenha} className="space-y-4">
              {/* Senha Atual */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Senha Atual</label>
                <div className="relative">
                  <input
                    type={showSenhaAtual ? "text" : "password"}
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    placeholder="Digite sua senha atual"
                    className="w-full bg-[#4A04A5]/5 border-2 border-[#29F3DF] rounded-2xl px-4 py-4 text-[#4A04A5] placeholder:text-[#4A04A5]/40 focus:outline-none focus:border-[#29F3DF] pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenhaAtual(!showSenhaAtual)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4A04A5]/60 hover:text-[#4A04A5]"
                  >
                    {showSenhaAtual ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Nova Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nova Senha</label>
                <div className="relative">
                  <input
                    type={showNovaSenha ? "text" : "password"}
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Digite sua nova senha"
                    className="w-full bg-[#4A04A5]/5 border-2 border-[#29F3DF] rounded-2xl px-4 py-4 text-[#4A04A5] placeholder:text-[#4A04A5]/40 focus:outline-none focus:border-[#29F3DF] pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNovaSenha(!showNovaSenha)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4A04A5]/60 hover:text-[#4A04A5]"
                  >
                    {showNovaSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Nova Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nova Senha</label>
                <div className="relative">
                  <input
                    type={showConfirmarSenha ? "text" : "password"}
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="Confirme sua nova senha"
                    className="w-full bg-[#4A04A5]/5 border-2 border-[#29F3DF] rounded-2xl px-4 py-4 text-[#4A04A5] placeholder:text-[#4A04A5]/40 focus:outline-none focus:border-[#29F3DF] pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4A04A5]/60 hover:text-[#4A04A5]"
                  >
                    {showConfirmarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#29F3DF] hover:bg-[#29F3DF]/90 text-[#170138] font-bold py-4 px-6 rounded-2xl transition-colors"
              >
                Alterar Senha
              </button>
            </form>
          </div>

          {/* Seção de Desativar Conta */}
          <div className="bg-white rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-red-500">Zona de Perigo</h2>
            </div>

            <p className="text-gray-600 mb-4">
              Ao desativar sua conta, você perderá acesso a todas as suas indicações e comissões pendentes. Esta ação
              não pode ser desfeita.
            </p>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-2xl transition-colors"
            >
              Desativar Conta
            </button>
          </div>
        </div>

        <BottomNav />
      </PageContainer>

      {/* Modal de Confirmação */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            <h3 className="text-2xl font-bold text-[#4A04A5] text-center mb-2">Desativar Conta?</h3>
            <p className="text-gray-600 text-center mb-6">
              Tem certeza que deseja desativar sua conta? Esta ação não pode ser desfeita e você perderá acesso a todas
              as suas informações.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-2xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDesativarConta}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-2xl transition-colors"
              >
                Desativar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
