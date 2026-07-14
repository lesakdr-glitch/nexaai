'use client'

import { useState, useEffect } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'
import useChat from '@/store/chatStore'
import { motion } from 'framer-motion'

export default function ApiKeyModal() {
  const { apiKey, setApiKey, showApiModal, setShowApiModal } = useChat()
  const [input, setInput] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isFirstTime, setIsFirstTime] = useState(false)

  useEffect(() => {
    if (showApiModal) {
      setInput(apiKey)
      setIsFirstTime(!apiKey)
    }
  }, [showApiModal, apiKey])

  const handleSave = () => {
    if (input.trim()) {
      setApiKey(input.trim())
      setShowApiModal(false)
    }
  }

  if (!showApiModal) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={() => {
        if (!isFirstTime) {
          setShowApiModal(false)
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="glass rounded-2xl p-6 md:p-8 max-w-md w-full border border-white/10 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-2">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold"
          >
            {isFirstTime ? '🔑 API Ключ' : '⚙️ Обновить ключ'}
          </motion.h2>
          {!isFirstTime && (
            <button
              onClick={() => setShowApiModal(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-gray-400 mb-6"
        >
          {isFirstTime
            ? 'Введите API ключ для codex.sale чтобы начать использовать Nexa AI. Ключ будет сохранён только в вашем браузере.'
            : 'Обновите ваш API ключ для codex.sale. Сохраняется только локально.'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative mb-6"
        >
          <input
            type={showPassword ? 'text' : 'password'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && input.trim()) handleSave()
            }}
            placeholder="sk-..."
            autoFocus
            className="w-full glass rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-accent bg-black/30 border border-white/10 text-white placeholder-gray-600"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-all text-gray-400 hover:text-gray-300"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3"
        >
          {!isFirstTime && (
            <button
              onClick={() => setShowApiModal(false)}
              className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium"
            >
              Отмена
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!input.trim()}
            className="flex-1 px-4 py-2.5 rounded-lg bg-accent/20 hover:bg-accent/30 border border-accent/50 text-accent transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed font-medium hover:scale-105 active:scale-95"
          >
            {isFirstTime ? 'Начать' : 'Сохранить'}
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-xs text-gray-500 mt-4 text-center"
        >
          🔒 Ключ не отправляется на сервер и хранится только локально
        </motion.p>
      </motion.div>
    </div>
  )
}
