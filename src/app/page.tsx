'use client'

import { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import ChatArea from '@/components/ChatArea'
import ApiKeyModal from '@/components/ApiKeyModal'
import useChat from '@/store/chatStore'

export default function Home() {
  const { loadFromStorage, createChat, currentChatId, apiKey, setShowApiModal } = useChat()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadFromStorage()
  }, [loadFromStorage])

  useEffect(() => {
    if (mounted) {
      if (!currentChatId) {
        createChat()
      }
      // Show API modal on first load if no API key
      if (!apiKey) {
        setShowApiModal(true)
      }
    }
  }, [mounted, currentChatId, createChat, apiKey, setShowApiModal])

  if (!mounted) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent mx-auto mb-4" />
          <p className="text-gray-400">Loading Nexa AI...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen bg-black flex overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full z-50 w-64 max-w-[80vw]">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-3 border-b border-white/10 p-4 bg-black/40">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-accent">Nexa AI</h1>
        </div>

        <ChatArea />
      </div>

      {/* API Key Modal */}
      <ApiKeyModal />
    </div>
  )
}
