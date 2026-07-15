'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Loader, ArrowDown } from 'lucide-react'
import useChat from '@/store/chatStore'
import MessageBlock from './MessageBlock'
import { Message } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'

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
    updateMessage,
    apiKey,
    model,
    setShowApiModal,
  } = useChat()

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const [showScrollButton, setShowScrollButton] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const chat = getCurrentChat()
  const isAutoScrollRef = useRef(true)

  const scrollToBottom = (force = false) => {
    if (force || isAutoScrollRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 0)
    }
  }

  const handleScroll = () => {
    if (!chatContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
    
    isAutoScrollRef.current = isNearBottom
    setShowScrollButton(!isNearBottom)
  }

  useEffect(() => {
    scrollToBottom()
  }, [chat?.messages])

  useEffect(() => {
    if (streamingMessage) {
      scrollToBottom()
    }
  }, [streamingMessage])

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
    setStreamingMessage('')

    const tempMessageId = (Date.now() + 1).toString()

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
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
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `API error: ${response.status}`)
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter(line => line.trim() !== '')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                const content = parsed.choices?.[0]?.delta?.content || ''
                if (content) {
                  fullContent += content
                  setStreamingMessage(fullContent)
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      const aiMessage: Message = {
        id: tempMessageId,
        role: 'assistant',
        content: fullContent || 'Ошибка при получении ответа',
        timestamp: Date.now(),
      }

      addMessage(aiMessage)
      setStreamingMessage('')
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Ошибка: ${error instanceof Error ? error.message : 'Не удалось подключиться к API'}`,
        timestamp: Date.now(),
      }
      addMessage(errorMessage)
      setStreamingMessage('')
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
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6"
        style={{ maxHeight: '100%' }}
      >
        <div className="space-y-4 max-w-5xl mx-auto">
          {chat.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
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
            <>
              {chat.messages.map((message) => (
                <MessageBlock key={message.id} message={message} />
              ))}
            </>
          )}
          
          {/* Streaming message */}
          {streamingMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="max-w-[80%] glass rounded-2xl px-4 py-3">
                <div className="markdown-content text-sm leading-relaxed whitespace-pre-wrap">
                  {streamingMessage}
                  <span className="inline-block w-2 h-4 bg-accent ml-1 animate-pulse" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Loading indicator */}
          {loading && !streamingMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="glass rounded-2xl px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-gray-400 text-sm">Nexa AI печатает...</span>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-28 right-8 glass rounded-full p-3 hover:bg-accent/20 transition-all shadow-lg z-10"
          >
            <ArrowDown className="w-5 h-5 text-accent" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="border-t border-white/10 p-4 md:p-6 bg-black/40 flex-shrink-0">
        <form onSubmit={handleSend} className="flex gap-3 max-w-5xl mx-auto">
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
            className="text-xs md:text-sm text-red-400 mt-2 cursor-pointer hover:text-red-300 transition-all max-w-5xl mx-auto"
            onClick={() => setShowApiModal(true)}
          >
            ⚠️ API ключ не установлен. Нажмите здесь для настройки.
          </motion.p>
        )}
      </div>
    </div>
  )
}
