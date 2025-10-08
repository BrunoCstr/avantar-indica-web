"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BackButton } from "@/components/back-button"
import { Eye, EyeOff, ChevronDown } from "lucide-react"

export default function CadastroPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    senha: "",
    confirmaSenha: "",
    unidade: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!acceptTerms) {
      alert("Você precisa aceitar os termos e condições")
      return
    }
    if (formData.senha !== formData.confirmaSenha) {
      alert("As senhas não coincidem")
      return
    }
    // Simula cadastro
    localStorage.setItem("avantar_token", "mock_token")
    localStorage.setItem(
      "avantar_user",
      JSON.stringify({
        nome: formData.nome,
        telefone: formData.telefone,
        email: formData.email,
        chavePix: formData.email,
      }),
    )
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 bg-dark-responsive" />

      {/* Content */}
      <div className="relative z-10 min-h-screen p-6 pb-24">
        <div className="mb-8">
          <BackButton />
        </div>

        <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
          <h1 className="text-3xl font-bold text-white text-center mb-8">Faça seu cadastro</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Nome e Sobrenome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full bg-[#4A04A5]/30 border-2 border-[#29F3DF] text-white placeholder:text-white/60 px-6 py-4 rounded-2xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20"
              required
            />

            <input
              type="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#4A04A5]/30 border-2 border-[#29F3DF] text-white placeholder:text-white/60 px-6 py-4 rounded-2xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20"
              required
            />

            <input
              type="tel"
              placeholder="Telefone (Opcional)"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              className="w-full bg-[#4A04A5]/30 border-2 border-[#29F3DF] text-white placeholder:text-white/60 px-6 py-4 rounded-2xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                className="w-full bg-[#4A04A5]/30 border-2 border-[#29F3DF] text-white placeholder:text-white/60 px-6 py-4 rounded-2xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirme sua senha"
                value={formData.confirmaSenha}
                onChange={(e) => setFormData({ ...formData, confirmaSenha: e.target.value })}
                className="w-full bg-[#4A04A5]/30 border-2 border-[#29F3DF] text-white placeholder:text-white/60 px-6 py-4 rounded-2xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <select
                value={formData.unidade}
                onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                className="w-full bg-[#4A04A5]/30 border-2 border-[#29F3DF] text-white px-6 py-4 rounded-2xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20 appearance-none"
                required
              >
                <option value="" disabled>
                  Selecione uma unidade
                </option>
                <option value="sp">São Paulo</option>
                <option value="rj">Rio de Janeiro</option>
                <option value="mg">Minas Gerais</option>
                <option value="es">Espírito Santo</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 w-5 h-5 pointer-events-none" />
            </div>

            <button
              type="submit"
              className="w-full bg-[#29F3DF] hover:bg-[#29F3DF]/90 text-[#170138] font-bold py-4 px-6 rounded-2xl transition-colors text-lg mt-6"
            >
              ENTRAR
            </button>

            <div className="flex items-center justify-center gap-3 mt-4">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-2 border-white bg-transparent checked:bg-[#29F3DF] checked:border-[#29F3DF] cursor-pointer"
              />
              <label htmlFor="terms" className="text-white text-sm cursor-pointer">
                <button
                  type="button"
                  onClick={() => window.open("/policy", "_blank")}
                  className="underline hover:text-[#29F3DF]"
                >
                  Aceito termos e condições e política de privacidade*
                </button>
              </label>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
