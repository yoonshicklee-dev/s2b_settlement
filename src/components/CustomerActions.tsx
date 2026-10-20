'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Props = { customerId: number; name: string; page: number }

export default function CustomerActions({ customerId, name, page }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`'${name}' 고객 정보를 삭제할까요?\n삭제하면 되돌릴 수 없습니다.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/customers/${customerId}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        // 목록을 서버에서 다시 받아 온다 (마지막 한 건을 지우면 앞 페이지로 맞춰짐)
        router.refresh()
      } else {
        alert(data.error || '고객 정보 삭제에 실패했습니다.')
      }
    } catch {
      alert('서버에 연결할 수 없습니다.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <span className="row-actions">
      <Link href={`/customers/${customerId}/edit?page=${page}`}>수정</Link>
      <button type="button" className="danger" onClick={handleDelete} disabled={deleting}>
        삭제
      </button>
    </span>
  )
}
