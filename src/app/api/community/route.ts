import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET /api/community - 获取帖子列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    if (category && category !== 'all') where.category = category

    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        where,
        orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, avatar: true, role: true } },
          _count: { select: { comments: true } },
        },
      }),
      prisma.communityPost.count({ where }),
    ])

    return NextResponse.json({
      posts: posts.map(p => ({
        ...p,
        tags: JSON.parse(p.tags),
        commentCount: p._count.comments,
        _count: undefined,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Community fetch error:', error)
    return NextResponse.json({ error: '获取帖子失败' }, { status: 500 })
  }
}

// POST /api/community - 创建帖子
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: '请先登录' }, { status: 401 })

    const { title, content, category, tags } = await request.json()
    if (!title || !content) {
      return NextResponse.json({ error: '请填写标题和内容' }, { status: 400 })
    }

    const post = await prisma.communityPost.create({
      data: {
        title,
        content,
        category: category || 'general',
        tags: JSON.stringify(tags || []),
        userId: session.userId,
      },
    })

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Community create error:', error)
    return NextResponse.json({ error: '发布失败' }, { status: 500 })
  }
}
