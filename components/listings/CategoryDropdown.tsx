'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import CategoryVisual, { getCategoryMeta } from '@/components/listings/CategoryVisual'

type CategoryDropdownProps = {
  name?: string
  value?: string
  onChange?: (value: string) => void
  required?: boolean
  disabled?: boolean
}

type Option = {
  value: string
  label: string
}

const OPTIONS: Option[] = [
  { value: 'instagram', label: '인스타그램' },
  { value: 'youtube', label: '유튜브' },
  { value: 'tiktok', label: '틱톡' },
  { value: 'x', label: 'X' },
  { value: 'twitter', label: '트위터' },
  { value: 'threads', label: '스레드' },
  { value: 'facebook', label: '페이스북' },
  { value: 'naver_blog', label: '네이버 블로그' },
  { value: 'blog', label: '블로그' },
  { value: 'website', label: '웹사이트' },
  { value: 'domain', label: '도메인' },
  { value: 'app', label: '앱' },
  { value: 'ecommerce', label: '쇼핑몰' },
  { value: 'saas', label: 'SaaS' },
  { value: 'community', label: '커뮤니티' },
  { value: 'newsletter', label: '뉴스레터' },
  { value: 'digital_product', label: '디지털 상품' },
  { value: 'account', label: '계정' },
  { value: 'channel', label: '채널' },
  { value: 'traffic', label: '트래픽' },
  { value: 'leads', label: '리드' },
  { value: 'etc', label: '기타' },
]

export default function CategoryDropdown({
  name = 'category',
  value,
  onChange,
  required,
  disabled,
}: CategoryDropdownProps) {
  const [open, setOpen] = useState(false)
  const [internalValue, setInternalValue] = useState(value || '')
  const wrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setInternalValue(value || '')
  }, [value])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapRef.current) return
      if (!wrapRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const selected = useMemo(() => {
    return OPTIONS.find((item) => item.value === internalValue) || null
  }, [internalValue])

  const selectedLabel = selected?.label || '카테고리를 선택하세요'
  const selectedMeta = getCategoryMeta(internalValue || 'etc')

  function selectValue(nextValue: string) {
    setInternalValue(nextValue)
    onChange?.(nextValue)
    setOpen(false)
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input type="hidden" name={name} value={internalValue} required={required} />

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          width: '100%',
          minHeight: 56,
          borderRadius: 16,
          border: '1px solid rgba(47,36,23,0.12)',
          background: disabled ? '#f3efe8' : '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '12px 14px',
          textAlign: 'left',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: open ? '0 0 0 3px rgba(47,36,23,0.08)' : '0 1px 2px rgba(0,0,0,0.04)',
          transition: 'all 0.18s ease',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            minWidth: 0,
            flex: 1,
          }}
        >
          {internalValue ? (
            <CategoryVisual category={internalValue} size="md" showLabel={true} />
          ) : (
            <>
              <div
                style={{
                  width: 30,
                  height: 30,
                  minWidth: 30,
                  borderRadius: 999,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f3efe8',
                  border: '1px solid rgba(47,36,23,0.08)',
                  fontSize: 14,
                }}
              >
                📂
              </div>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#7b6a58',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {selectedLabel}
              </span>
            </>
          )}
        </div>

        <span
          aria-hidden="true"
          style={{
            fontSize: 13,
            color: selectedMeta.text,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.18s ease',
          }}
        >
          ▼
        </span>
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="카테고리 선택"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            zIndex: 40,
            background: '#fff',
            border: '1px solid rgba(47,36,23,0.12)',
            borderRadius: 18,
            boxShadow: '0 14px 40px rgba(47,36,23,0.12)',
            padding: 8,
            maxHeight: 320,
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              display: 'grid',
              gap: 6,
            }}
          >
            {OPTIONS.map((option) => {
              const active = option.value === internalValue

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => selectValue(option.value)}
                  role="option"
                  aria-selected={active}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    border: 'none',
                    background: active ? '#f6f1e7' : '#ffffff',
                    borderRadius: 14,
                    padding: '10px 12px',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <CategoryVisual category={option.value} size="md" showLabel={true} />

                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: active ? '#2f2417' : '#9a8a78',
                      opacity: active ? 1 : 0,
                      transition: 'opacity 0.15s ease',
                    }}
                  >
                    선택됨
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}