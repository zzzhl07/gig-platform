import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// POST /api/community/[id]/comments - 添加评论
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: '请先登录' }, { status: 401 })

    const { content } = await request.json()
    if (!content) return NextResponse.json({ error: '请输入评论内容' }, { status: 400 })

    const post = await prisma.communityPost.findUnique({ where: { id: params.id } })
    if (!post) return NextResponse.json({ error: '帖子不存在' }, { status: 404 })

    const comment = await prisma.communityComment.create({
      data: {
        content,
        postId: params.id,
        userId: session.userId,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true, role: true } },
      },
    })

    return NextResponse.json({ comment })
  } catch (error) {
    console.error('Comment error:', error)
    return NextResponse.json({ error: '评论失败' }, { status: 500 })
  }
}
