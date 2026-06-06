import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET /api/wallet - 获取钱包信息和交易记录
export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: '请先登录' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { walletBalance: true },
    })

    const transactions = await prisma.transaction.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        order: { select: { task: { select: { title: true } } } },
      },
    })

    return NextResponse.json({
      balance: user?.walletBalance || 0,
      transactions: transactions.map(t => ({
        id: t.id,
        amount: t.amount,
        type: t.type,
        status: t.status,
        taskTitle: t.order?.task?.title || null,
        createdAt: t.createdAt,
      })),
    })
  } catch (error) {
    console.error('Wallet fetch error:', error)
    return NextResponse.json({ error: '获取钱包信息失败' }, { status: 500 })
  }
}

// POST /api/wallet - 充值/提现
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: '请先登录' }, { status: 401 })

    const { action, amount } = await request.json()
    const numAmount = parseFloat(amount)

    if (!amount || numAmount <= 0) {
      return NextResponse.json({ error: '请输入有效金额' }, { status: 400 })
    }

    if (action === 'deposit') {
      // 充值（模拟）
      await prisma.user.update({
        where: { id: session.userId },
        data: { walletBalance: { increment: numAmount } },
      })
      await prisma.transaction.create({
        data: {
          userId: session.userId,
          amount: numAmount,
          type: 'DEPOSIT',
          status: 'SUCCESS',
        },
      })
      return NextResponse.json({ success: true, amount: numAmount, type: 'deposit' })
    }

    if (action === 'withdraw') {
      const user = await prisma.user.findUnique({ where: { id: session.userId } })
      if (!user || user.walletBalance < numAmount) {
        return NextResponse.json({ error: '余额不足' }, { status: 400 })
      }
      await prisma.user.update({
        where: { id: session.userId },
        data: { walletBalance: { decrement: numAmount } },
      })
      await prisma.transaction.create({
        data: {
          userId: session.userId,
          amount: -numAmount,
          type: 'WITHDRAW',
          status: 'SUCCESS',
        },
      })
      return NextResponse.json({ success: true, amount: numAmount, type: 'withdraw' })
    }

    return NextResponse.json({ error: '无效操作' }, { status: 400 })
  } catch (error) {
    console.error('Wallet action error:', error)
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}
