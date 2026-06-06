'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CommunityPostCard } from '@/components/community-post-card'
import { PostCardSkeleton } from '@/components/skeleton'
import { COMMUNITY_CATEGORIES } from '@/lib/utils'

export default function CommunityPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchPosts()
  }, [category, page])

  async function fetchPosts() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category !== 'all') params.set('category', category)
      params.set('page', String(page))
      const res = await fetch(`/api/community?${params}`)
      const data = await res.json()
      setPosts(data.posts || [])
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-4 sm:py-8 px-4">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">💬 社区</h1>
          <p className="text-sm text-muted-foreground mt-0.5 hidden sm:block">交流经验、分享心得、互帮互助</p>
        </div>
        <Link href="/community/new">
          <Button variant="primary" size="sm">发布</Button>
        </Link>
      </div>

      {/* Category filter - horizontal scroll on mobile */}
      <div className="flex gap-1.5 mb-4 sm:mb-6 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        <button
          className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${category === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
          onClick={() => { setCategory('all'); setPage(1) }}
        >全部</button>
        {COMMUNITY_CATEGORIES.map((c) => (
          <button key={c.value}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${category === c.value ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
            onClick={() => { setCategory(c.value); setPage(1) }}
          >{c.icon} {c.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (<PostCardSkeleton key={i} />))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-4xl mb-4">📝</p>
          <p className="text-lg mb-4">还没有帖子</p>
          <Link href="/community/new">
            <Button variant="primary">发布第一条帖子</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {posts.map((post) => (
              <CommunityPostCard key={post.id} post={post} />
            ))}
          </div>

          {totalPages > 1 && page < totalPages && (
            <div className="text-center mt-8">
              <Button variant="outline" onClick={() => setPage(page + 1)} disabled={loading}>
                加载更多
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
