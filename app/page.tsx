"use client"

import { useRouter } from "next/navigation"

export default function SplashScreen() {
  const router = useRouter()

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background com imagem */}
      <div className="absolute inset-0 bg-home-responsive" />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-between px-[45rem] p-6 pb-6">
        {/* Logo */}
        <div className="flex-1 flex flex-col items-start justify-start">
          <img src="/avantar_seguros_consorcios_planos_de_saude.svg" alt="Logo" className="w-55 h-55" />
        </div>

        {/* Texto descritivo */}
        <div className="mb-8 w-full flex flex-col items-start justify-start">
          <h2 className="text-2xl font-semibold text-white mb-4 leading-tight">
            Este é o seu
            <br />
            novo app da Avantar
          </h2>
          <p className="text-white/90 text-base leading-relaxed">
            onde você indica e ganha
            <br />
            comissão ou cashback.
          </p>
        </div>

        {/* Botões */}
        <div className="w-full space-y-4">
          <button
            onClick={() => router.push("/cadastro")}
            className="cursor-pointer w-full bg-[#3E0085] hover:bg-[#3E0085]/90 text-white py-4 px-6 rounded-full transition-colors text-sm"
          >
            QUERO CRIAR UMA CONTA
          </button>
          <button
            onClick={() => router.push("/login")}
            className="cursor-pointer w-full bg-transparent hover:bg-white/10 text-white py-4 px-6 rounded-full border-2 border-white transition-colors text-sm"
          >
            ACESSAR CONTA
          </button>
        </div>
      </div>
    </div>
  )
}
