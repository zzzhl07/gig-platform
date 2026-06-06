'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { DetailSkeleton } from '@/components/skeleton'
import { formatDate, formatPrice, getCategoryLabel, TASK_STATUS_LABELS } from '@/lib/utils'

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [task, setTask] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [proposedPrice, setProposedPrice] = useState('')
  const [applyMsg, setApplyMsg] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [taskRes, meRes] = await Promise.all([
          fetch(`/api/tasks/${params.id}`),
          fetch('/api/auth/me'),
        ])
        const taskData = await taskRes.json()
        const meData = await meRes.json()
        setTask(taskData)
        setSession(meData.user)
        if (taskData.budgetMin) setProposedPrice(String(taskData.budgetMin))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  async function handleApply(e: React.FormEvent) {
    e.preventDefault()
    setApplying(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/tasks/${params.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposedPrice: proposedPrice || null,
          message: applyMsg,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '申请失败')
        return
      }
      setSuccess('申请已提交！等待企业确认。')
      setApplyMsg('')
    } catch {
      setError('网络错误')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return <DetailSkeleton />
  }

  if (!task) {
    return <div className="container py-20 text-center text-muted-foreground">任务不存在</div>
  }

  const isOwner = session?.userId === task.userId
  const hasApplied = task.orders?.some((o: any) => o.workerId === session?.userId)

  return (
    <div className="container py-4 sm:py-8 px-4">
      <div className="flex flex-col lg:flex-row lg:gap-8">
        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-4 sm:space-y-6 order-2 lg:order-1">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Badge variant={task.status === 'OPEN' ? 'success' : 'secondary'}>
                {TASK_STATUS_LABELS[task.status]}
              </Badge>
              {task.category && (
                <Badge variant="secondary">{getCategoryLabel(task.category)}</Badge>
              )}
              {task.isRemote ? (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">🌐 远程</span>
              ) : (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">📍 线下</span>
              )}
              {task.isConfidential && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">🔒 保密任务</span>
              )}
            </div>
            <h1 className="text-2xl font-bold mb-2">{task.title}</h1>
            <p className="text-muted-foreground">{task.description}</p>
          </div>

          {/* Skills */}
          {task.skills?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">技能要求</h3>
              <div className="flex flex-wrap gap-1">
                {task.skills.map((s: string) => (
                  <span key={s} className="px-2.5 py-1 bg-secondary rounded text-sm">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Applicants (for owner) */}
          {isOwner && task.orders?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">申请人 ({task.orders.length})</h3>
              <div className="space-y-3">
                {task.orders.map((order: any) => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar name={order.worker.name} src={order.worker.avatar} />
                          <div>
                            <p className="font-medium">{order.worker.name}</p>
                            <p className="text-xs text-muted-foreground">
                              ⭐ {order.worker.rating.toFixed(1)} · {order.worker.completedTasks}单
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.worker.bio?.slice(0, 50)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary">
                            {order.agreedPrice ? formatPrice(order.agreedPrice) : '面议'}
                          </p>
                          <Badge>{order.status === 'PENDING' ? '待确认' : order.status}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 order-1 lg:order-2 lg:w-80 shrink-0">
          {/* Budget & Info */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">预算</span>
                <span className="font-semibold">
                  {task.budgetMin || task.budgetMax
                    ? `${task.budgetMin ? formatPrice(task.budgetMin) : ''} - ${task.budgetMax ? formatPrice(task.budgetMax) : '面议'}`
                    : '面议'}
                </span>
              </div>
              {task.deadline && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">截止日期</span>
                  <span>{formatDate(task.deadline)}</span>
                </div>
              )}
              {!task.isRemote && task.location && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">📍 工作地点</span>
                  <span>
                    {task.location}
                    {task.locationDetail && ` · ${task.locationDetail}`}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">发布时间</span>
                <span>{formatDate(task.createdAt)}</span>
              </div>
              {task.isConfidential && (
                <div className="pt-2 text-xs text-purple-600 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400 -mx-5 -mb-5 mt-2 px-5 py-3 rounded-b-xl">
                  🔒 这是一个保密任务，仅登录用户可见详细信息
                </div>
              )}
            </CardContent>
          </Card>

          {/* Publisher */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <Avatar name={task.user.name} src={task.user.avatar} size="lg" />
                <div>
                  <p className="font-medium">{task.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ⭐ {task.user.rating.toFixed(1)} · {task.user.completedTasks}单
                  </p>
                </div>
              </div>
              {task.user.bio && (
                <p className="text-sm text-muted-foreground">{task.user.bio}</p>
              )}
            </CardContent>
          </Card>

          {/* Apply Form */}
          {session && !isOwner && task.status === 'OPEN' && !hasApplied && (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold mb-3">申请接单</h3>
                {success && (
                  <div className="mb-3 p-3 rounded-lg bg-green-100 text-green-800 text-sm">{success}</div>
                )}
                {error && (
                  <div className="mb-3 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
                )}
                <form onSubmit={handleApply} className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">报价 (元)</label>
                    <input
                      type="number"
                      className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm mt-1"
                      placeholder={task.budgetMin ? `建议 ${task.budgetMin}-${task.budgetMax || '面议'}` : '请输入报价'}
                      value={proposedPrice}
                      onChange={(e) => setProposedPrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">留言</label>
                    <Textarea
                      placeholder="告诉发布者你为什么适合这个任务..."
                      value={applyMsg}
                      onChange={(e) => setApplyMsg(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button type="submit" variant="primary" className="w-full" disabled={applying}>
                    {applying ? '提交中...' : '提交申请'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {!session && task.status === 'OPEN' && (
            <Card>
              <CardContent className="p-5 text-center">
                <p className="text-sm text-muted-foreground mb-3">登录后即可申请接单</p>
                <Button variant="primary" className="w-full" onClick={() => router.push('/login')}>
                  去登录
                </Button>
              </CardContent>
            </Card>
          )}

          {hasApplied && (
            <Card>
              <CardContent className="p-5 text-center">
                <p className="text-sm text-green-600 font-medium">✅ 已提交申请</p>
                <p className="text-xs text-muted-foreground mt-1">等待企业确认中</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
