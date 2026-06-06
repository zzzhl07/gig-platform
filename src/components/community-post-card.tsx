'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDateTime, getCommunityCategoryLabel } from '@/lib/utils'

interface PostCardProps {
  post: {
    id: string
    title: string
    content: string
    category: string
    tags: string[]
    likes: number
    commentCount: number
    pinned: boolean
    user: { name: string; avatar?: string | null; role: string }
    createdAt: string
  }
}

export function CommunityPostCard({ post }: PostCardProps) {
  return (
    <Link href={`/community/${post.id}`}>
      <Card className={`hover:shadow-md transition-shadow cursor-pointer ${post.pinned ? 'border-primary/30 bg-primary/[0.02]' : ''}`}>
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Avatar name={post.user.name} src={post.user.avatar} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {post.pinned && (
                  <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">📌 置顶</span>
                )}
                <span className="text-xs text-muted-foreground">
                  {post.user.name}
                  {post.user.role === 'ENTERPRISE' && ' · '}
                  {post.user.role === 'ENTERPRISE' && <span className="text-blue-500">企业</span>}
                </span>
                <span className="text-xs text-muted-foreground">{formatDateTime(post.createdAt)}</span>
              </div>

              <h3 className="font-semibold mb-1 line-clamp-1">{post.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{post.content}</p>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{getCommunityCategoryLabel(post.category)}</span>
                <span>·</span>
                <span>❤️ {post.likes}</span>
                <span>💬 {post.commentCount}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
