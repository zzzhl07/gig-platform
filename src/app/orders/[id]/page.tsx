'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { formatDate, formatPrice, ORDER_STATUS_LABELS } from '@/lib/utils'

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [submitContent, setSubmitContent] = useState('')
  const [error, setError] = useState('')
  const [reviewForm, setReviewForm] = useState({ rating: 5, content: '' })
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [orderRes, meRes] = await Promise.all([
          fetch(`/api/orders/${params.id}`),
          fetch('/api/auth/me'),
        ])
        if (!orderRes.ok || !meRes.ok) { router.push('/orders'); return }
        const orderData = await orderRes.json()
        const meData = await meRes.json()
        setOrder(orderData)
        setSession(meData.user)
        // Check if current user already left a review
        if (orderData.review) {
          setReviewSubmitted(true)
        }
        if (orderData.review && orderData.review.fromId === meData.user?.userId) {
          setReviewSubmitted(true)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id, router])

  async function updateStatus(status: string, extra?: any) {
    setActionLoading(true)
    setError('')
    try {
      const body: any = { status, ...extra }
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || '操作失败'); return }
      // Refresh
      const orderRes = await fetch(`/api/orders/${params.id}`)
      const orderData = await orderRes.json()
      setOrder(orderData)
      setSubmitContent('')
    } catch {
      setError('网络错误')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return <div className="container py-20 text-center text-muted-foreground">加载中...</div>
  }

  if (!order || !session) {
    return <div className="container py-20 text-center text-muted-foreground">工单不存在</div>
  }

  const isEnterprise = session.userId === order.enterpriseId
  const isWorker = session.userId === order.workerId

  return (
    <div className="container py-8 px-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{order.task.title}</h1>
          <Badge
            variant={
              order.status === 'COMPLETED' ? 'success' :
              order.status === 'ACTIVE' ? 'default' :
              order.status === 'PENDING' ? 'warning' :
              'secondary'
            }
          >
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      {reviewSubmitted && (
        <div className="mb-4 p-4 rounded-lg bg-green-50 text-green-800 text-sm border border-green-200">
          ✅ 感谢你的评价！
        </div>
      )}

      {/* Partner Info */}
      <Card className="mb-4">
        <CardContent className="p-5 flex items-center gap-3">
          <Avatar
            name={isEnterprise ? order.worker.name : order.enterprise.name}
            size="lg"
          />
          <div>
            <p className="font-medium">
              {isEnterprise ? '接单方: ' : '发布方: '}
              {isEnterprise ? order.worker.name : order.enterprise.name}
            </p>
            {order.agreedPrice && (
              <p className="text-sm text-muted-foreground">
                成交价: <span className="font-semibold text-primary">{formatPrice(order.agreedPrice)}</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Flow */}
      <Card className="mb-4">
        <CardContent className="p-5">
          <h3 className="font-semibold mb-3">工单进度</h3>
          <div className="space-y-3">
            <StatusStep done={true} label="申请提交" />
            <StatusStep done={order.status !== 'PENDING'} label={order.status === 'COMPLETED' || order.status === 'ACTIVE' || order.status === 'SUBMITTED' ? '已确认接单' : '待确认'} />
            <StatusStep done={order.status === 'COMPLETED' || order.status === 'SUBMITTED'} active={order.status === 'ACTIVE'} label="工作交付" />
            <StatusStep done={order.status === 'COMPLETED'} active={order.status === 'SUBMITTED'} label="验收完成" />
          </div>
        </CardContent>
      </Card>

      {/* Submit Work (Worker only) */}
      {isWorker && order.status === 'ACTIVE' && (
        <Card className="mb-4">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-3">提交工作成果</h3>
            <Textarea
              placeholder="请描述你完成的工作，可以包含链接、说明等..."
              rows={5}
              value={submitContent}
              onChange={(e) => setSubmitContent(e.target.value)}
            />
            <Button
              className="mt-3"
              variant="primary"
              disabled={actionLoading || !submitContent.trim()}
              onClick={() => updateStatus('SUBMITTED', { submitData: { content: submitContent } })}
            >
              {actionLoading ? '提交中...' : '提交验收'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Submitted Work (Enterprise can see) */}
      {order.workerSubmit && (
        <Card className="mb-4">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-3">交付内容</h3>
            <div className="p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap">
              {order.workerSubmit.content || JSON.stringify(order.workerSubmit)}
            </div>
            {isEnterprise && order.status === 'SUBMITTED' && (
              <div className="flex gap-2 mt-3">
                <Button
                  variant="primary"
                  disabled={actionLoading}
                  onClick={() => updateStatus('COMPLETED')}
                >
                  {actionLoading ? '处理中...' : '确认完成 ✅'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Review Section (after completion) */}
      {order.status === 'COMPLETED' && !reviewSubmitted && (
        <Card className="mb-4 border-green-200">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-3">⭐ 给对方评价</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">评分</label>
                <div className="flex gap-1 text-2xl">
                  {[1,2,3,4,5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`transition-colors ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-muted-foreground/30'}`}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">评价内容（选填）</label>
                <Textarea
                  placeholder="分享你的合作体验..."
                  rows={3}
                  value={reviewForm.content}
                  onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                />
              </div>
              <Button
                variant="primary"
                disabled={actionLoading}
                onClick={async () => {
                  setActionLoading(true); setError('')
                  try {
                    const res = await fetch('/api/reviews', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        orderId: params.id,
                        rating: reviewForm.rating,
                        content: reviewForm.content,
                      }),
                    })
                    const data = await res.json()
                    if (!res.ok) { setError(data.error); return }
                    setReviewSubmitted(true)
                    // Refresh order data
                    const orderRes = await fetch(`/api/orders/${params.id}`)
                    if (orderRes.ok) setOrder(await orderRes.json())
                  } catch { setError('网络错误') }
                  finally { setActionLoading(false) }
                }}
              >
                {actionLoading ? '提交中...' : '提交评价'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold mb-3">沟通记录</h3>
          {order.messages?.length > 0 ? (
            <div className="space-y-3">
              {order.messages.map((msg: any) => (
                <div key={msg.id} className="flex gap-2 items-start">
                  <span className="text-xs font-medium shrink-0 mt-0.5">
                    {msg.senderId === session.userId ? '我' : (isEnterprise ? order.worker.name : order.enterprise.name)}:
                  </span>
                  <p className="text-sm">{msg.content}</p>
                  <span className="text-xs text-muted-foreground shrink-0">{formatDate(msg.createdAt)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">暂无沟通记录</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatusStep({ done, active, label }: { done: boolean; active?: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
        done ? 'bg-green-100 text-green-700' :
        active ? 'bg-primary/10 text-primary' :
        'bg-muted text-muted-foreground'
      }`}>
        {done ? '✓' : active ? '○' : '○'}
      </div>
      <span className={`text-sm ${done ? 'text-foreground' : active ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </div>
  )
}
