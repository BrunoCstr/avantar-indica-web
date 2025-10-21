"use client"

import { AlertTriangle, X } from "lucide-react"

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  isConfirmModal?: boolean
}

export function AlertModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = "Atenção", 
  message,
  confirmText = "CONFIRMAR",
  cancelText = "CANCELAR",
  isConfirmModal = false
}: AlertModalProps) {
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
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-gray dark:bg-[#4A04A5]/20 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#4A04A5]/30 transition-colors"
        >
          <X className="w-4 h-4 text-gray-600 dark:text-white" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isConfirmModal ? 'bg-red/20 dark:bg-re/20' : 'bg-orange/20'
          }`}>
            <AlertTriangle className={`w-8 h-8 ${isConfirmModal ? 'text-red' : 'text-orange'}`} />
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

        {/* Buttons */}
        {isConfirmModal ? (
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray/20 hover:bg-gray/20 text-black font-bold py-4 px-6 rounded-xl transition-all text-lg"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-red to-red hover:from-red hover:to-red text-white font-bold py-4 px-6 rounded-xl transition-all text-lg shadow-lg"
            >
              {confirmText}
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-[#29F3DF] to-[#29F3DF]/80 hover:from-[#29F3DF]/90 hover:to-[#29F3DF]/70 text-[#170138] font-bold py-4 px-6 rounded-xl transition-all text-lg shadow-lg"
          >
            ENTENDI
          </button>
        )}
      </div>
    </div>
  )
}

