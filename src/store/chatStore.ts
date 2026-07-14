import { create } from 'zustand'
import { Chat, Message } from '@/types'

interface ChatStore {
  chats: Chat[]
  currentChatId: string | null
  apiKey: string
  model: string
  showApiModal: boolean
  setShowApiModal: (show: boolean) => void
  setApiKey: (key: string) => void
  setModel: (model: string) => void
  createChat: () => void
  deleteChat: (id: string) => void
  switchChat: (id: string) => void
  addMessage: (message: Message) => void
  updateChatTitle: (id: string, title: string) => void
  getCurrentChat: () => Chat | undefined
  getChatHistory: () => Chat[]
  loadFromStorage: () => void
  saveToStorage: () => void
}

const useChat = create<ChatStore>((set, get) => ({
  chats: [],
  currentChatId: null,
  apiKey: '',
  model: 'gpt-3.5-turbo',
  showApiModal: false,

  setShowApiModal: (show) => {
    set({ showApiModal: show })
  },

  setApiKey: (key) => {
    set({ apiKey: key })
    get().saveToStorage()
  },

  setModel: (model) => {
    set({ model })
    get().saveToStorage()
  },

  createChat: () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'Новый чат',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    set((state) => ({
      chats: [newChat, ...state.chats],
      currentChatId: newChat.id,
    }))
    get().saveToStorage()
  },

  deleteChat: (id) => {
    set((state) => {
      const filtered = state.chats.filter((c) => c.id !== id)
      const newCurrentId = state.currentChatId === id ? filtered[0]?.id || null : state.currentChatId
      return {
        chats: filtered,
        currentChatId: newCurrentId,
      }
    })
    get().saveToStorage()
  },

  switchChat: (id) => {
    set({ currentChatId: id })
    get().saveToStorage()
  },

  addMessage: (message) => {
    set((state) => {
      if (!state.currentChatId) return state
      return {
        chats: state.chats.map((chat) =>
          chat.id === state.currentChatId
            ? {
                ...chat,
                messages: [...chat.messages, message],
                updatedAt: Date.now(),
                title: chat.messages.length === 0 ? message.content.slice(0, 30) : chat.title,
              }
            : chat
        ),
      }
    })
    get().saveToStorage()
  },

  updateChatTitle: (id, title) => {
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === id
          ? { ...chat, title, updatedAt: Date.now() }
          : chat
      ),
    }))
    get().saveToStorage()
  },

  getCurrentChat: () => {
    const state = get()
    return state.chats.find((c) => c.id === state.currentChatId)
  },

  getChatHistory: () => {
    return get().chats
  },

  loadFromStorage: () => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('nexa-chat-store')
    if (stored) {
      const data = JSON.parse(stored)
      set({
        chats: data.chats || [],
        currentChatId: data.currentChatId,
        apiKey: data.apiKey || '',
        model: data.model || 'gpt-3.5-turbo',
      })
    }
  },

  saveToStorage: () => {
    if (typeof window === 'undefined') return
    const state = get()
    localStorage.setItem(
      'nexa-chat-store',
      JSON.stringify({
        chats: state.chats,
        currentChatId: state.currentChatId,
        apiKey: state.apiKey,
        model: state.model,
      })
    )
  },
}))

export default useChat
