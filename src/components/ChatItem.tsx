'use client'

import { useState, useRef, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface ChatItemProps {
  id: string
  title: string
  isActive: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onUpdateTitle: (id: string, title: string) => void
}

export default function ChatItem({
  id,
  title,
  isActive,
  onSelect,
  onDelete,
  onUpdateTitle,
}: ChatItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  const handleSaveTitle = () => {
    const newTitle = editValue.trim() || title
    if (newTitle !== title) {
      onUpdateTitle(id, newTitle)
    }
    setIsEditing(false)
    setEditValue(newTitle)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setEditValue(title)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="group flex items-center gap-2"
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSaveTitle}
          onKeyDown={handleKeyDown}
          className="flex-1 glass rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-black/50 border border-white/20 text-white"
        />
      ) : (
        <button
          onClick={() => onSelect(id)}
          onDoubleClick={() => setIsEditing(true)}
          className={`flex-1 text-left truncate rounded-lg px-3 py-2 transition-all text-sm cursor-pointer ${
            isActive
              ? 'bg-accent/20 border border-accent/50 text-white font-medium'
              : 'hover:bg-white/10 text-gray-300 border border-transparent'
          }`}
          title={`${title} (двойной клик для редактирования)`}
        >
          {title}
        </button>
      )}
      <motion.button
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        onClick={() => onDelete(id)}
        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded transition-all"
        title="Удалить чат"
      >
        <Trash2 className="w-4 h-4" />
      </motion.button>
    </motion.div>
  )
}
