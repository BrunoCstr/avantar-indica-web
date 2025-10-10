"use client"

import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface BackButtonProps {
  bgColor?: string
  route?: string
}

export function BackButton({ bgColor = "#29F3DF", route }: BackButtonProps) {
  const router = useRouter()

  return (
    <button
      onClick={() => route ? router.push(route) : router.back()}
      className={`w-8 h-8 flex items-center justify-center rounded-sm border-2 ${bgColor === "purple" ? "border-[#6600CC] text-[#6600CC]" : "border-blue text-blue"} hover:opacity-80 transition-colors`}>
      <ChevronLeft className="w-6 h-6" />
    </button>
  )
}
