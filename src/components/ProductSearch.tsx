'use client'

import React, { useState } from 'react'
import { Search } from 'lucide-react'

interface ProductSearchProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export function ProductSearch({ onSearch, placeholder = 'O que você busca?' }: ProductSearchProps) {
  const [query, setQuery] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    onSearch(value)
  }

  return (
    <div className="relative flex-1 md:w-64">
      <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-[#F8FAF8] border border-black/5 rounded-full px-6 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#304930]/20 transition-all"
      />
    </div>
  )
}
