import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET /api/orders - 获取我的工单列表
export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: '请先登录' }, { status: 401 })

    const where = session.role === 'ENTERPRISE'
      ? { enterpriseId: session.userId }
      : { workerId: session.userId }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        task: { select: { title: true, category: true } },
        enterprise: { select: { id: true, name: true, avatar: true } },
        worker: { select: { id: true, name: true, avatar: true, rating: true } },
        review: { select: { id: true, rating: true } },
      },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json({ error: '获取工单列表失败' }, { status: 500 })
  }
}
