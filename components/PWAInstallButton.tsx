'use client'

import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    const onAppInstalled = () => {
      setInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  if (installed) {
    return (
      <button
        type="button"
        disabled
        style={{
          height: 38,
          padding: '0 14px',
          borderRadius: 12,
          border: '1px solid #eadfcf',
          background: '#f3eadf',
          color: '#6b5640',
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        설치됨
      </button>
    )
  }

  if (!deferredPrompt) return null

  return (
    <button
      type="button"
      onClick={async () => {
        if (!deferredPrompt) return
        await deferredPrompt.prompt()
        await deferredPrompt.userChoice
        setDeferredPrompt(null)
      }}
      style={{
        height: 38,
        padding: '0 14px',
        borderRadius: 12,
        border: '1px solid #2f2417',
        background: '#2f2417',
        color: '#fff',
        fontSize: 14,
        fontWeight: 800,
        cursor: 'pointer',
      }}
    >
      앱 설치
    </button>
  )
}