import { unauthorized } from '@/lib/auth'
import { parseCustomerInput } from '@/lib/customerInput'
import { describeDbError } from '@/lib/dbError'
import { connectDB } from '@/lib/mongodb'
import { getSession } from '@/lib/session'
import { CustomerModel } from '@/models/Customer'

const PICKER_LIMIT = 1000

// 주문서의 고객 선택 창에서 쓰는 내 고객 목록 (이름순)
export async function GET() {
  const user = await getSession()
  if (!user) return unauthorized()

  try {
    await connectDB()
    const customers = await CustomerModel.find(
      { ownerUserNo: user.userNo },
      { _id: 0, customerId: 1, name: 1, businessNumber: 1, managerName: 1, phone: 1 },
    )
      .sort({ name: 1 })
      .limit(PICKER_LIMIT)
      .lean()
    return Response.json({ customers })
  } catch (err) {
    console.error('고객 목록 조회 실패', err)
    return Response.json({ error: describeDbError(err).replace('저장', '조회') }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const user = await getSession()
  if (!user) return unauthorized()

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const input = parseCustomerInput(body)
  if ('error' in input) {
    return Response.json({ error: input.error }, { status: 400 })
  }

  try {
    await connectDB()
    // 고객 번호(customerId)와 등록한 사용자는 요청 값과 상관없이 서버에서 정한다
    const customer = await CustomerModel.create({ ...input.data, ownerUserNo: user.userNo })
    return Response.json({ ok: true, customerId: customer.customerId }, { status: 201 })
  } catch (err) {
    console.error('고객 저장 실패', err)
    return Response.json({ error: describeDbError(err) }, { status: 500 })
  }
}
