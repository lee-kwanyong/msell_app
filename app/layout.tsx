import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BottomTabBar from '@/components/layout/BottomTabBar'

export const metadata: Metadata = {
  title: 'Msell',
  description: 'Digital asset marketplace',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body>
        <Header />
        {children}
        <Footer />
        <BottomTabBar />
      </body>
    </html>
  )
}