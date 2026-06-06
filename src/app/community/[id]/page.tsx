'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { formatDateTime, getCommunityCategoryLabel } from '@/lib/utils'

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [post, setPost] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [postRes, meRes] = await Promise.all([
          fetch(`/api/community/${params.id}`),
          fetch('/api/auth/me'),
        ])
        if (!postRes.ok) { router.push('/community'); return }
        setPost(await postRes.json())
        const meData = await meRes.json()
        setSession(meData.user)
      } catch { router.push('/community') }
      finally { setLoading(false) }
    }
    load()
  }, [params.id, router])

  async function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/community/${params.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || '评论失败'); return }
      setPost((prev: any) => ({
        ...prev,
        comments: [...prev.comments, data.comment],
        commentCount: prev.commentCount + 1,
      }))
      setCommentText('')
    } catch { setError('网络错误') }
    finally { setSubmitting(false) }
  }

  function handleLike() {
    fetch(`/api/community/${params.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'like' }),
    }).then(() => {
      setPost((prev: any) => ({ ...prev, likes: prev.likes + 1 }))
    })
  }

  if (loading) return <div className="container py-20 text-center text-muted-foreground">加载中...</div>
  if (!post) return <div className="container py-20 text-center text-muted-foreground">帖子不存在</div>

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Avatar name={post.user.name} src={post.user.avatar} size="lg" />
            <div>
              <p className="font-medium">{post.user.name}</p>
              <p className="text-xs text-muted-foreground">
                {post.user.role === 'ENTERPRISE' && <Badge variant="secondary" className="mr-2">企业</Badge>}
                {formatDateTime(post.createdAt)}
              </p>
            </div>
          </div>

          <div className="mb-2">
            <Badge variant="secondary">{getCommunityCategoryLabel(post.category)}</Badge>
          </div>

          <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground/90 leading-relaxed">
            {post.content}
          </div>

          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-4">
              {post.tags.map((t: string) => (
                <span key={t} className="text-xs bg-muted px-2 py-0.5 rounded">#{t}</span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm text-muted-foreground">
            <button onClick={handleLike} className="flex items-center gap-1 hover:text-foreground transition-colors">
              ❤️ {post.likes}
            </button>
            <span>💬 {post.commentCount} 评论</span>
            {session?.userId === post.userId && (
              <button
                className="text-red-500 hover:text-red-700 ml-auto"
                onClick={async () => {
                  await fetch(`/api/community/${params.id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'delete' }),
                  })
                  router.push('/community')
                }}
              >
                删除
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 评论区 */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">评论 ({post.comments?.length || 0})</h3>

          {session && (
            <form onSubmit={handleComment} className="mb-6">
              {error && <div className="mb-2 p-2 rounded bg-destructive/10 text-destructive text-sm">{error}</div>}
              <Textarea
                placeholder="写下你的评论..."
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <Button type="submit" variant="primary" size="sm" className="mt-2" disabled={submitting || !commentText.trim()}>
                {submitting ? '提交中...' : '发表评论'}
              </Button>
            </form>
          )}

          {!session && (
            <div className="mb-6 p-3 bg-muted rounded-lg text-sm text-muted-foreground text-center">
              <button onClick={() => router.push('/login')} className="text-primary hover:underline">登录</button> 后可以评论
            </div>
          )}

          {post.comments?.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无评论，来抢沙发吧</p>
          ) : (
            <div className="space-y-4">
              {post.comments.map((c: any) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar name={c.user.name} src={c.user.avatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{c.user.name}</span>
                      <span className="text-xs text-muted-foreground">{formatDateTime(c.createdAt)}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
