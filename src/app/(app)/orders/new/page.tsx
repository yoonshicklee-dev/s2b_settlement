import type { Metadata } from 'next'
import OrderForm from '@/components/OrderForm'

export const metadata: Metadata = { title: '주문서 입력' }

export default function NewOrderPage() {
  return <OrderForm />
}
