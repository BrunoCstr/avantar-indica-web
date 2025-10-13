"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BackButton } from "@/components/back-button"
import { BottomNav } from "@/components/bottom-nav"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { PageContainer, PageBackground } from "@/components/page-container"
import { Bell, CheckCheck, Clock, DollarSign, UserCheck, AlertCircle } from "lucide-react"
import { useAuth } from "@/context/Auth"

interface Notification {
  id: string
  type: "campanha" | "proposta" | "saque" | "sistema"
  title: string
  message: string
  date: string
  read: boolean
}

export default function NotificacoesPage() {
  const router = useRouter()
  const { userData, isLoading } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "proposta",
      title: "Proposta Fechada",
      message: "Sua indicação para João Silva foi fechada com sucesso! Comissão de R$ 700,00 disponível.",
      date: "2025-10-08T10:30:00",
      read: false,
    },
    {
      id: "2",
      type: "saque",
      title: "Saque Aprovado",
      message: "Seu saque de R$ 1.500,00 foi aprovado e será processado em até 2 dias úteis.",
      date: "2025-10-07T15:45:00",
      read: false,
    },
    {
      id: "3",
      type: "campanha",
      title: "Nova Campanha Disponível",
      message: "Campanha especial de outubro com 50% de bônus em todas as indicações!",
      date: "2025-10-06T09:00:00",
      read: true,
    },
    {
      id: "4",
      type: "proposta",
      title: "Proposta em Análise",
      message: "A proposta de Maria Santos está em análise pela equipe comercial.",
      date: "2025-10-05T14:20:00",
      read: true,
    },
    {
      id: "5",
      type: "sistema",
      title: "Atualização do Sistema",
      message: "O aplicativo foi atualizado com novas funcionalidades. Confira as novidades!",
      date: "2025-10-04T08:00:00",
      read: true,
    },
  ])

  const getIcon = (type: string) => {
    switch (type) {
      case "campanha":
        return <Bell className="w-5 h-5" />
      case "proposta":
        return <UserCheck className="w-5 h-5" />
      case "saque":
        return <DollarSign className="w-5 h-5" />
      case "sistema":
        return <AlertCircle className="w-5 h-5" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case "campanha":
        return "bg-[#F28907]/10 text-[#F28907]"
      case "proposta":
        return "bg-[#29F3DF]/10 text-[#29F3DF]"
      case "saque":
        return "bg-green-500/10 text-green-500"
      case "sistema":
        return "bg-[#C352F2]/10 text-[#C352F2]"
      default:
        return "bg-[#4A04A5]/10 text-[#4A04A5]"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Agora"
    if (diffInHours < 24) return `${diffInHours}h atrás`
    if (diffInHours < 48) return "Ontem"
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <>
      <DesktopSidebar />

      <PageContainer className="pb-24 lg:pb-8">
        {/* Background - Mobile: bg-white-responsive | Desktop: cor sólida do tema */}
        <div className="lg:hidden">
          <PageBackground className="bg-white-responsive" />
        </div>
        <div className="hidden lg:block">
          <PageBackground />
        </div>

        <div className="relative z-10 p-6 max-w-4xl mx-auto">
          {/* Header Mobile */}
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <BackButton />
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-[#4A04A5]">Notificações</h1>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 text-sm text-[#29F3DF] hover:text-[#29F3DF]/80 font-medium"
                >
                  <CheckCheck className="w-4 h-4" />
                  Marcar todas como lidas
                </button>
              )}
            </div>
            {unreadCount > 0 && (
              <p className="text-white">
                Você tem {unreadCount} {unreadCount === 1 ? "notificação não lida" : "notificações não lidas"}
              </p>
            )}
          </div>

          {/* Lista de Notificações */}
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`bg-white rounded-2xl p-5 shadow-sm border-2 transition-all cursor-pointer hover:shadow-md ${
                  notification.read ? "border-transparent" : "border-[#29F3DF]"
                }`}
              >
                <div className="flex gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type)}`}
                  >
                    {getIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`font-bold ${notification.read ? "text-gray-700" : "text-[#4A04A5]"}`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(notification.date)}
                        </span>
                        {!notification.read && <div className="w-2 h-2 rounded-full bg-[#29F3DF]" />}
                      </div>
                    </div>
                    <p className={`text-sm ${notification.read ? "text-gray-500" : "text-gray-700"}`}>
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Estado Vazio */}
          {notifications.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-[#4A04A5]/10 flex items-center justify-center mx-auto mb-4">
                <Bell className="w-10 h-10 text-[#4A04A5]" />
              </div>
              <h3 className="text-xl font-bold text-[#4A04A5] mb-2">Nenhuma notificação</h3>
              <p className="text-gray-600">Você não tem notificações no momento.</p>
            </div>
          )}
        </div>

        <BottomNav />
      </PageContainer>
    </>
  )
}
