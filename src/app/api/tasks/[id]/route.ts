import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET /api/tasks/[id] - 获取任务详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, bio: true, rating: true, completedTasks: true },
        },
        orders: {
          include: {
            worker: {
              select: { id: true, name: true, avatar: true, rating: true, completedTasks: true, bio: true, skills: true },
            },
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 })
    }

    return NextResponse.json({
      ...task,
      skills: JSON.parse(task.skills),
      attachments: JSON.parse(task.attachments),
      orders: task.orders.map(o => ({
        ...o,
        workerSubmit: o.workerSubmit ? JSON.parse(o.workerSubmit) : null,
        worker: {
          ...o.worker,
          skills: JSON.parse(o.worker.skills),
        },
      })),
    })
  } catch (error) {
    console.error('Task detail error:', error)
    return NextResponse.json({ error: '获取任务详情失败' }, { status: 500 })
  }
}

// POST /api/tasks/[id] - 更新任务状态（取消/完成）
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: '请先登录' }, { status: 401 })

    const { action } = await request.json()
    const task = await prisma.task.findUnique({ where: { id: params.id } })
    if (!task) return NextResponse.json({ error: '任务不存在' }, { status: 404 })
    if (task.userId !== session.userId) return NextResponse.json({ error: '无权操作' }, { status: 403 })

    if (action === 'cancel') {
      await prisma.task.update({
        where: { id: params.id },
        data: { status: 'CANCELLED' },
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: '无效操作' }, { status: 400 })
  } catch (error) {
    console.error('Task update error:', error)
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}
