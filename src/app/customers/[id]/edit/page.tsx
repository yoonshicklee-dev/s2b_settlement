import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CustomerForm from '@/components/CustomerForm'
import { CUSTOMER_FIELDS, parseCustomerId, type CustomerInput } from '@/lib/customerInput'
import { connectDB } from '@/lib/mongodb'
import { CustomerModel } from '@/models/Customer'

export const metadata: Metadata = { title: '고객 정보 수정' }

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string | string[] }>
}

export default async function EditCustomerPage({ params, searchParams }: Props) {
  const customerId = parseCustomerId((await params).id)
  if (customerId === null) notFound()

  await connectDB()
  const customer = await CustomerModel.findOne({ customerId }).lean()
  if (!customer) notFound()

  // 클라이언트 컴포넌트에는 문자열 항목만 넘긴다 (ObjectId, Date는 넘길 수 없음)
  const values = Object.fromEntries(
    CUSTOMER_FIELDS.map((key) => [key, customer[key] ?? '']),
  ) as CustomerInput

  const { page } = await searchParams
  const returnPage = Math.floor(Number(Array.isArray(page) ? page[0] : page)) || 1

  return <CustomerForm customer={{ ...values, customerId }} returnPage={returnPage} />
}
