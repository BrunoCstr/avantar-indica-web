"use client"

import { Home, Wallet, Plus, RefreshCw, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface BottomNavProps {
  onIndicarClick?: () => void
}

export function BottomNav({ onIndicarClick }: BottomNavProps = {}) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 pb-safe z-50 lg:hidden">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center justify-around h-20">
          <Link
            href="/dashboard"
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-colors ${
              isActive("/dashboard") ? "text-[#4A04A5]" : "text-[#4A04A5]/40 hover:text-gray-600"
            }`}
          >
            <Home className="w-6 h-6" />
          </Link>

          <Link
            href="/carteira"
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-colors ${
              isActive("/carteira") ? "text-[#4A04A5]" : "text-[#4A04A5]/40 hover:text-gray-600"
            }`}
          >
            <Wallet className="w-6 h-6" />
          </Link>

          {onIndicarClick ? (
            <button
              onClick={onIndicarClick}
              className="flex items-center justify-center w-16 h-16 -mt-8 bg-[#29F3DF] hover:bg-[#29F3DF]/80 rounded-full shadow-lg transition-transform hover:scale-105"
            >
              <Plus className="w-8 h-8 text-[#4A04A5]" />
            </button>
          ) : (
            <Link
              href="/indicar"
              className="flex items-center justify-center w-16 h-16 -mt-8 bg-[#29F3DF] hover:bg-[#29F3DF]/80 rounded-full shadow-lg transition-transform hover:scale-105"
            >
              <Plus className="w-8 h-8 text-[#4A04A5]" />
            </Link>
          )}

          <Link
            href="/status"
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-colors ${
              isActive("/status") ? "text-[#4A04A5]" : "text-[#4A04A5]/40 hover:text-gray-600"
            }`}
          >
            <RefreshCw className="w-6 h-6" />
          </Link>

          <Link
            href="/perfil"
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-colors ${
              isActive("/perfil") ? "text-[#4A04A5]" : "text-[#4A04A5]/40 hover:text-gray-600"
            }`}
          >
            <User className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </nav>
  )
}
