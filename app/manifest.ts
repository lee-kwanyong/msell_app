import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Msell',
    short_name: 'Msell',
    description: '디지털 자산 거래를 더 신뢰감 있게 연결하는 Msell',
    start_url: '/',
    display: 'standalone',
    background_color: '#f6f1e7',
    theme_color: '#2f2417',
    orientation: 'portrait',
    lang: 'ko-KR',
    categories: ['business', 'finance', 'productivity'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}