'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Loader } from 'lucide-react'
import useChat from '@/store/chatStore'
import MessageBlock from './MessageBlock'
import { Message } from '@/types'
import { motion } from 'framer-motion'

const WELCOME_MESSAGE = `Привет! 👋 Я **Nexa AI** — ваш помощник для Minecraft клиента **Nexa DLC**.

Я специализируюсь на:
- Помощи с **Fabric модификациями**
- Написании и оптимизации **Java кода**
- Решении проблем с **Minecraft модами**
- Объяснении API и библиотек

Просто напишите ваш вопрос, и я помогу вам с кодом! 💚`

export default function ChatArea() {
  const {
    getCurrentChat,
    addMessage,
    apiKey,
    model,
    setShowApiModal,
  } = useChat()

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const chat = getCurrentChat()

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 0)
  }

  useEffect(() => {
    scrollToBottom()
  }, [chat?.messages, loading])

  // Add welcome message to new chat
  useEffect(() => {
    if (chat && chat.messages.length === 0 && !loading) {
      const welcomeMsg: Message = {
        id: 'welcome-' + chat.id,
        role: 'assistant',
        content: WELCOME_MESSAGE,
        timestamp: Date.now(),
      }
      addMessage(welcomeMsg)
    }
  }, [chat?.id])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !chat || !apiKey) {
      if (!apiKey) {
        setShowApiModal(true)
      }
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    }

    addMessage(userMessage)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('https://codex.sale/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'Ты Nexa AI, помощник для Minecraft клиента Nexa DLC (Java, Fabric). Отвечай кодом.',
            },
            ...chat.messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            {
              role: 'user',
              content: input,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      const aiContent = data.choices?.[0]?.message?.content || 'Ошибка при получении ответа'

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiContent,
        timestamp: Date.now(),
      }

      addMessage(aiMessage)
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Ошибка: ${error instanceof Error ? error.message : 'Не удалось подключиться к API'}`,
        timestamp: Date.now(),
      }
      addMessage(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleSend(e as any)
    }
  }

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold mb-4 text-accent">Nexa AI</h1>
          <p className="text-gray-400">Выберите чат или создайте новый для начала</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4"
      >
        {chat.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold mb-2">Начните чат</h2>
              <p className="text-gray-500">Введите вопрос о Minecraft или Nexa DLC</p>
            </motion.div>
          </div>
        ) : (
          chat.messages.map((message) => (
            <MessageBlock key={message.id} message={message} />
          ))
        )}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start mb-4"
          >
            <div className="glass rounded-2xl px-4 py-3 flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin text-accent" />
              <span className="text-gray-400 text-sm">Nexa AI думает...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-4 md:p-6 bg-black/40">
        <form onSubmit={handleSend} className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Спросите что-то... (Ctrl+Enter для отправки)"
            className="flex-1 glass rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-accent transition-all text-sm md:text-base"
            rows={3}
            disabled={loading || !apiKey}
          />
          <button
            type="submit"
            disabled={loading || !apiKey || !input.trim()}
            className="glass rounded-xl px-4 py-3 hover:bg-opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-fit"
            title={!apiKey ? 'Установите API ключ' : 'Отправить (Ctrl+Enter)'}
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin text-accent" />
            ) : (
              <Send className="w-5 h-5 text-accent" />
            )}
          </button>
        </form>
        {!apiKey && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs md:text-sm text-red-400 mt-2 cursor-pointer hover:text-red-300 transition-all"
            onClick={() => setShowApiModal(true)}
          >
            ⚠️ API ключ не установлен. Нажмите здесь для настройки.
          </motion.p>
        )}
      </div>
    </div>
  )
}
