import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import OrderForm from '@/components/OrderForm'
import { requireUser } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { OrderModel } from '@/models/Order'

export const metadata: Metadata = { title: '주문서 수정' }

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string | string[] }>
}

export default async function EditOrderPage({ params, searchParams }: Props) {
  const orderId = Number((await params).id)
  if (!Number.isInteger(orderId) || orderId <= 0) notFound()
  const user = await requireUser()

  await connectDB()
  // 다른 사용자가 작성한 주문서는 없는 것처럼 보인다
  const order = await OrderModel.findOne({ orderId, ownerUserNo: user.userNo }).lean()
  if (!order) notFound()

  const { page } = await searchParams
  const returnPage = Math.floor(Number(Array.isArray(page) ? page[0] : page)) || 1

  const c = order.customer
  // 클라이언트 컴포넌트에는 필요한 값만 평범한 객체로 넘긴다 (ObjectId, Date는 넘길 수 없음)
  return (
    <OrderForm
      order={{
        orderId,
        customer: c
          ? { customerId: c.customerId, name: c.name ?? '', businessNumber: c.businessNumber ?? '' }
          : null,
        items: order.items.map((it) => ({
          name: it.name,
          unitPrice: it.unitPrice,
          quantity: it.quantity,
          vatType: it.vatType,
        })),
      }}
      returnPage={returnPage}
    />
  )
}
