import 'server-only'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { decryptSession, encryptSession, SESSION_COOKIE, type SessionUser } from '@/lib/sessionToken'

export type { SessionUser }

const REMEMBER_SECONDS = 60 * 60 * 24 * 30 // 자동 로그인: 30일
const SESSION_SECONDS = 60 * 60 * 12 // 자동 로그인을 안 고르면 브라우저를 닫을 때까지 (최대 12시간)

export async function createSession(user: SessionUser, remember: boolean) {
  const maxAge = remember ? REMEMBER_SECONDS : SESSION_SECONDS
  ;(await cookies()).set(SESSION_COOKIE, await encryptSession(user, maxAge), {
    httpOnly: true, // 브라우저 스크립트에서 쿠키를 읽을 수 없게 한다
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    // maxAge가 없으면 브라우저를 닫을 때 쿠키가 지워진다
    ...(remember ? { maxAge } : {}),
  })
}

export async function deleteSession() {
  ;(await cookies()).delete(SESSION_COOKIE)
}

// 같은 요청 안에서 여러 번 불러도 한 번만 복호화한다
export const getSession = cache(async () => {
  return decryptSession((await cookies()).get(SESSION_COOKIE)?.value)
})
