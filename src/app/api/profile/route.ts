import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET /api/profile - 获取当前用户资料
export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: '请先登录' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true, name: true, email: true, role: true,
        phone: true, wechat: true, avatar: true, bio: true,
        skills: true, rating: true, completedTasks: true,
        walletBalance: true, createdAt: true,
      },
    })
    if (!user) return NextResponse.json({ error: '用户不存在' }, { status: 404 })

    return NextResponse.json({ ...user, skills: JSON.parse(user.skills) })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: '获取资料失败' }, { status: 500 })
  }
}

// PATCH /api/profile - 更新用户资料
export async function PATCH(request: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: '请先登录' }, { status: 401 })

    const { name, phone, wechat, bio, skills, avatar } = await request.json()

    const data: any = {}
    if (name !== undefined) data.name = name
    if (phone !== undefined) data.phone = phone
    if (wechat !== undefined) data.wechat = wechat
    if (bio !== undefined) data.bio = bio
    if (avatar !== undefined) data.avatar = avatar
    if (skills !== undefined) data.skills = JSON.stringify(skills)

    await prisma.user.update({
      where: { id: session.userId },
      data,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: '更新失败' }, { status: 500 })
  }
}
