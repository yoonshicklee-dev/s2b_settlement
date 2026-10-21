'use client'

import { useEffect, useState } from 'react'

export type PickedCustomer = {
  customerId: number
  name: string
  businessNumber: string
}

type Row = PickedCustomer & { managerName?: string; phone?: string }

type Props = {
  onSelect: (customer: PickedCustomer) => void
  onClose: () => void
}

// 내가 등록한 고객 중에서 주문한 고객을 고르는 창
export default function CustomerPicker({ onSelect, onClose }: Props) {
  const [rows, setRows] = useState<Row[] | null>(null)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetch('/api/customers')
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || '고객 목록을 불러오지 못했습니다.')
        setRows(data.customers)
      })
      .catch((err: Error) => setError(err.message))
  }, [])

  // Esc 키로 닫는다
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const q = query.trim().toLowerCase()
  const filtered = (rows ?? []).filter(
    (r) =>
      !q ||
      (r.name ?? '').toLowerCase().includes(q) ||
      (r.businessNumber ?? '').includes(q) ||
      (r.managerName ?? '').toLowerCase().includes(q),
  )

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="picker-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="picker-title">고객 선택</h2>
          <button type="button" className="modal-close" aria-label="닫기" onClick={onClose}>
            ×
          </button>
        </div>

        <input
          className="modal-search"
          type="search"
          placeholder="고객 이름, 사업자 등록 번호, 담당자로 찾기"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          // 이 창은 주문서 form 안에 있으므로 Enter로 주문서가 저장되지 않게 막는다
          onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
          autoFocus
        />

        <div className="modal-body">
          {error ? (
            <p className="modal-empty">{error}</p>
          ) : rows === null ? (
            <p className="modal-empty">불러오는 중...</p>
          ) : filtered.length === 0 ? (
            <p className="modal-empty">
              {rows.length === 0 ? '등록된 고객이 없습니다. 먼저 고객 정보를 추가해 주세요.' : '찾는 고객이 없습니다.'}
            </p>
          ) : (
            <ul className="picker-list">
              {filtered.map((r) => (
                <li key={r.customerId}>
                  <button
                    type="button"
                    onClick={() =>
                      onSelect({
                        customerId: r.customerId,
                        name: r.name ?? '',
                        businessNumber: r.businessNumber ?? '',
                      })
                    }
                  >
                    <strong>{r.name}</strong>
                    <span>{r.businessNumber || '사업자 등록 번호 없음'}</span>
                    {(r.managerName || r.phone) && (
                      <small>{[r.managerName, r.phone].filter(Boolean).join(' · ')}</small>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
