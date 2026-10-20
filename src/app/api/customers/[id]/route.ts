import { parseCustomerId, parseCustomerInput } from '@/lib/customerInput'
import { describeDbError } from '@/lib/dbError'
import { connectDB } from '@/lib/mongodb'
import { CustomerModel } from '@/models/Customer'

type Context = { params: Promise<{ id: string }> }

const NOT_FOUND = () => Response.json({ error: '고객 정보를 찾을 수 없습니다.' }, { status: 404 })

export async function PUT(request: Request, { params }: Context) {
  const customerId = parseCustomerId((await params).id)
  if (customerId === null) return NOT_FOUND()

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
    // 고객 번호는 바꾸지 않고 나머지 항목만 고친다
    const customer = await CustomerModel.findOneAndUpdate({ customerId }, input.data, {
      returnDocument: 'after',
      runValidators: true,
    })
    if (!customer) return NOT_FOUND()
    return Response.json({ ok: true })
  } catch (err) {
    console.error('고객 수정 실패', err)
    return Response.json({ error: describeDbError(err) }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const customerId = parseCustomerId((await params).id)
  if (customerId === null) return NOT_FOUND()

  try {
    await connectDB()
    const { deletedCount } = await CustomerModel.deleteOne({ customerId })
    if (deletedCount === 0) return NOT_FOUND()
    return Response.json({ ok: true })
  } catch (err) {
    console.error('고객 삭제 실패', err)
    return Response.json({ error: describeDbError(err).replace('저장', '삭제') }, { status: 500 })
  }
}
