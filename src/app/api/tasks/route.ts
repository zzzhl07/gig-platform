import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET /api/tasks - 获取任务列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const status = searchParams.get('status') || 'OPEN'
    const sort = searchParams.get('sort') || 'latest'
    const workType = searchParams.get('workType')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = { status }

    if (category) where.category = category
    if (workType === 'remote') where.isRemote = true
    if (workType === 'onsite') where.isRemote = false
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const orderBy: any =
      sort === 'budget_high' ? { budgetMax: 'desc' } :
      sort === 'budget_low' ? { budgetMin: 'asc' } :
      { createdAt: 'desc' }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: { id: true, name: true, avatar: true, rating: true, completedTasks: true },
          },
          _count: { select: { orders: true } },
        },
      }),
      prisma.task.count({ where }),
    ])

    return NextResponse.json({
      tasks: tasks.map(t => ({
        ...t,
        skills: JSON.parse(t.skills),
        attachments: JSON.parse(t.attachments),
        applicantCount: t._count.orders,
        _count: undefined,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Tasks fetch error:', error)
    return NextResponse.json({ error: '获取任务列表失败' }, { status: 500 })
  }
}

// POST /api/tasks - 发布任务
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }
    if (session.role !== 'ENTERPRISE') {
      return NextResponse.json({ error: '只有企业账号可以发布任务' }, { status: 403 })
    }

    const { title, description, budgetMin, budgetMax, deadline, category, skills, isRemote, location, locationDetail, isConfidential, hideBidderInfo } = await request.json()

    if (!title || !description) {
      return NextResponse.json({ error: '请填写任务标题和描述' }, { status: 400 })
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        budgetMin: budgetMin ? parseFloat(budgetMin) : null,
        budgetMax: budgetMax ? parseFloat(budgetMax) : null,
        deadline: deadline ? new Date(deadline) : null,
        category: category || null,
        skills: JSON.stringify(skills || []),
        userId: session.userId,
        isRemote: isRemote !== false,
        location: location || null,
        locationDetail: locationDetail || null,
        isConfidential: isConfidential || false,
        hideBidderInfo: hideBidderInfo !== false,
      },
    })

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Task create error:', error)
    return NextResponse.json({ error: '发布任务失败' }, { status: 500 })
  }
}
