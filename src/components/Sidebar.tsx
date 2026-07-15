'use client'

import { useState, useEffect } from 'react'
import { Plus, Settings, X } from 'lucide-react'
import useChat from '@/store/chatStore'
import { motion } from 'framer-motion'
import ChatItem from './ChatItem'

interface SidebarProps {
  onClose?: () => void
}

export default function Sidebar({ onClose }: SidebarProps) {
  const {
    chats,
    currentChatId,
    createChat,
    deleteChat,
    switchChat,
    updateChatTitle,
    loadFromStorage,
    setShowApiModal,
  } = useChat()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadFromStorage()
  }, [loadFromStorage])

  if (!mounted) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full h-full glass border-r border-white/10 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-2xl font-bold text-accent flex items-center gap-2"
          >
            ✨ Nexa
          </motion.h1>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Model Selection */}
        <ModelSelector />
      </div>

      {/* New Chat */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          createChat()
          onClose?.()
        }}
        className="m-4 flex items-center justify-center gap-2 bg-accent/20 border border-accent/50 hover:bg-accent/30 text-accent rounded-lg py-2.5 px-4 transition-all font-medium"
      >
        <Plus className="w-4 h-4" />
        Новый чат
      </motion.button>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-4 space-y-1.5">
        {chats.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-500"
          >
            <p className="text-sm">Нет чатов</p>
            <p className="text-xs text-gray-600 mt-2">Создайте новый чат</p>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
            className="space-y-1.5"
          >
            {chats.map((chat) => (
              <ChatItem
                key={chat.id}
                id={chat.id}
                title={chat.title}
                isActive={currentChatId === chat.id}
                onSelect={() => {
                  switchChat(chat.id)
                  onClose?.()
                }}
                onDelete={deleteChat}
                onUpdateTitle={updateChatTitle}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 p-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowApiModal(true)}
          className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-2.5 px-4 transition-all text-gray-300 text-sm font-medium"
        >
          <Settings className="w-4 h-4" />
          Сменить ключ
        </motion.button>
      </div>
    </motion.div>
  )
}

function ModelSelector() {
  const { model, setModel } = useChat()
  const models = [
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-5.6-terra', label: 'GPT-5.6 Terra' },
    { value: 'gpt-5.6-sol', label: 'GPT-5.6 Sol' },
    { value: 'gpt-5.5', label: 'GPT-5.5' },
    { value: 'gpt-5.6-luna', label: 'GPT-5.6 Luna' },
    { value: 'claude-3-opus', label: 'Claude 3 Opus' },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
    { value: 'deepseek-v4-pro', label: 'DeepSeek V4 Pro' },
    { value: 'deepseek-v4-flash', label: 'DeepSeek V4 Flash' },
    { value: 'qwen3.7-max', label: 'Qwen 3.7 Max' },
    { value: 'qwen3.7-plus', label: 'Qwen 3.7 Plus' },
    { value: 'qwen3.6-plus', label: 'Qwen 3.6 Plus' },
    { value: 'mimo-v2-pro', label: 'Mimo V2 Pro' },
    { value: 'mimo-v2-omni', label: 'Mimo V2 Omni' },
    { value: 'mimo-v2.5-pro', label: 'Mimo V2.5 Pro' },
    { value: 'minimax-m3', label: 'MiniMax M3' },
    { value: 'kimi-k2.6', label: 'Kimi K2.6' },
    { value: 'glm-5.1', label: 'GLM-5.1' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      <label className="text-xs font-semibold text-gray-400 uppercase">
        Модель AI
      </label>
      <select
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className="w-full glass rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-black/30 border border-white/10 mt-2 hover:border-accent/50 transition-all cursor-pointer"
      >
        {models.map((m) => (
          <option key={m.value} value={m.value} className="bg-black text-white">
            {m.label}
          </option>
        ))}
      </select>
    </motion.div>
  )
}
