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
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12 py-6">
        {/* Logo */}
        <div className="flex-1 flex flex-col items-center sm:items-start justify-start pt-8">
          <img src="/avantar_seguros_consorcios_planos_de_saude.svg" alt="Logo" className="w-40 h-40 -mt-20 sm:w-56 sm:h-56 lg:w-64 lg:h-64" />
        </div>

        {/* Texto descritivo */}
        <div className="mb-8 w-full sm:w-auto sm:max-w-md lg:max-w-lg flex flex-col items-start justify-start text-left">
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-semibold text-white mb-4 leading-tight">
            Este é o seu
            <br />
            novo app da Avantar
          </h2>
          <p className="text-white/90 text-sm sm:text-lg lg:text-xl leading-relaxed">
            onde você indica e ganha
            <br />
            comissão ou cashback.
          </p>
        </div>

        {/* Botões */}
        <div className="w-full sm:w-auto sm:max-w-md lg:max-w-lg space-y-3 sm:space-y-4 pb-4">
          <button
            onClick={() => router.push("/cadastro")}
            className="cursor-pointer w-full bg-[#3E0085] hover:bg-[#3E0085]/90 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-full transition-colors text-xs sm:text-sm font-medium"
          >
            QUERO CRIAR UMA CONTA
          </button>
          <button
            onClick={() => router.push("/login")}
            className="cursor-pointer w-full bg-transparent hover:bg-white/10 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-full border-2 border-white transition-colors text-xs sm:text-sm font-medium"
          >
            ACESSAR CONTA
          </button>
        </div>
      </div>
    </div>
  )
}
