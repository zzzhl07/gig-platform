import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET /api/messages - 获取消息列表（按联系人分组）
export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: '请先登录' }, { status: 401 })

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.userId },
          { receiverId: session.userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
        order: { select: { id: true, task: { select: { title: true } } } },
      },
    })

    // 按联系人分组
    const conversations = new Map()
    for (const msg of messages) {
      const otherId = msg.senderId === session.userId ? msg.receiverId : msg.senderId
      const other = msg.senderId === session.userId ? msg.receiver : msg.sender
      const key = msg.orderId ? `${otherId}-${msg.orderId}` : otherId

      if (!conversations.has(key)) {
        conversations.set(key, {
          otherUserId: otherId,
          otherName: other.name,
          otherAvatar: other.avatar,
          orderId: msg.orderId,
          taskTitle: msg.order?.task?.title || null,
          lastMessage: msg.content,
          lastTime: msg.createdAt,
          unread: !msg.read && msg.receiverId === session.userId ? 1 : 0,
        })
      } else {
        const existing = conversations.get(key)
        if (!msg.read && msg.receiverId === session.userId) {
          existing.unread += 1
        }
      }
    }

    const unreadTotal = messages.filter(m => !m.read && m.receiverId === session.userId).length

    return NextResponse.json({
      conversations: Array.from(conversations.values()).sort((a, b) =>
        new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime()
      ),
      unreadTotal,
    })
  } catch (error) {
    console.error('Messages fetch error:', error)
    return NextResponse.json({ error: '获取消息失败' }, { status: 500 })
  }
}

// POST /api/messages - 发送消息
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: '请先登录' }, { status: 401 })

    const { receiverId, orderId, content } = await request.json()
    if (!receiverId || !content) {
      return NextResponse.json({ error: '请填写完整信息' }, { status: 400 })
    }

    const message = await prisma.message.create({
      data: {
        senderId: session.userId,
        receiverId,
        orderId: orderId || null,
        content,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Message send error:', error)
    return NextResponse.json({ error: '发送失败' }, { status: 500 })
  }
}
