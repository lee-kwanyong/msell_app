'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type CategoryDropdownProps = {
  name?: string
  value?: string
  defaultValue?: string
  categories?: string[]
  required?: boolean
  placeholder?: string
}

const DEFAULT_CATEGORIES = [
  '인스타그램 계정',
  '유튜브 채널',
  '틱톡 계정',
  '스레드 계정',
  '엑스 계정',
  '네이버 블로그',
  '티스토리 블로그',
  '워드프레스 사이트',
  '쇼핑몰',
  '스마트스토어',
  '쿠팡 마켓',
  '도메인',
  '웹사이트',
  '앱',
  '커뮤니티',
  '카카오톡 채널',
  '텔레그램 채널',
  '디스코드 서버',
  '전자책',
  '강의 상품',
  '뉴스레터',
  '브랜드',
  '법인',
  '상표권',
  '소프트웨어',
  'SaaS',
  '자동화 툴',
  '데이터셋',
  'API 서비스',
  '기타 디지털 자산',
]

function getCategoryIcon(category: string) {
  const text = category.toLowerCase()

  if (text.includes('인스타')) return '📷'
  if (text.includes('유튜브')) return '▶️'
  if (text.includes('틱톡')) return '🎵'
  if (text.includes('스레드')) return '🧵'
  if (text.includes('엑스')) return '✕'
  if (text.includes('블로그')) return '✍️'
  if (text.includes('워드프레스')) return '🌐'
  if (text.includes('쇼핑몰')) return '🛍️'
  if (text.includes('스마트스토어')) return '🏪'
  if (text.includes('쿠팡')) return '📦'
  if (text.includes('도메인')) return '🔗'
  if (text.includes('웹사이트')) return '🖥️'
  if (text.includes('앱')) return '📱'
  if (text.includes('커뮤니티')) return '👥'
  if (text.includes('카카오톡')) return '💬'
  if (text.includes('텔레그램')) return '✈️'
  if (text.includes('디스코드')) return '🎮'
  if (text.includes('전자책')) return '📘'
  if (text.includes('강의')) return '🎓'
  if (text.includes('뉴스레터')) return '📰'
  if (text.includes('브랜드')) return '🏷️'
  if (text.includes('법인')) return '🏢'
  if (text.includes('상표권')) return '®️'
  if (text.includes('소프트웨어')) return '💻'
  if (text.includes('saas')) return '☁️'
  if (text.includes('자동화')) return '⚙️'
  if (text.includes('데이터셋')) return '🗂️'
  if (text.includes('api')) return '🧩'
  return '📁'
}

export default function CategoryDropdown({
  name = 'category',
  value,
  defaultValue = '',
  categories,
  required = true,
  placeholder = '카테고리 선택',
}: CategoryDropdownProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  const categoryList = useMemo(
    () => (categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES),
    [categories]
  )

  const [selected, setSelected] = useState(value ?? defaultValue ?? '')

  useEffect(() => {
    if (typeof value === 'string') {
      setSelected(value)
    }
  }, [value])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const selectedLabel = selected || placeholder

  return (
    <div ref={wrapperRef} className="relative">
      <input name={name} value={selected} readOnly hidden required={required} />

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-12 w-full items-center justify-between rounded-2xl border border-[#dbcdb7] bg-[#fffdf9] px-4 text-left text-[15px] text-[#20170f] outline-none transition focus:border-[#8f7556]"
      >
        <span className={selected ? 'text-[#20170f]' : 'text-[#8d785f]'}>
          {selected ? `${getCategoryIcon(selected)} ${selectedLabel}` : selectedLabel}
        </span>
        <span className="ml-3 text-[12px] text-[#8d785f]">{open ? '▲' : '▼'}</span>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-72 overflow-y-auto rounded-2xl border border-[#e4d8c7] bg-white p-2 shadow-[0_18px_40px_rgba(47,36,23,0.12)]">
          {categoryList.map((category) => {
            const active = selected === category

            return (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setSelected(category)
                  setOpen(false)
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[14px] transition ${
                  active
                    ? 'bg-[#f3eadf] text-[#20170f]'
                    : 'text-[#4c3a2b] hover:bg-[#faf6ef]'
                }`}
              >
                <span className="text-[16px]">{getCategoryIcon(category)}</span>
                <span>{category}</span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}