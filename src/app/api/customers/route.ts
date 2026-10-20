import { parseCustomerInput } from '@/lib/customerInput'
import { describeDbError } from '@/lib/dbError'
import { connectDB } from '@/lib/mongodb'
import { CustomerModel } from '@/models/Customer'

export async function POST(request: Request) {
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
    // 고객 번호(customerId)는 요청 값과 상관없이 서버에서 자동으로 매긴다
    const customer = await CustomerModel.create(input.data)
    return Response.json({ ok: true, customerId: customer.customerId }, { status: 201 })
  } catch (err) {
    console.error('고객 저장 실패', err)
    return Response.json({ error: describeDbError(err) }, { status: 500 })
  }
}
