'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatPrice } from '@/lib/utils'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/profile')
        if (!res.ok) { router.push('/login'); return }
        setProfile(await res.json())
      } catch { router.push('/login') }
      finally { setLoading(false) }
    }
    load()
  }, [router])

  if (loading) return <div className="container py-20 text-center text-muted-foreground">加载中...</div>
  if (!profile) return null

  const skills = profile.skills || []

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar name={profile.name} src={profile.avatar} size="lg" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <Badge variant={profile.role === 'ENTERPRISE' ? 'default' : 'secondary'}>
                  {profile.role === 'ENTERPRISE' ? '🏢 企业' : '🛠️ 打工人'}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                <span>⭐ {profile.rating.toFixed(1)}</span>
                <span>✅ {profile.completedTasks} 单完成</span>
                <span>💰 {formatPrice(profile.walletBalance)}</span>
              </div>
              {profile.bio && <p className="text-sm">{profile.bio}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      {skills.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-3">技能标签</h3>
            <div className="flex flex-wrap gap-1">
              {skills.map((s: string) => (
                <span key={s} className="px-2.5 py-1 bg-secondary rounded text-sm">{s}</span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Info */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <h3 className="font-semibold mb-3">联系方式</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">邮箱</span><span>{profile.email}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">电话</span><span>{profile.phone || '未设置'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">微信</span><span>{profile.wechat || '未设置'}</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/profile/edit" className="flex-1">
          <Button variant="primary" className="w-full">编辑资料</Button>
        </Link>
        <Link href="/wallet" className="flex-1">
          <Button variant="outline" className="w-full">钱包</Button>
        </Link>
        <Button
          variant="ghost"
          className="text-red-500"
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' })
            router.push('/')
            router.refresh()
          }}
        >
          退出登录
        </Button>
      </div>
    </div>
  )
}
