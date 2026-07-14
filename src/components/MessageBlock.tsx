'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import CodeBlock from './CodeBlock'
import { Message } from '@/types'
import { motion } from 'framer-motion'

interface MessageBlockProps {
  message: Message
}

export default function MessageBlock({ message }: MessageBlockProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-user/20 border border-user/50 text-white'
            : 'glass text-white'
        }`}
      >
        <div className="markdown-content text-sm leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: ({ node, inline, className, children, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || '')
                const language = match ? match[1] : 'javascript'
                const code = String(children).replace(/\n$/, '')

                return inline ? (
                  <code
                    className="bg-black/50 px-2 py-1 rounded text-accent text-xs font-semibold"
                    {...props}
                  >
                    {code}
                  </code>
                ) : (
                  <CodeBlock language={language} code={code} />
                )
              },
              a: ({ node, ...props }: any) => (
                <a
                  className="text-accent hover:underline font-semibold transition-all"
                  target="_blank"
                  rel="noreferrer"
                  {...props}
                />
              ),
              h1: ({ node, ...props }: any) => (
                <h1 className="text-lg font-bold mt-4 mb-2" {...props} />
              ),
              h2: ({ node, ...props }: any) => (
                <h2 className="text-base font-bold mt-3 mb-2" {...props} />
              ),
              h3: ({ node, ...props }: any) => (
                <h3 className="text-sm font-bold mt-2 mb-1" {...props} />
              ),
              ul: ({ node, ...props }: any) => (
                <ul className="list-disc list-inside mb-2 space-y-1" {...props} />
              ),
              ol: ({ node, ...props }: any) => (
                <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />
              ),
              blockquote: ({ node, ...props }: any) => (
                <blockquote
                  className="border-l-4 border-accent pl-3 my-2 italic text-gray-400"
                  {...props}
                />
              ),
              table: ({ node, ...props }: any) => (
                <div className="overflow-x-auto my-2">
                  <table className="border-collapse text-xs" {...props} />
                </div>
              ),
              td: ({ node, ...props }: any) => (
                <td className="border border-white/10 px-2 py-1" {...props} />
              ),
              th: ({ node, ...props }: any) => (
                <th
                  className="border border-white/10 px-2 py-1 bg-accent/10 font-bold"
                  {...props}
                />
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </motion.div>
    </motion.div>
  )
}
