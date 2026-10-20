import type { Metadata } from 'next'
import CustomerTable from '@/components/CustomerTable'
import Pagination from '@/components/Pagination'
import { requireUser } from '@/lib/auth'
import { describeDbError } from '@/lib/dbError'
import { connectDB } from '@/lib/mongodb'
import { CustomerModel } from '@/models/Customer'

export const metadata: Metadata = { title: '고객 정보 보기' }

const PAGE_SIZE = 10

type Props = { searchParams: Promise<{ page?: string | string[] }> }

export default async function CustomersPage({ searchParams }: Props) {
  const user = await requireUser()
  // 로그인한 사용자가 직접 등록한 고객만 보인다
  const mine = { ownerUserNo: user.userNo }
  const { page } = await searchParams
  const requested = Math.floor(Number(Array.isArray(page) ? page[0] : page)) || 1

  let total: number
  let customers
  let current: number
  try {
    await connectDB()
    total = await CustomerModel.countDocuments(mine)
    // 범위를 벗어난 페이지 번호는 처음/마지막 페이지로 맞춘다
    current = Math.min(Math.max(requested, 1), Math.max(Math.ceil(total / PAGE_SIZE), 1))
    customers = await CustomerModel.find(mine)
      .sort({ customerId: -1 }) // 최근 등록한 고객이 위에 오도록
      .skip((current - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean()
  } catch (err) {
    console.error('고객 목록 조회 실패', err)
    return (
      <section className="list-card">
        <h1>고객 정보 보기</h1>
        <p className="empty">{describeDbError(err).replace('저장', '조회')}</p>
      </section>
    )
  }

  return (
    <section className="list-card">
      <h1>
        고객 정보 보기 <span className="count">총 {total}명</span>
      </h1>
      {customers.length === 0 ? (
        <p className="empty">등록된 고객이 없습니다.</p>
      ) : (
        <>
          <CustomerTable customers={customers} page={current} />
          <Pagination current={current} totalPages={Math.ceil(total / PAGE_SIZE)} />
        </>
      )}
    </section>
  )
}
