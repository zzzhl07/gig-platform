import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET /api/reviews - 获取我的评价
export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: '请先登录' }, { status: 401 })

    const [sent, received] = await Promise.all([
      prisma.review.findMany({
        where: { fromId: session.userId },
        orderBy: { createdAt: 'desc' },
        include: {
          to: { select: { id: true, name: true, avatar: true } },
          order: { select: { task: { select: { title: true } } } },
        },
      }),
      prisma.review.findMany({
        where: { toId: session.userId },
        orderBy: { createdAt: 'desc' },
        include: {
          from: { select: { id: true, name: true, avatar: true } },
          order: { select: { task: { select: { title: true } } } },
        },
      }),
    ])

    return NextResponse.json({ sent, received })
  } catch (error) {
    console.error('Reviews fetch error:', error)
    return NextResponse.json({ error: '获取评价失败' }, { status: 500 })
  }
}

// POST /api/reviews - 创建评价
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: '请先登录' }, { status: 401 })

    const { orderId, rating, content } = await request.json()

    if (!orderId || !rating) {
      return NextResponse.json({ error: '请填写评价内容' }, { status: 400 })
    }

    // 验证工单
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return NextResponse.json({ error: '工单不存在' }, { status: 404 })
    if (order.status !== 'COMPLETED') return NextResponse.json({ error: '工单还未完成' }, { status: 400 })
    if (order.enterpriseId !== session.userId && order.workerId !== session.userId) {
      return NextResponse.json({ error: '无权评价' }, { status: 403 })
    }

    // 检查是否已经评价过
    const existing = await prisma.review.findFirst({
      where: { orderId, fromId: session.userId },
    })
    if (existing) return NextResponse.json({ error: '你已经评价过了' }, { status: 409 })

    // 确定评价对象
    const toId = session.userId === order.enterpriseId ? order.workerId : order.enterpriseId

    const review = await prisma.review.create({
      data: {
        orderId,
        fromId: session.userId,
        toId,
        rating: Math.min(5, Math.max(1, Math.round(rating))),
        content: content || null,
      },
    })

    // 更新被评价者的平均评分
    const allReviews = await prisma.review.findMany({
      where: { toId },
      select: { rating: true },
    })
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await prisma.user.update({
      where: { id: toId },
      data: { rating: Math.round(avgRating * 10) / 10 },
    })

    return NextResponse.json({ review })
  } catch (error) {
    console.error('Review create error:', error)
    return NextResponse.json({ error: '评价失败' }, { status: 500 })
  }
}
