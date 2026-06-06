'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { OrderListSkeleton } from '@/components/skeleton'
import { formatDate, formatPrice, ORDER_STATUS_LABELS } from '@/lib/utils'

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function load() {
      try {
        const [ordersRes, meRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/auth/me'),
        ])
        const ordersData = await ordersRes.json()
        const meData = await meRes.json()

        if (!meData.user) {
          router.push('/login')
          return
        }

        setOrders(ordersData.orders || [])
        setSession(meData.user)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter((o) => o.status === filter)

  const statusCounts: Record<string, number> = {}
  orders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1
  })

  if (loading) {
    return <div className="container py-8 px-4"><h1 className="text-2xl sm:text-3xl font-bold mb-2">我的工单</h1><p className="text-muted-foreground mb-6">加载中...</p><OrderListSkeleton /></div>
  }

  return (
    <div className="container py-4 sm:py-8 px-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold">我的工单</h1>
        <Link href="/tasks" className="text-sm text-primary hover:underline shrink-0">
          <Button variant="outline" size="sm">浏览任务</Button>
        </Link>
      </div>
      <p className="text-sm text-muted-foreground mb-4 sm:mb-6">
        {session?.role === 'ENTERPRISE' ? '你发布的任务的工单' : '你接单的任务'}
      </p>

      {/* Status Filter - horizontal scroll on mobile */}
      <div className="flex gap-1.5 mb-4 sm:mb-6 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        <button
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
          onClick={() => setFilter('all')}
        >
          全部 ({orders.length})
        </button>
        {['PENDING', 'ACTIVE', 'SUBMITTED', 'COMPLETED', 'DISPUTED'].map((s) => (
          statusCounts[s] ? (
            <button
              key={s}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === s ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
              onClick={() => setFilter(s)}
            >
              {ORDER_STATUS_LABELS[s]} ({statusCounts[s]})
            </button>
          ) : null
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-4xl mb-4">📋</p>
          <p className="text-lg">暂无工单</p>
          <Link href="/tasks" className="text-sm text-primary hover:underline">去任务市场看看</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        name={session?.role === 'ENTERPRISE' ? order.worker.name : order.enterprise.name}
                        src={session?.role === 'ENTERPRISE' ? order.worker.avatar : order.enterprise.avatar}
                      />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{order.task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {session?.role === 'ENTERPRISE'
                            ? `接单: ${order.worker.name}`
                            : `发布: ${order.enterprise.name}`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      {order.agreedPrice && (
                        <p className="font-semibold text-primary">{formatPrice(order.agreedPrice)}</p>
                      )}
                      <Badge
                        variant={
                          order.status === 'COMPLETED' ? 'success' :
                          order.status === 'ACTIVE' ? 'default' :
                          order.status === 'PENDING' ? 'warning' :
                          order.status === 'DISPUTED' ? 'danger' :
                          'secondary'
                        }
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
