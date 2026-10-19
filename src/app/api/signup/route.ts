import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import { UserModel } from '@/models/User'

const PHONE_PATTERN = /^0\d{1,2}-?\d{3,4}-?\d{4}$/

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
  if (password.length < 8) {
    return Response.json({ error: '암호는 8자 이상이어야 합니다.' }, { status: 400 })
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

// 로그를 보지 않아도 원인을 알 수 있도록 오류 종류만 알려 준다 (상세 내용은 노출하지 않음)
function describeDbError(err: unknown) {
  const e = err as { name?: string; code?: number; message?: string }
  if (e.message?.includes('MONGODB_URI')) {
    return '저장 중 오류가 발생했습니다. (서버에 DB 주소가 설정되지 않음)'
  }
  if (e.code === 18 || e.code === 8000 || /auth/i.test(e.message ?? '')) {
    return '저장 중 오류가 발생했습니다. (DB 인증 실패)'
  }
  if (e.name === 'MongooseServerSelectionError' || e.name === 'MongoServerSelectionError') {
    return '저장 중 오류가 발생했습니다. (DB 서버에 연결할 수 없음)'
  }
  return '저장 중 오류가 발생했습니다.'
}
