"use client"

import { AlertTriangle, X } from "lucide-react"

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
}

export function AlertModal({ isOpen, onClose, title = "Atenção", message }: AlertModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#190d26] border-2 border-[#29F3DF] rounded-3xl p-6 mx-auto shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#4A04A5]/20 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#4A04A5]/30 transition-colors"
        >
          <X className="w-4 h-4 text-gray-600 dark:text-white" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-orange/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-orange" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-black dark:text-white mb-3">
          {title}
        </h2>

        {/* Message */}
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          {message}
        </p>

        {/* Button */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-[#29F3DF] to-[#29F3DF]/80 hover:from-[#29F3DF]/90 hover:to-[#29F3DF]/70 text-[#170138] font-bold py-4 px-6 rounded-xl transition-all text-lg shadow-lg"
        >
          ENTENDI
        </button>
      </div>
    </div>
  )
}

