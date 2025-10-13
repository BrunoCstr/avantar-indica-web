"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { BackButton } from "@/components/back-button"
import { BottomNav } from "@/components/bottom-nav"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { PageContainer, PageBackground } from "@/components/page-container"
import { Bell, CheckCheck, Clock, DollarSign, UserCheck, AlertCircle } from "lucide-react"
import { useAuth } from "@/context/Auth"
import { Spinner } from "@/components/Spinner"
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/services/notifications/notifications"

interface NotificationItem {
  notificationId: string
  type?: "campanha" | "proposta" | "saque" | "sistema"
  title?: string
  body?: string
  read?: boolean
  createdAt?: any
}

export default function NotificacoesPage() {
  const router = useRouter()
  const { userData, isLoading } = useAuth()

  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loadingPage, setLoadingPage] = useState(true)
  const [cursor, setCursor] = useState<any | null>(null)
  const [hasMore, setHasMore] = useState(false)

  const pageSize = 20

  const fetchAndMarkAsRead = useCallback(async () => {
    if (!userData?.uid) return
    setLoadingPage(true)
    try {
      const { data, cursor, hasMore } = await getNotifications(userData.uid, pageSize, null)
      setNotifications(data)
      setCursor(cursor)
      setHasMore(hasMore)

      // marca todas como lidas ao abrir, como no app RN
      await markAllNotificationsAsRead(userData.uid)
      // reflete imediatamente no estado
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (error) {
      console.error("Erro ao carregar notificações:", error)
    } finally {
      setLoadingPage(false)
    }
  }, [userData?.uid])

  useEffect(() => {
    fetchAndMarkAsRead()
  }, [fetchAndMarkAsRead])

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

  const formatDate = (dateInput: any) => {
    const date = dateInput?.toDate ? dateInput.toDate() : new Date(dateInput)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Agora"
    if (diffInHours < 24) return `${diffInHours}h atrás`
    if (diffInHours < 48) return "Ontem"
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
  }

  const markAsRead = async (notificationId: string) => {
    if (!userData?.uid) return
    setNotifications((prev) => prev.map((n) => (n.notificationId === notificationId ? { ...n, read: true } : n)))
    try {
      await markNotificationAsRead(userData.uid, notificationId)
    } catch (e) {
      // silencia e mantém otimista
    }
  }

  const markAllAsRead = async () => {
    if (!userData?.uid) return
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    try {
      await markAllNotificationsAsRead(userData.uid)
    } catch (e) {}
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
          {loadingPage ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.notificationId}
                  onClick={() => markAsRead(notification.notificationId)}
                  className={`bg-white rounded-2xl p-5 shadow-sm border-2 transition-all cursor-pointer hover:shadow-md ${
                    notification.read ? "border-transparent" : "border-[#29F3DF]"
                  }`}
                >
                  <div className="flex gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type || "sistema")}`}
                    >
                      {getIcon(notification.type || "sistema")}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`font-bold ${notification.read ? "text-gray-700" : "text-[#4A04A5]"}`}>
                          {notification.title || "Notificação"}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {notification.createdAt ? formatDate(notification.createdAt) : ""}
                          </span>
                          {!notification.read && <div className="w-2 h-2 rounded-full bg-[#29F3DF]" />}
                        </div>
                      </div>
                      <p className={`text-sm ${notification.read ? "text-gray-500" : "text-gray-700"}`}>
                        {notification.body || ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

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
