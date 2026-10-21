'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

// 목록의 한 행에 붙는 [수정] [삭제] 버튼 (고객, 주문서 목록에서 같이 쓴다)
type Props = {
  editHref: string
  deleteUrl: string
  // 삭제 확인 창에 보일 대상 이름 (예: "'고객1' 고객 정보")
  target: string
}

export default function RowActions({ editHref, deleteUrl, target }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`${target}를 삭제할까요?\n삭제하면 되돌릴 수 없습니다.`)) return
    setDeleting(true)
    try {
      const res = await fetch(deleteUrl, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        // 목록을 서버에서 다시 받아 온다 (마지막 한 건을 지우면 앞 페이지로 맞춰짐)
        router.refresh()
      } else {
        alert(data.error || '삭제에 실패했습니다.')
      }
    } catch {
      alert('서버에 연결할 수 없습니다.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <span className="row-actions">
      <Link href={editHref}>수정</Link>
      <button type="button" className="danger" onClick={handleDelete} disabled={deleting}>
        삭제
      </button>
    </span>
  )
}
