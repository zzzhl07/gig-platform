'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'WORKER',
  })

  useEffect(() => {
    if (searchParams.get('tab') === 'register') {
      setTab('register')
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = tab === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body = tab === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password, role: form.role }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '操作失败')
        return
      }

      router.push('/')
      router.refresh()
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-md mx-auto py-16 px-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">欢迎加入</CardTitle>
          <CardDescription>
            {tab === 'login' ? '登录你的账号' : '创建一个新账号'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tab Switcher */}
          <div className="flex mb-6 bg-secondary rounded-lg p-1">
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'login' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
              onClick={() => { setTab('login'); setError('') }}
            >
              登录
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'register' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
              onClick={() => { setTab('register'); setError('') }}
            >
              注册
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <Input
                placeholder="用户名"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            )}

            <Input
              type="email"
              placeholder="邮箱"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

            <Input
              type="password"
              placeholder="密码（至少6位）"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />

            {tab === 'register' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">我是</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`flex-1 p-3 rounded-lg border text-sm font-medium transition-colors ${form.role === 'WORKER' ? 'border-primary bg-primary/5 text-primary' : 'border-input'}`}
                    onClick={() => setForm({ ...form, role: 'WORKER' })}
                  >
                    🛠️ 接单干活
                  </button>
                  <button
                    type="button"
                    className={`flex-1 p-3 rounded-lg border text-sm font-medium transition-colors ${form.role === 'ENTERPRISE' ? 'border-primary bg-primary/5 text-primary' : 'border-input'}`}
                    onClick={() => setForm({ ...form, role: 'ENTERPRISE' })}
                  >
                    🏢 发布任务
                  </button>
                </div>
              </div>
            )}

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? '处理中...' : tab === 'login' ? '登录' : '注册'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container max-w-md mx-auto py-16 px-4 text-center text-muted-foreground">加载中...</div>}>
      <LoginForm />
    </Suspense>
  )
}
