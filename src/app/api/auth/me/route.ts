import { unauthorized } from '@/lib/auth'
import { getSession } from '@/lib/session'

// 쿠키는 httpOnly라 브라우저 스크립트가 직접 읽을 수 없으므로, 로그인한 사용자 정보는 여기서 받아 간다
export async function GET() {
  const user = await getSession()
  if (!user) return unauthorized()
  return Response.json({ user })
}
