"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BackButton } from "@/components/back-button"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    login: "",
    senha: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simula login
    localStorage.setItem("avantar_token", "mock_token")
    localStorage.setItem(
      "avantar_user",
      JSON.stringify({
        nome: "Bruno de Castro",
        telefone: "(33) 99944-2685",
        email: formData.login,
        chavePix: "brunocrl123@hotmail.com",
      }),
    )
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background com imagem */}
      <div className="absolute inset-0 bg-login-responsive" />

      {/* Content */}
      <div className="relative z-10 min-h-screen p-6">
        <div className="mb-8">
          <BackButton />
        </div>

        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
          <h1 className="text-3xl font-bold text-white mb-12">Faça seu login</h1>

          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
            <div>
              <input
                type="text"
                placeholder="Login"
                value={formData.login}
                onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                className="w-full bg-[#4A04A5]/30 border-2 border-[#29F3DF] text-white placeholder:text-white/60 px-6 py-4 rounded-2xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                className="w-full bg-[#4A04A5]/30 border-2 border-[#29F3DF] text-white placeholder:text-white/60 px-6 py-4 rounded-2xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-[#29F3DF] hover:bg-[#29F3DF]/90 text-[#170138] font-bold py-4 px-6 rounded-2xl transition-colors text-lg"
            >
              ENTRAR
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push("/recuperar-senha")}
                className="text-white underline hover:text-[#29F3DF] transition-colors"
              >
                Esqueci minha senha!
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
