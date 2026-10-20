import type { Metadata } from 'next'
import CustomerForm from '@/components/CustomerForm'

export const metadata: Metadata = { title: '고객 정보 추가' }

export default function NewCustomerPage() {
  return <CustomerForm />
}
