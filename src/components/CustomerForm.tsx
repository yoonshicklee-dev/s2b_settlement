'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import type { CustomerInput } from '@/lib/customerInput'

type Props = {
  // 값이 있으면 수정 화면, 없으면 등록 화면
  customer?: CustomerInput & { customerId: number }
  // 수정 후 돌아갈 목록 페이지 번호
  returnPage?: number
}

export default function CustomerForm({ customer, returnPage = 1 }: Props) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const isEdit = customer !== undefined

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setSubmitting(true)
    try {
      const res = await fetch(isEdit ? `/api/customers/${customer.customerId}` : '/api/customers', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert(data.error || (isEdit ? '고객 정보 수정에 실패했습니다.' : '고객 등록에 실패했습니다.'))
      } else if (isEdit) {
        alert('고객 정보가 수정되었습니다.')
        router.push(`/customers?page=${returnPage}`)
      } else {
        alert(`고객 정보가 등록되었습니다.\n고객 번호: ${data.customerId}`)
        form.reset()
      }
    } catch {
      alert('서버에 연결할 수 없습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h1>{isEdit ? `고객 정보 수정 (${customer.customerId}번)` : '고객 정보 추가'}</h1>

      <label htmlFor="name">고객 이름</label>
      <input
        id="name"
        name="name"
        type="text"
        autoComplete="organization"
        defaultValue={customer?.name}
        required
      />

      <label htmlFor="phone">전화번호</label>
      <input
        id="phone"
        name="phone"
        type="tel"
        autoComplete="tel"
        placeholder="02-123-4567"
        defaultValue={customer?.phone}
      />

      <label htmlFor="mobilePhone">휴대폰 전화 번호</label>
      <input
        id="mobilePhone"
        name="mobilePhone"
        type="tel"
        autoComplete="tel"
        placeholder="010-1234-5678"
        defaultValue={customer?.mobilePhone}
      />

      <label htmlFor="fax">팩스 번호</label>
      <input
        id="fax"
        name="fax"
        type="tel"
        autoComplete="off"
        placeholder="02-123-4568"
        defaultValue={customer?.fax}
      />

      <label htmlFor="managerName">담당자 이름</label>
      <input
        id="managerName"
        name="managerName"
        type="text"
        autoComplete="name"
        defaultValue={customer?.managerName}
      />

      <label htmlFor="businessNumber">사업자 등록 번호</label>
      <input
        id="businessNumber"
        name="businessNumber"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="123-45-67890"
        defaultValue={customer?.businessNumber}
      />

      <label htmlFor="address">주소</label>
      <input
        id="address"
        name="address"
        type="text"
        autoComplete="street-address"
        placeholder="서울특별시 중구 세종대로 110"
        defaultValue={customer?.address}
      />

      <button type="submit" disabled={submitting}>
        {isEdit ? '수정하기' : '등록하기'}
      </button>
      {isEdit && (
        <button type="button" className="secondary" onClick={() => router.push(`/customers?page=${returnPage}`)}>
          취소
        </button>
      )}
    </form>
  )
}
