import type { Metadata, Viewport } from 'next'
import { Navbar } from '@/components/navbar'
import { getSession } from '@/lib/session'
import './globals.css'

export const metadata: Metadata = {
  title: '打工人集市 - 企业发单 · 打工人接单',
  description: '灵活用工平台。企业按需发布任务，打工人自由接单。担保交易保障权益，信用体系让合作更放心。',
  keywords: ['灵活用工', '兼职', '自由职业', '接单平台', '打工人', '任务平台'],
  robots: 'index, follow',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2563eb',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-background antialiased">
        <Navbar session={session ? { name: session.name, role: session.role } : null} />
        <main className="min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]">
          {children}
        </main>
        <footer className="border-t py-6 sm:py-8 text-center text-xs sm:text-sm text-muted-foreground">
          <div className="container">
            <p>© 2026 打工人集市 — 让每一份劳动都被尊重</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
