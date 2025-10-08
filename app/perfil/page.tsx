"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BackButton } from "@/components/back-button"
import { BottomNav } from "@/components/bottom-nav"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { LogOut, Edit, User, Phone, CreditCard } from "lucide-react"
import Link from "next/link"

interface UserData {
  nome: string
  telefone: string
  email: string
  chavePix: string
}

export default function PerfilPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("avantar_user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("avantar_token")
    localStorage.removeItem("avantar_user")
    router.push("/login")
  }

  if (!user) {
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
    <div className="min-h-screen lg:pl-64">
      <DesktopSidebar />

      <div className="min-h-screen relative pb-24 lg:pb-8">
        <div className="fixed inset-0 bg-dark-responsive" />

        <div className="relative z-10 p-6">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <BackButton />
            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-sm border-2 border-red-500 text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          <h1 className="text-3xl font-bold text-white text-center mb-8">Perfil</h1>

          {/* Foto de Perfil */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#29F3DF] to-[#C352F2] p-1">
                <div className="w-full h-full rounded-full bg-[#4A04A5] flex items-center justify-center overflow-hidden">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-10-08%20at%2008.53.18%20(1)-rX4Qs-yLD9hO2Z3nnrE6RlwFyw2MmUebYn8r.jpeg"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-[#29F3DF] hover:bg-[#29F3DF]/90 flex items-center justify-center shadow-lg transition-colors">
                <Edit className="w-5 h-5 text-[#170138]" />
              </button>
            </div>
          </div>

          {/* Card de Informações */}
          <div className="bg-white rounded-3xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#4A04A5]">Informações do usuário</h2>
              <button className="text-[#4A04A5] hover:text-[#29F3DF] font-medium text-sm">Editar</button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#4A04A5]/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-[#4A04A5]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Nome</p>
                  <p className="font-bold text-[#4A04A5]">{user.nome}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#4A04A5]/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-[#4A04A5]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Telefone</p>
                  <p className="font-bold text-[#4A04A5]">{user.telefone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card de Pagamento */}
          <div className="bg-white rounded-3xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#4A04A5]">Dados para pagamento</h2>
              <button className="text-[#4A04A5] hover:text-[#29F3DF] font-medium text-sm">Editar</button>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#4A04A5]/10 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-[#4A04A5]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Chave pix</p>
                <p className="font-bold text-[#4A04A5]">{user.chavePix}</p>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="space-y-4">
            <Link
              href="/configuracoes"
              className="block w-full bg-[#F28907] hover:bg-[#F28907]/90 text-white font-bold py-5 px-6 rounded-2xl transition-colors text-lg text-center"
            >
              CONFIGURAÇÕES
            </Link>

            <Link
              href="/vendedores"
              className="block w-full bg-[#29F3DF] hover:bg-[#29F3DF]/90 text-[#170138] font-bold py-5 px-6 rounded-2xl transition-colors text-lg text-center"
            >
              VENDEDORES
            </Link>
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  )
}
