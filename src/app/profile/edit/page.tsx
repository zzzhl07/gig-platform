'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function EditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', phone: '', wechat: '', bio: '',
    skillInput: '', skills: [] as string[],
  })

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        if (!data.id) { router.push('/login'); return }
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          wechat: data.wechat || '',
          bio: data.bio || '',
          skillInput: '',
          skills: data.skills || [],
        })
        setLoading(false)
      })
      .catch(() => router.push('/login'))
  }, [router])

  function addSkill() {
    const s = form.skillInput.trim()
    if (s && !form.skills.includes(s)) {
      setForm({ ...form, skills: [...form.skills, s], skillInput: '' })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, phone: form.phone, wechat: form.wechat,
          bio: form.bio, skills: form.skills,
        }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || '保存失败'); return }
      router.push('/profile')
    } catch { setError('网络错误') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="container py-20 text-center text-muted-foreground">加载中...</div>

  return (
    <div className="container max-w-md mx-auto py-8 px-4">
      <Card>
        <CardHeader><CardTitle className="text-2xl">编辑资料</CardTitle></CardHeader>
        <CardContent>
          {error && <div className="mb-4 p-3 rounded bg-destructive/10 text-destructive text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">用户名</label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">电话</label>
              <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="选填，对中标方可见" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">微信</label>
              <Input value={form.wechat} onChange={e => setForm({ ...form, wechat: e.target.value })} placeholder="选填，对中标方可见" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">简介</label>
              <Textarea rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="介绍一下自己..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">技能标签</label>
              <div className="flex gap-2 mb-2">
                <Input value={form.skillInput} onChange={e => setForm({ ...form, skillInput: e.target.value })}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                  placeholder="输入技能后按添加" />
                <Button type="button" variant="outline" onClick={addSkill}>添加</Button>
              </div>
              {form.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {form.skills.map(s => (
                    <span key={s} className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded text-sm">
                      {s}
                      <button type="button" onClick={() => setForm({ ...form, skills: form.skills.filter(x => x !== s) })}
                        className="text-muted-foreground hover:text-foreground">&times;</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <Button type="submit" variant="primary" className="w-full" disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
