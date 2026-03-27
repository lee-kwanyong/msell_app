'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

export type CategoryOption = {
  value: string
  label: string
  icon?: string
}

const DEFAULT_CATEGORY_OPTIONS: CategoryOption[] = [
  { value: 'instagram_account', label: '인스타그램 계정', icon: '📸' },
  { value: 'youtube_channel', label: '유튜브 채널', icon: '▶️' },
  { value: 'tiktok_account', label: '틱톡 계정', icon: '🎵' },
  { value: 'x_account', label: 'X 계정', icon: '𝕏' },
  { value: 'facebook_page', label: '페이스북 페이지', icon: '📘' },
  { value: 'threads_account', label: '스레드 계정', icon: '🧵' },
  { value: 'naver_blog', label: '네이버 블로그', icon: '🟢' },
  { value: 'brunch_blog', label: '브런치', icon: '✍️' },
  { value: 'telegram_channel', label: '텔레그램 채널', icon: '✈️' },
  { value: 'discord_server', label: '디스코드 서버', icon: '🎮' },

  { value: 'community', label: '커뮤니티', icon: '👥' },
  { value: 'cafe', label: '카페', icon: '☕' },
  { value: 'forum', label: '포럼', icon: '💬' },
  { value: 'newsletter', label: '뉴스레터', icon: '📰' },
  { value: 'membership', label: '멤버십', icon: '🎫' },
  { value: 'fan_club', label: '팬클럽', icon: '💞' },

  { value: 'website', label: '웹사이트', icon: '🌐' },
  { value: 'landing_page', label: '랜딩페이지', icon: '🧭' },
  { value: 'blog', label: '블로그', icon: '📝' },
  { value: 'domain', label: '도메인', icon: '🔗' },
  { value: 'app_service', label: '앱 서비스', icon: '📱' },
  { value: 'saas', label: 'SaaS', icon: '🧩' },

  { value: 'smart_store', label: '스마트스토어', icon: '🛍️' },
  { value: 'coupang_store', label: '쿠팡 스토어', icon: '📦' },
  { value: 'amazon_seller', label: '아마존 셀러', icon: '🛒' },
  { value: 'shopify_store', label: '쇼피파이 스토어', icon: '🏪' },
  { value: 'ecommerce_site', label: '자사몰', icon: '🏬' },
  { value: 'dropshipping_store', label: '드랍쉬핑 스토어', icon: '🚚' },

  { value: 'digital_product', label: '디지털 상품', icon: '💾' },
  { value: 'template_pack', label: '템플릿', icon: '📐' },
  { value: 'ebook', label: '전자책', icon: '📚' },
  { value: 'course', label: '온라인 강의', icon: '🎓' },
  { value: 'notion_template', label: '노션 템플릿', icon: '📔' },
  { value: 'design_asset', label: '디자인 소스', icon: '🎨' },

  { value: 'automation_bot', label: '자동화 봇', icon: '🤖' },
  { value: 'ai_prompt_pack', label: 'AI 프롬프트', icon: '🧠' },
  { value: 'api_service', label: 'API 서비스', icon: '🔌' },
  { value: 'chrome_extension', label: '크롬 확장프로그램', icon: '🧩' },
  { value: 'mobile_app', label: '모바일 앱', icon: '📲' },
  { value: 'web_app', label: '웹앱', icon: '🖥️' },

  { value: 'game_account', label: '게임 계정', icon: '🎮' },
  { value: 'steam_account', label: '스팀 계정', icon: '🚂' },
  { value: 'riot_account', label: '라이엇 계정', icon: '🛡️' },
  { value: 'battle_net_account', label: '배틀넷 계정', icon: '⚔️' },
  { value: 'game_item', label: '게임 아이템', icon: '🗡️' },
  { value: 'game_currency', label: '게임 재화', icon: '💰' },

  { value: 'gift_card', label: '기프트카드', icon: '🎁' },
  { value: 'coupon', label: '쿠폰', icon: '🏷️' },
  { value: 'subscription', label: '구독권', icon: '📺' },
  { value: 'software_license', label: '소프트웨어 라이선스', icon: '🔐' },
  { value: 'proxy_account', label: '프록시 계정', icon: '🛰️' },
  { value: 'vpn_account', label: 'VPN 계정', icon: '🔒' },

  { value: 'ads_account', label: '광고 계정', icon: '📢' },
  { value: 'google_ads_account', label: '구글 광고 계정', icon: '🔍' },
  { value: 'meta_ads_account', label: '메타 광고 계정', icon: '📣' },
  { value: 'affiliate_account', label: '제휴마케팅 계정', icon: '🤝' },
  { value: 'marketing_db', label: '마케팅 DB', icon: '🗂️' },
  { value: 'leads_asset', label: '리드 자산', icon: '📈' },

  { value: 'crypto_wallet', label: '암호화폐 지갑', icon: '₿' },
  { value: 'token_project', label: '토큰 프로젝트', icon: '🪙' },
  { value: 'nft_project', label: 'NFT 프로젝트', icon: '🖼️' },
  { value: 'miner_hosting', label: '채굴/호스팅 권리', icon: '⛏️' },
  { value: 'email_account', label: '이메일 계정', icon: '✉️' },
  { value: 'other', label: '기타', icon: '📦' },
]

type Props = {
  name: string
  defaultValue?: string
  required?: boolean
  categories?: CategoryOption[]
}

function normalizeLabelToValue(label: string) {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '_')
    .replace(/^_+|_+$/g, '')
}

function mergeCategories(input?: CategoryOption[]) {
  if (!input || input.length === 0) {
    return DEFAULT_CATEGORY_OPTIONS
  }

  const iconMap = new Map<string, string>()
  for (const item of DEFAULT_CATEGORY_OPTIONS) {
    iconMap.set(item.value, item.icon || '📦')
    iconMap.set(item.label, item.icon || '📦')
    iconMap.set(normalizeLabelToValue(item.label), item.icon || '📦')
  }

  const merged = input.map((item) => {
    const fallbackIcon =
      item.icon ||
      iconMap.get(item.value) ||
      iconMap.get(item.label) ||
      iconMap.get(normalizeLabelToValue(item.label)) ||
      '📦'

    return {
      value: item.value,
      label: item.label,
      icon: fallbackIcon,
    }
  })

  return merged
}

export default function CategoryDropdown({
  name,
  defaultValue = '',
  required = false,
  categories,
}: Props) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(defaultValue)
  const rootRef = useRef<HTMLDivElement | null>(null)

  const options = useMemo(() => mergeCategories(categories), [categories])

  useEffect(() => {
    setSelected(defaultValue || '')
  }, [defaultValue])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current) return
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const selectedOption = useMemo(
    () => options.find((item) => item.value === selected),
    [options, selected],
  )

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <input type="hidden" name={name} value={selected} required={required} />

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: '100%',
          height: 54,
          borderRadius: 15,
          border: '1px solid #dfd1bf',
          background: '#fffdfa',
          padding: '0 15px',
          color: selectedOption ? '#221a12' : '#7c6e5f',
          fontSize: 14,
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            minWidth: 0,
          }}
        >
          <span style={{ fontSize: 18, width: 22, textAlign: 'center' }}>
            {selectedOption?.icon ?? '◻️'}
          </span>
          <span
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontWeight: selectedOption ? 700 : 500,
            }}
          >
            {selectedOption?.label ?? '카테고리 선택'}
          </span>
        </span>

        <span
          style={{
            fontSize: 12,
            color: '#7b6f62',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          ▼
        </span>
      </button>

      {open ? (
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: 0,
            right: 0,
            zIndex: 40,
            borderRadius: 18,
            border: '1px solid #dfd1bf',
            background: '#fffdfa',
            boxShadow: '0 18px 40px rgba(47,36,23,0.12)',
            padding: 10,
            maxHeight: 420,
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 8,
            }}
            className="category-option-grid"
          >
            {options.map((item) => {
              const active = item.value === selected

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setSelected(item.value)
                    setOpen(false)
                  }}
                  style={{
                    borderRadius: 14,
                    border: active ? '1px solid #2f2417' : '1px solid #eadfce',
                    background: active ? '#f3e7d5' : '#fffdfa',
                    padding: '12px 12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 18, width: 22, textAlign: 'center' }}>
                    {item.icon ?? '📦'}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: '#221a12',
                      fontWeight: active ? 900 : 700,
                      lineHeight: 1.35,
                      wordBreak: 'keep-all',
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      <style>{`
        @media (max-width: 760px) {
          .category-option-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}