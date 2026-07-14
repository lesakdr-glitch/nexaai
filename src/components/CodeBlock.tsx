'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

interface CodeBlockProps {
  language: string
  code: string
}

export default function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getLanguage = () => {
    const lang = language.toLowerCase()
    try {
      hljs.getLanguage(lang)
      return lang
    } catch {
      return 'javascript'
    }
  }

  const highlightedCode = hljs.highlight(code, {
    language: getLanguage(),
    ignoreIllegals: true,
  }).value

  return (
    <div className="relative my-4 rounded-lg overflow-hidden border border-white/10">
      <div className="flex items-center justify-between bg-black/40 px-4 py-2 border-b border-white/10">
        <span className="text-xs font-semibold text-gray-400 uppercase">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-all flex items-center gap-1"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-accent" />
              <span className="text-xs text-accent">Скопировано</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">Копировать</span>
            </>
          )}
        </button>
      </div>
      <pre className="!bg-black/50 !m-0 !p-4 !rounded-none !border-0 overflow-x-auto">
        <code
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
          className="text-sm leading-relaxed"
        />
      </pre>
    </div>
  )
}
