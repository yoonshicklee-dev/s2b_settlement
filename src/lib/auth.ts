import 'server-only'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'

// proxy.ts에서 한 번 막지만, 데이터를 읽고 쓰는 곳에서도 다시 확인한다

// 화면(page/layout)용: 로그인하지 않았으면 로그인 화면으로 보낸다
export async function requireUser() {
  const user = await getSession()
  if (!user) redirect('/login')
  return user
}

export function unauthorized() {
  return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 })
}
