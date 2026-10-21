import { unauthorized } from '@/lib/auth'
import { describeDbError } from '@/lib/dbError'
import { connectDB } from '@/lib/mongodb'
import { parseOrderInput } from '@/lib/orderInput'
import { getSession } from '@/lib/session'
import { CustomerModel } from '@/models/Customer'
import { OrderModel } from '@/models/Order'

type Context = { params: Promise<{ id: string }> }

// 없는 주문서와 다른 사용자의 주문서를 구분하지 않고 똑같이 알려 준다
const NOT_FOUND = () => Response.json({ error: '주문서를 찾을 수 없습니다.' }, { status: 404 })

function parseOrderId(id: string) {
  const n = Number(id)
  return Number.isInteger(n) && n > 0 ? n : null
}

export async function PUT(request: Request, { params }: Context) {
  const user = await getSession()
  if (!user) return unauthorized()
  const orderId = parseOrderId((await params).id)
  if (orderId === null) return NOT_FOUND()

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
    const mine = { orderId, ownerUserNo: user.userNo }
    const existing = await OrderModel.findOne(mine, { customer: 1 }).lean()
    if (!existing) return NOT_FOUND()

    // 고객을 그대로 두면 작성 당시 고객 정보를 유지하고 (그 사이 고객이 삭제되었어도 수정 가능),
    // 다른 고객으로 바꾸면 내 고객 중에서 새로 찾아 복사한다
    const prev = existing.customer
    let customer = prev
      ? { customerId: prev.customerId, name: prev.name ?? '', businessNumber: prev.businessNumber ?? '' }
      : null
    if (!customer || customer.customerId !== customerId) {
      const found = await CustomerModel.findOne({ customerId, ownerUserNo: user.userNo }).lean()
      if (!found) {
        return Response.json({ error: '선택한 고객 정보를 찾을 수 없습니다.' }, { status: 400 })
      }
      customer = { customerId, name: found.name ?? '', businessNumber: found.businessNumber ?? '' }
    }

    const updated = await OrderModel.findOneAndUpdate(
      mine,
      { ...order, customer },
      { returnDocument: 'after', runValidators: true },
    )
    if (!updated) return NOT_FOUND()
    return Response.json({ ok: true })
  } catch (err) {
    console.error('주문서 수정 실패', err)
    return Response.json({ error: describeDbError(err) }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const user = await getSession()
  if (!user) return unauthorized()
  const orderId = parseOrderId((await params).id)
  if (orderId === null) return NOT_FOUND()

  try {
    await connectDB()
    const { deletedCount } = await OrderModel.deleteOne({ orderId, ownerUserNo: user.userNo })
    if (deletedCount === 0) return NOT_FOUND()
    return Response.json({ ok: true })
  } catch (err) {
    console.error('주문서 삭제 실패', err)
    return Response.json({ error: describeDbError(err).replace('저장', '삭제') }, { status: 500 })
  }
}
