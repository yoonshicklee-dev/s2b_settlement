import bcrypt from 'bcryptjs'
import { describeDbError } from '@/lib/dbError'
import { connectDB } from '@/lib/mongodb'
import { createSession } from '@/lib/session'
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
  const remember = body.remember === true || body.remember === 'on'
  if (!userId || !password) {
    return Response.json({ error: '사용자 ID와 암호를 입력해 주세요.' }, { status: 400 })
  }

  let user
  try {
    await connectDB()
    user = await UserModel.findOne({ userId }).lean()
  } catch (err) {
    console.error('로그인 조회 실패', err)
    return Response.json({ error: describeDbError(err).replace('저장', '로그인') }, { status: 500 })
  }

  // ID가 없는지 암호가 틀렸는지 구분해 알려 주지 않는다 (ID 추측 방지)
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return Response.json({ error: '사용자 ID 또는 암호가 올바르지 않습니다.' }, { status: 401 })
  }
  if (user.approval !== '승인') {
    return Response.json({ error: '관리자 승인 후 로그인할 수 있습니다.' }, { status: 403 })
  }

  await createSession(
    { userNo: user.userNo, userId: user.userId, name: user.name, role: user.role },
    remember,
  )
  return Response.json({ ok: true })
}
