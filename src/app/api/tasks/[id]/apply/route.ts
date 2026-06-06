import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// POST /api/tasks/[id]/apply - 申请接单
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: '请先登录' }, { status: 401 })
    if (session.role !== 'WORKER') return NextResponse.json({ error: '只有打工人可以接单' }, { status: 403 })

    const task = await prisma.task.findUnique({ where: { id: params.id } })
    if (!task) return NextResponse.json({ error: '任务不存在' }, { status: 404 })
    if (task.status !== 'OPEN') return NextResponse.json({ error: '该任务暂不接受申请' }, { status: 400 })

    // 检查是否已经申请过
    const existing = await prisma.order.findFirst({
      where: { taskId: params.id, workerId: session.userId, status: { in: ['PENDING', 'ACTIVE'] } },
    })
    if (existing) return NextResponse.json({ error: '你已经申请过这个任务了' }, { status: 409 })

    const { proposedPrice, message } = await request.json()

    const order = await prisma.order.create({
      data: {
        taskId: params.id,
        enterpriseId: task.userId,
        workerId: session.userId,
        agreedPrice: proposedPrice ? parseFloat(proposedPrice) : task.budgetMin,
        status: 'PENDING',
      },
    })

    // 创建站内信通知
    await prisma.message.create({
      data: {
        senderId: session.userId,
        receiverId: task.userId,
        orderId: order.id,
        content: message || `${session.name} 申请接单「${task.title}」`,
      },
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Apply error:', error)
    return NextResponse.json({ error: '申请失败，请重试' }, { status: 500 })
  }
}
