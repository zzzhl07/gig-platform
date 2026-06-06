import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET /api/profile/[id] - 查看他人公开资料
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true, name: true, role: true, avatar: true, bio: true,
        skills: true, rating: true, completedTasks: true,
        createdAt: true,
        // 只有订单中的人才看到联系方式
        ...(session?.userId ? {
          phone: true, wechat: true,
        } : {}),
      },
    })

    if (!user) return NextResponse.json({ error: '用户不存在' }, { status: 404 })

    // 统计近期的评价
    const recentReviews = await prisma.review.findMany({
      where: { toId: params.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        from: { select: { id: true, name: true, avatar: true } },
        order: { select: { task: { select: { title: true } } } },
      },
    })

    return NextResponse.json({
      ...user,
      skills: JSON.parse(user.skills),
      recentReviews,
    })
  } catch (error) {
    console.error('Public profile fetch error:', error)
    return NextResponse.json({ error: '获取资料失败' }, { status: 500 })
  }
}
