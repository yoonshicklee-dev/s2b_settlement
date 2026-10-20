import bcrypt from 'bcryptjs'
import { describeDbError } from '@/lib/dbError'
import { connectDB } from '@/lib/mongodb'
import { PASSWORD_MIN_LENGTH, PHONE_PATTERN } from '@/lib/validation'
import { UserModel } from '@/models/User'

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const userId = String(body.userId ?? '').trim()
  const password = String(body.password ?? '')
  const name = String(body.name ?? '').trim()
  const phone = String(body.phone ?? '').trim()

  if (!userId || !password || !name || !phone) {
    return Response.json({ error: '모든 항목을 입력해 주세요.' }, { status: 400 })
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return Response.json(
      { error: `암호는 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.` },
      { status: 400 },
    )
  }
  if (!PHONE_PATTERN.test(phone)) {
    return Response.json({ error: '전화번호 형식이 올바르지 않습니다.' }, { status: 400 })
  }

  try {
    await connectDB()
    // 등급과 승인 여부는 요청 값과 상관없이 서버에서 정한다
    await UserModel.create({
      userId,
      passwordHash: await bcrypt.hash(password, 12),
      name,
      phone,
      role: 'user',
      approval: '미승인',
    })
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      return Response.json({ error: '이미 사용 중인 사용자 ID입니다.' }, { status: 409 })
    }
    console.error('회원 가입 저장 실패', err)
    return Response.json({ error: describeDbError(err) }, { status: 500 })
  }

  return Response.json({ ok: true }, { status: 201 })
}
