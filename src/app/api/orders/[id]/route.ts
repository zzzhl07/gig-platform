import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET /api/orders/[id] - 获取工单详情
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: '请先登录' }, { status: 401 })

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        task: true,
        enterprise: { select: { id: true, name: true, avatar: true, rating: true } },
        worker: { select: { id: true, name: true, avatar: true, rating: true, bio: true } },
        review: true,
        transactions: true,
        messages: { orderBy: { createdAt: 'asc' } },
      },
    })

    if (!order) return NextResponse.json({ error: '工单不存在' }, { status: 404 })

    // 验证权限
    if (order.enterpriseId !== session.userId && order.workerId !== session.userId) {
      return NextResponse.json({ error: '无权访问' }, { status: 403 })
    }

    return NextResponse.json({
      ...order,
      workerSubmit: order.workerSubmit ? JSON.parse(order.workerSubmit) : null,
    })
  } catch (error) {
    console.error('Order detail error:', error)
    return NextResponse.json({ error: '获取工单详情失败' }, { status: 500 })
  }
}

// PATCH /api/orders/[id] - 更新工单状态
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: '请先登录' }, { status: 401 })

    const { status, ...data } = await request.json()
    const order = await prisma.order.findUnique({ where: { id: params.id } })
    if (!order) return NextResponse.json({ error: '工单不存在' }, { status: 404 })

    // 验证权限和状态流转
    const updates: any = { status }

    switch (status) {
      case 'ACTIVE': // 企业确认接单
        if (order.enterpriseId !== session.userId) return NextResponse.json({ error: '无权操作' }, { status: 403 })
        if (order.status !== 'PENDING') return NextResponse.json({ error: '状态错误' }, { status: 400 })
        // 更新任务状态
        await prisma.task.update({
          where: { id: order.taskId },
          data: { status: 'IN_PROGRESS', workerId: order.workerId },
        })
        // 冻结企业资金
        if (order.agreedPrice) {
          await prisma.user.update({
            where: { id: order.enterpriseId },
            data: { walletBalance: { decrement: order.agreedPrice } },
          })
          await prisma.transaction.create({
            data: {
              orderId: order.id,
              userId: order.enterpriseId,
              amount: -order.agreedPrice,
              type: 'PAY',
              status: 'SUCCESS',
            },
          })
        }
        break

      case 'SUBMITTED': // 打工人提交成果
        if (order.workerId !== session.userId) return NextResponse.json({ error: '无权操作' }, { status: 403 })
        if (order.status !== 'ACTIVE') return NextResponse.json({ error: '状态错误' }, { status: 400 })
        updates.workerSubmit = JSON.stringify(data.submitData || {})
        break

      case 'COMPLETED': // 企业验收完成
        if (order.enterpriseId !== session.userId) return NextResponse.json({ error: '无权操作' }, { status: 403 })
        if (order.status !== 'SUBMITTED') return NextResponse.json({ error: '状态错误' }, { status: 400 })
        // 释放资金给打工人
        if (order.agreedPrice) {
          await prisma.user.update({
            where: { id: order.workerId },
            data: { walletBalance: { increment: order.agreedPrice } },
          })
          await prisma.transaction.create({
            data: {
              orderId: order.id,
              userId: order.workerId,
              amount: order.agreedPrice,
              type: 'RELEASE',
              status: 'SUCCESS',
            },
          })
          // 更新完成次数
          await prisma.user.update({
            where: { id: order.workerId },
            data: { completedTasks: { increment: 1 } },
          })
        }
        await prisma.task.update({
          where: { id: order.taskId },
          data: { status: 'COMPLETED' },
        })
        break

      case 'CANCELLED':
        if (order.enterpriseId !== session.userId && order.workerId !== session.userId) {
          return NextResponse.json({ error: '无权操作' }, { status: 403 })
        }
        // 如果已付款，退款
        if (order.status === 'ACTIVE' && order.agreedPrice) {
          await prisma.user.update({
            where: { id: order.enterpriseId },
            data: { walletBalance: { increment: order.agreedPrice } },
          })
          await prisma.transaction.create({
            data: {
              orderId: order.id,
              userId: order.enterpriseId,
              amount: order.agreedPrice,
              type: 'REFUND',
              status: 'SUCCESS',
            },
          })
        }
        await prisma.task.update({
          where: { id: order.taskId },
          data: { status: 'OPEN', workerId: null },
        })
        break

      default:
        return NextResponse.json({ error: '无效状态' }, { status: 400 })
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: updates,
    })

    return NextResponse.json({ order: updated })
  } catch (error) {
    console.error('Order update error:', error)
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}
