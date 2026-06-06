'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WalletSkeleton } from '@/components/skeleton'
import { formatDateTime, formatPrice } from '@/lib/utils'

const TYPE_LABELS: Record<string, string> = {
  DEPOSIT: '充值', WITHDRAW: '提现', PAY: '付款', RELEASE: '收款', REFUND: '退款',
}
const TYPE_VARIANTS: Record<string, 'success' | 'danger' | 'default' | 'warning'> = {
  DEPOSIT: 'success', WITHDRAW: 'danger', PAY: 'warning', RELEASE: 'success', REFUND: 'default',
}

export default function WalletPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionType, setActionType] = useState<'deposit' | 'withdraw'>('deposit')
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [walletRes, meRes] = await Promise.all([
          fetch('/api/wallet'),
          fetch('/api/auth/me'),
        ])
        const meData = await meRes.json()
        if (!meData.user) { router.push('/login'); return }
        setSession(meData.user)
        if (walletRes.ok) setData(await walletRes.json())
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    load()
  }, [router])

  async function handleAction() {
    const num = parseFloat(amount)
    if (!num || num <= 0) { setError('请输入有效金额'); return }
    setActionLoading(true); setError('')
    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionType, amount }),
      })
      const result = await res.json()
      if (!res.ok) { setError(result.error); return }
      setAmount('')
      // Refresh
      const walletRes = await fetch('/api/wallet')
      if (walletRes.ok) setData(await walletRes.json())
    } catch { setError('网络错误') }
    finally { setActionLoading(false) }
  }

  if (loading) return <WalletSkeleton />

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">💰 我的钱包</h1>

      {/* Balance Card */}
      <Card className="mb-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground mb-1">可用余额</p>
          <p className="text-4xl font-bold text-primary mb-4">
            {formatPrice(data?.balance || 0)}
          </p>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={() => setActionType('deposit')}>
              充值
            </Button>
            <Button variant="outline" size="sm" onClick={() => setActionType('withdraw')}>
              提现
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Deposit / Withdraw Form */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex gap-2 mb-4">
            <button
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${actionType === 'deposit' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
              onClick={() => setActionType('deposit')}
            >
              充值
            </button>
            <button
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${actionType === 'withdraw' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
              onClick={() => setActionType('withdraw')}
            >
              提现
            </button>
          </div>

          {error && <div className="mb-3 p-3 rounded bg-destructive/10 text-destructive text-sm">{error}</div>}

          <div className="flex gap-2">
            <Input
              type="number" placeholder="输入金额"
              value={amount} onChange={e => setAmount(e.target.value)}
            />
            <Button
              variant="primary"
              disabled={actionLoading || !amount}
              onClick={handleAction}
            >
              {actionLoading ? '处理中...' : '确认'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {actionType === 'deposit' ? '模拟充值，金额立即到账' : '提现到账户余额，1-3个工作日到账'}
          </p>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader><CardTitle className="text-lg">交易记录</CardTitle></CardHeader>
        <CardContent>
          {data?.transactions?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">暂无交易记录</p>
          ) : (
            <div className="space-y-2">
              {data?.transactions?.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={TYPE_VARIANTS[t.type] || 'default'} className="text-xs">
                        {TYPE_LABELS[t.type] || t.type}
                      </Badge>
                      {t.taskTitle && <span className="text-xs text-muted-foreground">{t.taskTitle}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(t.createdAt)}</p>
                  </div>
                  <span className={`font-semibold ${t.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {t.amount > 0 ? '+' : ''}{formatPrice(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
