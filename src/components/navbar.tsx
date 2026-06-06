'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/tasks', label: '任务市场', icon: '🔍' },
  { href: '/community', label: '社区', icon: '💬' },
  { href: '/orders', label: '我的工单', icon: '📋' },
  { href: '/messages', label: '消息', icon: '✉️' },
]

export function Navbar({ session }: { session: { name: string; role: string } | null }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Track scroll for shadow effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <header className={`sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-shadow ${scrolled ? 'shadow-sm' : ''}`}>
      <div className="border-b">
        <div className="container flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 font-bold text-lg sm:text-xl shrink-0">
            <span className="text-primary text-xl sm:text-2xl">⚡</span>
            <span className="hidden xs:inline">打工人集市</span>
            <span className="xs:hidden">打工</span>
          </Link>

          {/* Desktop Nav - hidden on mobile */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent",
                  isActive(item.href)
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground"
                )}
              >
                {item.icon} {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            {session ? (
              <div className="flex items-center gap-2 lg:gap-3">
                <Link href="/tasks/post">
                  <Button variant="primary" size="sm" className="whitespace-nowrap">发布任务</Button>
                </Link>
                <Link href="/profile" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                    {session.name.slice(0, 2)}
                  </div>
                  <span className="text-sm font-medium hidden lg:inline truncate max-w-[100px]">{session.name}</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">登录</Button>
                </Link>
                <Link href="/login?tab=register">
                  <Button variant="primary" size="sm">注册</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex items-center justify-center h-10 w-10 rounded-lg hover:bg-accent transition-colors"
            onClick={() => setMenuOpen(true)}
            aria-label="打开菜单"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />

          {/* Drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-background shadow-xl animate-in slide-in-from-right">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-bold text-lg">⚡ 菜单</span>
              <button
                className="h-9 w-9 rounded-lg hover:bg-accent flex items-center justify-center"
                onClick={() => setMenuOpen(false)}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* User info */}
            {session && (
              <div className="p-4 border-b bg-muted/30">
                <Link href="/profile" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
                  <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {session.name.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{session.name}</p>
                    <p className="text-xs text-muted-foreground">{session.role === 'ENTERPRISE' ? '🏢 企业' : '🛠️ 打工人'}</p>
                  </div>
                </Link>
              </div>
            )}

            {/* Nav Items */}
            <nav className="p-3 space-y-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-accent"
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>

            <hr className="mx-3" />

            {/* Action buttons */}
            <div className="p-3 space-y-1">
              {session ? (
                <>
                  <Link href="/tasks/post" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-primary hover:bg-accent" onClick={() => setMenuOpen(false)}>
                    <span className="text-lg">📝</span>发布任务
                  </Link>
                  <Link href="/wallet" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-accent" onClick={() => setMenuOpen(false)}>
                    <span className="text-lg">💰</span>钱包
                  </Link>
                  <Link href="/profile" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-accent" onClick={() => setMenuOpen(false)}>
                    <span className="text-lg">👤</span>个人中心
                  </Link>
                </>
              ) : (
                <div className="flex flex-col gap-2 p-3">
                  <Link href="/login" onClick={() => setMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start">登录</Button>
                  </Link>
                  <Link href="/login?tab=register" onClick={() => setMenuOpen(false)}>
                    <Button variant="primary" className="w-full justify-start">注册</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
