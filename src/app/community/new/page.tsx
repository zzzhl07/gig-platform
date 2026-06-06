'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { COMMUNITY_CATEGORIES } from '@/lib/utils'

export default function NewPostPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(true)
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'general',
    tagInput: '',
    tags: [] as string[],
  })

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { if (!d.user) router.push('/login'); else setChecking(false) })
      .catch(() => router.push('/login'))
  }, [router])

  function addTag() {
    const t = form.tagInput.trim()
    if (t && !form.tags.includes(t)) {
      setForm({ ...form, tags: [...form.tags, t], tagInput: '' })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || '发布失败'); return }
      router.push(`/community/${data.post.id}`)
    } catch {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  if (checking) return <div className="container py-20 text-center text-muted-foreground">加载中...</div>

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">发布讨论</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 分类 */}
            <div className="flex flex-wrap gap-2">
              {COMMUNITY_CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${form.category === c.value ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
                  onClick={() => setForm({ ...form, category: c.value })}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>

            <Input
              placeholder="标题"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />

            <Textarea
              placeholder="写下你想分享的内容..."
              rows={10}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
            />

            {/* Tags */}
            <div>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="标签（选填）"
                  value={form.tagInput}
                  onChange={(e) => setForm({ ...form, tagInput: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                />
                <Button type="button" variant="outline" onClick={addTag}>添加</Button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {form.tags.map(t => (
                    <span key={t} className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded text-sm">
                      #{t}
                      <button type="button" onClick={() => setForm({ ...form, tags: form.tags.filter(x => x !== t) })} className="text-muted-foreground hover:text-foreground">&times;</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" variant="primary" disabled={loading} className="w-full">
              {loading ? '发布中...' : '发布帖子'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
