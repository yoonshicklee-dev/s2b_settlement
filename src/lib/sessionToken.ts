import { createHash } from 'node:crypto'
import { EncryptJWT, jwtDecrypt } from 'jose'

// proxy.ts와 session.ts가 같이 쓰는 토큰 암호화/복호화 (next/headers에 의존하지 않는다)

export const SESSION_COOKIE = 'session'

// 쿠키에 암호화되어 들어가는 사용자 정보 (암호 등 민감한 값은 넣지 않는다)
export type SessionUser = {
  userNo: number
  userId: string
  name: string
  role: string
}

// SESSION_SECRET을 SHA-256으로 32바이트 키로 만든다 (A256GCM 암호화에 필요한 길이)
function getKey() {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error('SESSION_SECRET 환경 변수가 설정되지 않았습니다.')
  }
  return createHash('sha256').update(secret).digest()
}

// 서명만 하는 일반 JWT와 달리 JWE로 암호화하므로 쿠키를 가져가도 내용을 읽을 수 없다
export async function encryptSession(user: SessionUser, maxAgeSeconds: number) {
  return new EncryptJWT({ ...user })
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .encrypt(getKey())
}

export async function decryptSession(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null
  try {
    const { payload } = await jwtDecrypt(token, getKey())
    const { userNo, userId, name, role } = payload
    if (typeof userNo !== 'number' || typeof userId !== 'string') return null
    return { userNo, userId, name: String(name ?? ''), role: String(role ?? '') }
  } catch {
    // 만료되었거나 위조/손상된 토큰
    return null
  }
}
