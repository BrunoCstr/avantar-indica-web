"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BackButton } from "@/components/back-button"

export default function RecuperarSenhaPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEnviado(true)
    setTimeout(() => {
      router.push("/login")
    }, 3000)
  }

  return (
    <div className="fixed inset-0 lg:left-64 bg-dark-responsive">
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(41, 243, 223, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(195, 82, 242, 0.3) 0%, transparent 50%)`,
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen p-6">
        <div className="mb-8">
          <BackButton />
        </div>

        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-white mb-4 text-center">Recuperar senha</h1>
          <p className="text-white/80 text-center mb-8">Digite seu e-mail para receber as instruções de recuperação</p>

          {!enviado ? (
            <form onSubmit={handleSubmit} className="w-full space-y-6">
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#4A04A5]/30 border-2 border-[#29F3DF] text-white placeholder:text-white/60 px-6 py-4 rounded-2xl focus:outline-none focus:border-[#29F3DF] focus:ring-2 focus:ring-[#29F3DF]/20"
                required
              />

              <button
                type="submit"
                className="w-full bg-[#29F3DF] hover:bg-[#29F3DF]/90 text-[#170138] font-bold py-4 px-6 rounded-2xl transition-colors text-lg"
              >
                ENVIAR
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 bg-[#29F3DF] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-[#170138]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-white text-lg">
                E-mail enviado com sucesso!
                <br />
                Verifique sua caixa de entrada.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
