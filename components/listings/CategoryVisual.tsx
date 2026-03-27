type CategoryVisualProps = {
  category?: string | null
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

type CategoryMeta = {
  label: string
  icon: string
  badge: string
  soft: string
  text: string
}

const CATEGORY_MAP: Record<string, CategoryMeta> = {
  instagram: {
    label: '인스타그램',
    icon: '📸',
    badge: '#fdf2f8',
    soft: '#fce7f3',
    text: '#9d174d',
  },
  youtube: {
    label: '유튜브',
    icon: '▶️',
    badge: '#fef2f2',
    soft: '#fee2e2',
    text: '#991b1b',
  },
  tiktok: {
    label: '틱톡',
    icon: '🎵',
    badge: '#f5f3ff',
    soft: '#ede9fe',
    text: '#5b21b6',
  },
  x: {
    label: 'X',
    icon: '✕',
    badge: '#f3f4f6',
    soft: '#e5e7eb',
    text: '#111827',
  },
  twitter: {
    label: '트위터',
    icon: '🐦',
    badge: '#eff6ff',
    soft: '#dbeafe',
    text: '#1d4ed8',
  },
  threads: {
    label: '스레드',
    icon: '🧵',
    badge: '#f3f4f6',
    soft: '#e5e7eb',
    text: '#111827',
  },
  facebook: {
    label: '페이스북',
    icon: '📘',
    badge: '#eff6ff',
    soft: '#dbeafe',
    text: '#1d4ed8',
  },
  blog: {
    label: '블로그',
    icon: '✍️',
    badge: '#ecfdf5',
    soft: '#d1fae5',
    text: '#065f46',
  },
  naver_blog: {
    label: '네이버 블로그',
    icon: '🟢',
    badge: '#ecfdf5',
    soft: '#d1fae5',
    text: '#166534',
  },
  website: {
    label: '웹사이트',
    icon: '🌐',
    badge: '#eff6ff',
    soft: '#dbeafe',
    text: '#1e40af',
  },
  domain: {
    label: '도메인',
    icon: '🔗',
    badge: '#f8fafc',
    soft: '#e2e8f0',
    text: '#334155',
  },
  app: {
    label: '앱',
    icon: '📱',
    badge: '#eef2ff',
    soft: '#e0e7ff',
    text: '#4338ca',
  },
  ecommerce: {
    label: '쇼핑몰',
    icon: '🛒',
    badge: '#fff7ed',
    soft: '#fed7aa',
    text: '#9a3412',
  },
  saas: {
    label: 'SaaS',
    icon: '☁️',
    badge: '#f0fdf4',
    soft: '#dcfce7',
    text: '#166534',
  },
  community: {
    label: '커뮤니티',
    icon: '👥',
    badge: '#faf5ff',
    soft: '#f3e8ff',
    text: '#7e22ce',
  },
  newsletter: {
    label: '뉴스레터',
    icon: '📩',
    badge: '#fff7ed',
    soft: '#ffedd5',
    text: '#9a3412',
  },
  digital_product: {
    label: '디지털 상품',
    icon: '💾',
    badge: '#f8fafc',
    soft: '#e2e8f0',
    text: '#334155',
  },
  account: {
    label: '계정',
    icon: '🔐',
    badge: '#fff1f2',
    soft: '#ffe4e6',
    text: '#9f1239',
  },
  channel: {
    label: '채널',
    icon: '📡',
    badge: '#eef2ff',
    soft: '#e0e7ff',
    text: '#3730a3',
  },
  traffic: {
    label: '트래픽',
    icon: '📈',
    badge: '#ecfeff',
    soft: '#cffafe',
    text: '#155e75',
  },
  leads: {
    label: '리드',
    icon: '🎯',
    badge: '#fffbeb',
    soft: '#fef3c7',
    text: '#92400e',
  },
  etc: {
    label: '기타',
    icon: '📦',
    badge: '#f8fafc',
    soft: '#e2e8f0',
    text: '#334155',
  },
}

function normalizeCategory(input?: string | null) {
  const value = (input || '').trim().toLowerCase()

  if (!value) return 'etc'

  const aliasMap: Record<string, string> = {
    '인스타': 'instagram',
    '인스타그램': 'instagram',
    instagram: 'instagram',

    youtube: 'youtube',
    '유튜브': 'youtube',

    tiktok: 'tiktok',
    '틱톡': 'tiktok',

    x: 'x',
    twitter: 'twitter',
    '트위터': 'twitter',

    threads: 'threads',
    '스레드': 'threads',

    facebook: 'facebook',
    '페이스북': 'facebook',

    blog: 'blog',
    '블로그': 'blog',

    naver_blog: 'naver_blog',
    '네이버블로그': 'naver_blog',
    '네이버 블로그': 'naver_blog',

    website: 'website',
    '웹사이트': 'website',
    site: 'website',

    domain: 'domain',
    '도메인': 'domain',

    app: 'app',
    '앱': 'app',

    ecommerce: 'ecommerce',
    '쇼핑몰': 'ecommerce',

    saas: 'saas',

    community: 'community',
    '커뮤니티': 'community',

    newsletter: 'newsletter',
    '뉴스레터': 'newsletter',

    digital_product: 'digital_product',
    '디지털상품': 'digital_product',
    '디지털 상품': 'digital_product',

    account: 'account',
    '계정': 'account',

    channel: 'channel',
    '채널': 'channel',

    traffic: 'traffic',
    '트래픽': 'traffic',

    leads: 'leads',
    '리드': 'leads',

    etc: 'etc',
    '기타': 'etc',
  }

  return aliasMap[value] || value || 'etc'
}

function getSize(size: 'sm' | 'md' | 'lg') {
  if (size === 'sm') {
    return {
      wrapGap: 6,
      iconBox: 24,
      iconFont: 12,
      labelSize: 12,
      labelPadX: 8,
      labelPadY: 4,
      radius: 999,
    }
  }

  if (size === 'lg') {
    return {
      wrapGap: 10,
      iconBox: 38,
      iconFont: 18,
      labelSize: 14,
      labelPadX: 12,
      labelPadY: 6,
      radius: 999,
    }
  }

  return {
    wrapGap: 8,
    iconBox: 30,
    iconFont: 14,
    labelSize: 13,
    labelPadX: 10,
    labelPadY: 5,
    radius: 999,
  }
}

export function getCategoryMeta(category?: string | null) {
  const key = normalizeCategory(category)
  return CATEGORY_MAP[key] || CATEGORY_MAP.etc
}

export default function CategoryVisual({
  category,
  size = 'md',
  showLabel = true,
  className,
}: CategoryVisualProps) {
  const meta = getCategoryMeta(category)
  const ui = getSize(size)

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: ui.wrapGap,
        minWidth: 0,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: ui.iconBox,
          height: ui.iconBox,
          minWidth: ui.iconBox,
          borderRadius: ui.radius,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: meta.soft,
          border: '1px solid rgba(47,36,23,0.08)',
          fontSize: ui.iconFont,
          lineHeight: 1,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55)',
        }}
      >
        {meta.icon}
      </div>

      {showLabel ? (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            borderRadius: 999,
            padding: `${ui.labelPadY}px ${ui.labelPadX}px`,
            background: meta.badge,
            color: meta.text,
            fontSize: ui.labelSize,
            fontWeight: 700,
            lineHeight: 1.1,
            whiteSpace: 'nowrap',
            border: '1px solid rgba(47,36,23,0.06)',
          }}
        >
          {meta.label}
        </span>
      ) : null}
    </div>
  )
}