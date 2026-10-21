import { unauthorized } from '@/lib/auth'
import { describeDbError } from '@/lib/dbError'
import { connectDB } from '@/lib/mongodb'
import { parseOrderInput } from '@/lib/orderInput'
import { getSession } from '@/lib/session'
import { CustomerModel } from '@/models/Customer'
import { OrderModel } from '@/models/Order'

export async function POST(request: Request) {
  const user = await getSession()
  if (!user) return unauthorized()

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const input = parseOrderInput(body)
  if ('error' in input) {
    return Response.json({ error: input.error }, { status: 400 })
  }
  const { customerId, ...order } = input.data

  try {
    await connectDB()
    // 내가 등록한 고객만 고를 수 있다. 고객 이름과 사업자 등록 번호는 DB 값을 그대로 쓴다
    const customer = await CustomerModel.findOne({ customerId, ownerUserNo: user.userNo }).lean()
    if (!customer) {
      return Response.json({ error: '선택한 고객 정보를 찾을 수 없습니다.' }, { status: 400 })
    }
    const saved = await OrderModel.create({
      ...order,
      ownerUserNo: user.userNo,
      customer: {
        customerId,
        name: customer.name ?? '',
        businessNumber: customer.businessNumber ?? '',
      },
    })
    return Response.json({ ok: true, orderId: saved.orderId }, { status: 201 })
  } catch (err) {
    console.error('주문서 저장 실패', err)
    return Response.json({ error: describeDbError(err) }, { status: 500 })
  }
}
