'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CATEGORIES, CATEGORY_GROUPS, getCategoryIcon } from '@/lib/utils'

export default function PostTaskPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [workType, setWorkType] = useState<'white' | 'blue'>('white')
  const [form, setForm] = useState({
    title: '',
    description: '',
    budgetMin: '',
    budgetMax: '',
    deadline: '',
    category: '',
    skillInput: '',
    skills: [] as string[],
    isRemote: true,
    location: '',
    locationDetail: '',
    isConfidential: false,
    hideBidderInfo: true,
  })

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (!data.user || data.user.role !== 'ENTERPRISE') {
          router.push('/login')
        } else {
          setCheckingAuth(false)
        }
      })
      .catch(() => router.push('/login'))
  }, [router])

  function addSkill() {
    const s = form.skillInput.trim()
    if (s && !form.skills.includes(s)) {
      setForm({ ...form, skills: [...form.skills, s], skillInput: '' })
    }
  }

  function removeSkill(skill: string) {
    setForm({ ...form, skills: form.skills.filter(s => s !== skill) })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          budgetMin: form.budgetMin || null,
          budgetMax: form.budgetMax || null,
          deadline: form.deadline || null,
          category: form.category || null,
          skills: form.skills,
          isRemote: form.isRemote,
          location: form.location || null,
          locationDetail: form.locationDetail || null,
          isConfidential: form.isConfidential,
          hideBidderInfo: form.hideBidderInfo,
        }),
      })

      const data = await res.json()
      if (!res.ok) { setError(data.error || '发布失败'); return }
      router.push(`/tasks/${data.task.id}`)
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return <div className="container py-20 text-center text-muted-foreground">加载中...</div>
  }

  const filteredCategories = CATEGORIES.filter(c => c.group === workType || c.group === 'both')

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">发布任务</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 标题 */}
            <div>
              <label className="block text-sm font-medium mb-1">任务标题 *</label>
              <Input
                placeholder="例如：公司官网首页改版设计 / 家里水管漏水维修"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            {/* 描述 */}
            <div>
              <label className="block text-sm font-medium mb-1">任务描述 *</label>
              <Textarea
                placeholder="请详细描述任务需求、交付物、技术要求等..."
                rows={6}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>

            {/* 工作方式 */}
            <div>
              <label className="block text-sm font-medium mb-2">工作方式</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`flex-1 p-3 rounded-lg border text-center text-sm font-medium transition-colors ${form.isRemote ? 'border-primary bg-primary/5 text-primary' : 'border-input'}`}
                  onClick={() => setForm({ ...form, isRemote: true, location: '', locationDetail: '' })}
                >
                  🌐 远程工作
                </button>
                <button
                  type="button"
                  className={`flex-1 p-3 rounded-lg border text-center text-sm font-medium transition-colors ${!form.isRemote ? 'border-primary bg-primary/5 text-primary' : 'border-input'}`}
                  onClick={() => setForm({ ...form, isRemote: false })}
                >
                  📍 线下上门
                </button>
              </div>
            </div>

            {/* 线下地址 */}
            {!form.isRemote && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">所在城市/区域</label>
                  <Input
                    placeholder="例如：北京市朝阳区"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">详细地址</label>
                  <Input
                    placeholder="小区名/门牌号"
                    value={form.locationDetail}
                    onChange={(e) => setForm({ ...form, locationDetail: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* 分类 */}
            <div>
              <label className="block text-sm font-medium mb-2">任务分类</label>

              {/* 工作类型切换 */}
              <div className="flex gap-2 mb-3">
                {CATEGORY_GROUPS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${workType === g.value ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                    onClick={() => { setWorkType(g.value); setForm({ ...form, category: '' }) }}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              {/* 具体分类 */}
              <div className="flex flex-wrap gap-2">
                {filteredCategories.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${form.category === c.value ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
                    onClick={() => setForm({ ...form, category: c.value })}
                  >
                    {getCategoryIcon(c.value)} {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 预算 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">最低预算 (元)</label>
                <Input
                  type="number" placeholder="1000"
                  value={form.budgetMin}
                  onChange={(e) => setForm({ ...form, budgetMin: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">最高预算 (元)</label>
                <Input
                  type="number" placeholder="5000"
                  value={form.budgetMax}
                  onChange={(e) => setForm({ ...form, budgetMax: e.target.value })}
                />
              </div>
            </div>

            {/* 截止日期 */}
            <div>
              <label className="block text-sm font-medium mb-1">截止日期</label>
              <Input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>

            {/* 技能要求 */}
            <div>
              <label className="block text-sm font-medium mb-1">技能/资质要求</label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="输入技能后按添加"
                  value={form.skillInput}
                  onChange={(e) => setForm({ ...form, skillInput: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                />
                <Button type="button" variant="outline" onClick={addSkill}>添加</Button>
              </div>
              {form.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {form.skills.map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded text-sm">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="text-muted-foreground hover:text-foreground">&times;</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 隐私与保密设置 */}
            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold mb-3">🔒 隐私与保密设置</h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={form.isConfidential}
                    onChange={(e) => setForm({ ...form, isConfidential: e.target.checked })}
                  />
                  <div>
                    <p className="text-sm font-medium">保密任务</p>
                    <p className="text-xs text-muted-foreground">任务标题和描述只对登录用户可见，不会出现在公开搜索结果中</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={form.hideBidderInfo}
                    onChange={(e) => setForm({ ...form, hideBidderInfo: e.target.checked })}
                  />
                  <div>
                    <p className="text-sm font-medium">隐藏申请人信息</p>
                    <p className="text-xs text-muted-foreground">申请人的个人信息只在确认接单后对发布者可见</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                {loading ? '发布中...' : '发布任务'}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                发布后等待接单，你可以从申请人中选择合适的人选
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
