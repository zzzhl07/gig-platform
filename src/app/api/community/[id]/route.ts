import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET /api/community/[id] - 帖子详情
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.communityPost.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, avatar: true, role: true, bio: true } },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: { id: true, name: true, avatar: true, role: true } },
          },
        },
        _count: { select: { comments: true } },
      },
    })

    if (!post) {
      return NextResponse.json({ error: '帖子不存在' }, { status: 404 })
    }

    return NextResponse.json({
      ...post,
      tags: JSON.parse(post.tags),
      commentCount: post._count.comments,
      _count: undefined,
    })
  } catch (error) {
    console.error('Community detail error:', error)
    return NextResponse.json({ error: '获取帖子详情失败' }, { status: 500 })
  }
}

// POST /api/community/[id] - 点赞/置顶/删除（owner only）
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: '请先登录' }, { status: 401 })

    const { action } = await request.json()
    const post = await prisma.communityPost.findUnique({ where: { id: params.id } })
    if (!post) return NextResponse.json({ error: '帖子不存在' }, { status: 404 })

    if (action === 'like') {
      await prisma.communityPost.update({
        where: { id: params.id },
        data: { likes: { increment: 1 } },
      })
      return NextResponse.json({ success: true })
    }

    if (post.userId !== session.userId) {
      return NextResponse.json({ error: '无权操作' }, { status: 403 })
    }

    if (action === 'delete') {
      await prisma.communityComment.deleteMany({ where: { postId: params.id } })
      await prisma.communityPost.delete({ where: { id: params.id } })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: '无效操作' }, { status: 400 })
  } catch (error) {
    console.error('Community action error:', error)
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}
