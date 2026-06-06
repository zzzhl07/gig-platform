import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { createSession, getSessionCookieHeader } from '@/lib/session'

export async function POST(request: Request) {
  try {
    const { email, password, name, role } = await request.json()

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: '请填写所有必填字段' }, { status: 400 })
    }

    if (!['ENTERPRISE', 'WORKER'].includes(role)) {
      return NextResponse.json({ error: '无效的角色类型' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: '密码至少6位' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: '该邮箱已被注册' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: { email, passwordHash, name, role },
    })

    const token = await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    })

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
    response.headers.set('Set-Cookie', getSessionCookieHeader(token))
    return response
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: '注册失败，请重试' }, { status: 500 })
  }
}
