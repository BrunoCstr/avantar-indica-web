"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { BackButton } from "@/components/back-button"
import { BottomNav } from "@/components/bottom-nav"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { PageContainer, PageBackground } from "@/components/page-container"
import { UISettings } from "@/components/ui-settings"
import { Bell, Lock, AlertTriangle, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/context/Auth"
import { Spinner } from "@/components/Spinner"
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  changeUserPassword,
  deactivateAccount,
  NotificationPreferences,
} from "@/services/settings/settings"

export default function ConfiguracoesPage() {
  const router = useRouter()
  const { userData, isLoading } = useAuth()
  const [notifCampanhas, setNotifCampanhas] = useState(true)
  const [notifPropostas, setNotifPropostas] = useState(true)
  const [notifSaque, setNotifSaque] = useState(true)

  const [loadingPrefs, setLoadingPrefs] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [loadingDeactivate, setLoadingDeactivate] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const [modalMessage, setModalMessage] = useState({
    title: "",
    description: "",
  })
  const [showModal, setShowModal] = useState(false)

  const [senhaAtual, setSenhaAtual] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")

  const [showSenhaAtual, setShowSenhaAtual] = useState(false)
  const [showNovaSenha, setShowNovaSenha] = useState(false)
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false)

  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Carregar preferências de notificação
  useEffect(() => {
    const loadPreferences = async () => {
      if (!userData?.uid) return
      try {
        const prefs = await getNotificationPreferences(userData.uid)
        setNotifCampanhas(prefs.campaigns)
        setNotifPropostas(prefs.status)
        setNotifSaque(prefs.withdraw)
      } catch (error) {
        console.error("Erro ao carregar preferências:", error)
      }
    }
    loadPreferences()
  }, [userData?.uid])

  // Função do Pull Refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      if (userData?.uid) {
        const prefs = await getNotificationPreferences(userData.uid)
        setNotifCampanhas(prefs.campaigns)
        setNotifPropostas(prefs.status)
        setNotifSaque(prefs.withdraw)
      }
    } catch (error) {
      console.error("Erro ao atualizar configurações:", error)
    } finally {
      setRefreshing(false)
    }
  }, [userData?.uid])

  const handleAlterarSenha = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setModalMessage({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para alterar a senha.",
      })
      setShowModal(true)
      return
    }

    if (novaSenha !== confirmarSenha) {
      setModalMessage({
        title: "Senhas diferentes",
        description: "A nova senha e a confirmação não coincidem.",
      })
      setShowModal(true)
      return
    }

    setLoadingPassword(true)
    try {
      await changeUserPassword(senhaAtual, novaSenha)
      
      setSenhaAtual("")
      setNovaSenha("")
      setConfirmarSenha("")
      
      setModalMessage({
        title: "Sucesso",
        description: "Senha alterada com sucesso!",
      })
      setShowModal(true)
    } catch (error: any) {
      setModalMessage({
        title: "Erro",
        description: error.message || "Erro ao alterar senha. Tente novamente.",
      })
      setShowModal(true)
    } finally {
      setLoadingPassword(false)
    }
  }

  const handleSaveNotificationPreferences = async () => {
    if (!userData?.uid) return
    setLoadingPrefs(true)
    try {
      await updateNotificationPreferences(userData.uid, {
        campaigns: notifCampanhas,
        status: notifPropostas,
        withdraw: notifSaque,
      })
      setModalMessage({
        title: "Sucesso",
        description: "Preferências de notificação atualizadas!",
      })
      setShowModal(true)
    } catch (error) {
      setModalMessage({
        title: "Erro",
        description: "Não foi possível atualizar as preferências.",
      })
      setShowModal(true)
    } finally {
      setLoadingPrefs(false)
    }
  }

  const handleDesativarConta = async () => {
    if (!userData?.uid) return
    setLoadingDeactivate(true)
    try {
      await deactivateAccount(userData.uid)
      setModalMessage({
        title: "Conta desativada",
        description: "Sua conta foi desativada com sucesso. Você será redirecionado para a tela de login.",
      })
      setShowModal(true)
      // Redirecionar após um tempo
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (error: any) {
      setModalMessage({
        title: "Erro",
        description: "Não foi possível desativar a conta. Tente novamente.",
      })
      setShowModal(true)
    } finally {
      setLoadingDeactivate(false)
      setShowDeleteModal(false)
    }
  }

  if (isLoading || !userData) {
    return (
      <div className="min-h-screen bg-[#4A04A5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#29F3DF] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white mt-4">Carregando...</p>
        </div>
      </div>
    )
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

          <h1 className="text-3xl font-bold text-black dark:text-white text-center mb-8">Configurações</h1>

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

              {/* Botão Salvar Alterações */}
              <div className="mt-4">
                <button
                  onClick={handleSaveNotificationPreferences}
                  disabled={loadingPrefs}
                  className="w-full bg-[#4A04A5] hover:bg-[#4A04A5]/90 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-2xl transition-colors flex items-center justify-center"
                >
                  {loadingPrefs ? <Spinner variant="blue" /> : "Salvar Alterações"}
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
                disabled={loadingPassword}
                className="w-full bg-[#29F3DF] hover:bg-[#29F3DF]/90 disabled:opacity-50 text-[#170138] font-bold py-4 px-6 rounded-2xl transition-colors flex items-center justify-center"
              >
                {loadingPassword ? <Spinner /> : "Alterar Senha"}
              </button>
            </form>
          </div>

          {/* Seção de Desativar Conta */}
          <div className="bg-white rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red" />
              </div>
              <h2 className="text-xl font-bold text-red">Zona de Perigo</h2>
            </div>

            <p className="text-gray-600 mb-4">
              Ao desativar sua conta, você perderá acesso a todas as suas indicações e comissões pendentes. Esta ação
              não pode ser desfeita.
            </p>

            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={loadingDeactivate}
              className="w-full bg-red hover:bg-red-600 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-2xl transition-colors flex items-center justify-center"
            >
              {loadingDeactivate ? <Spinner /> : "Desativar Conta"}
            </button>
          </div>
        </div>

        <BottomNav />
      </PageContainer>

      {/* Modal de Sucesso/Erro */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <div className="w-16 h-16 rounded-full bg-[#4A04A5]/10 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-[#4A04A5]" />
            </div>
            <h3 className="text-2xl font-bold text-[#4A04A5] text-center mb-2">{modalMessage.title}</h3>
            <p className="text-gray-600 text-center mb-6">{modalMessage.description}</p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-[#4A04A5] hover:bg-[#4A04A5]/90 text-white font-bold py-3 px-6 rounded-2xl transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Desativação */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <div className="w-16 h-16 rounded-full bg-red/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red" />
            </div>

            <h3 className="text-2xl font-bold text-[#4A04A5] text-center mb-2">Desativar Conta?</h3>
            <p className="text-gray-600 text-center mb-6">
              Tem certeza que deseja desativar sua conta? Caso se arrependa, você poderá reativar sua conta em até 30 dias entrando em contato com a unidade afiliada.
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
                disabled={loadingDeactivate}
                className="flex-1 bg-red hover:bg-red-600 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-2xl transition-colors flex items-center justify-center"
              >
                {loadingDeactivate ? <Spinner /> : "Desativar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
