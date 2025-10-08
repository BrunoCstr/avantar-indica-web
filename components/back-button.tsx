"use client"

import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface BackButtonProps {
  bgColor?: string
}

export function BackButton({ bgColor = "#29F3DF" }: BackButtonProps) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      style={{
        borderColor: bgColor,
        color: bgColor,
      }}
      className="w-8 h-8 flex items-center justify-center rounded-sm border-2 hover:opacity-80 transition-colors">
      <ChevronLeft className="w-6 h-6" />
    </button>
  )
}
