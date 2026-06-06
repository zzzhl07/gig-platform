import { getSession } from './session'

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function requireRole(role: string) {
  const session = await requireAuth()
  if (session.role !== role) {
    throw new Error('Forbidden')
  }
  return session
}
