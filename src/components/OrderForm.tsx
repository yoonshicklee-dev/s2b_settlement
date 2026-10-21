'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState, type FormEvent } from 'react'
import CustomerPicker, { type PickedCustomer } from '@/components/CustomerPicker'
import { calcItem, formatWon, sumAmounts, VAT_TYPE_LABELS, VAT_TYPES, type VatType } from '@/lib/orderCalc'

type ItemRow = {
  key: number // 목록에서 행을 구분하기 위한 값 (저장하지 않음)
  name: string
  unitPrice: string
  quantity: string
  vatType: VatType
}

const emptyItem = (key: number): ItemRow => ({ key, name: '', unitPrice: '', quantity: '1', vatType: 'exclusive' })

// 입력 중인 값은 문자열이므로, 계산할 때만 0 이상의 정수로 바꾼다
const toInt = (v: string) => {
  const n = Math.floor(Number(v))
  return Number.isFinite(n) && n > 0 ? n : 0
}

type Props = {
  // 값이 있으면 수정 화면, 없으면 새 주문서 작성 화면
  order?: {
    orderId: number
    customer: PickedCustomer | null
    items: { name: string; unitPrice: number; quantity: number; vatType: VatType }[]
  }
  // 수정 후 돌아갈 목록 페이지 번호
  returnPage?: number
}

export default function OrderForm({ order, returnPage = 1 }: Props) {
  const router = useRouter()
  const isEdit = order !== undefined
  const [customer, setCustomer] = useState<PickedCustomer | null>(order?.customer ?? null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [items, setItems] = useState<ItemRow[]>(() =>
    order
      ? order.items.map((it, i) => ({
          key: i,
          name: it.name,
          unitPrice: String(it.unitPrice),
          quantity: String(it.quantity),
          vatType: it.vatType,
        }))
      : [emptyItem(0)],
  )
  const [submitting, setSubmitting] = useState(false)
  // 서버와 브라우저가 같은 첫 화면을 그리도록 행 번호는 0부터 이 컴포넌트 안에서 센다
  const nextKey = useRef(items.length)
  const newItem = () => emptyItem(nextKey.current++)
  const backToList = () => router.push(`/orders?page=${returnPage}`)

  const amounts = items.map((it) => calcItem(toInt(it.unitPrice), toInt(it.quantity), it.vatType))
  const totals = sumAmounts(amounts)

  const closePicker = useCallback(() => setPickerOpen(false), [])

  function updateItem(key: number, patch: Partial<ItemRow>) {
    setItems((list) => list.map((it) => (it.key === key ? { ...it, ...patch } : it)))
  }

  function removeItem(key: number) {
    setItems((list) => (list.length === 1 ? list : list.filter((it) => it.key !== key)))
  }

  function reset() {
    setCustomer(null)
    setItems([newItem()])
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!customer) {
      alert('주문한 고객을 선택해 주세요.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(isEdit ? `/api/orders/${order.orderId}` : '/api/orders', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.customerId,
          items: items.map((it) => ({
            name: it.name,
            unitPrice: Number(it.unitPrice),
            quantity: Number(it.quantity),
            vatType: it.vatType,
          })),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && isEdit) {
        alert('주문서가 수정되었습니다.')
        backToList()
      } else if (res.ok) {
        alert(`주문서가 저장되었습니다.\n주문서 번호: ${data.orderId}`)
        reset()
      } else {
        alert(data.error || '주문서 저장에 실패했습니다.')
      }
    } catch {
      alert('서버에 연결할 수 없습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="order-card" onSubmit={handleSubmit}>
      <h1>{isEdit ? `주문서 수정 (${order.orderId}번)` : '주문서 입력'}</h1>

      {/* 주문한 고객: 고객 이름과 사업자 등록 번호만 보여 준다 */}
      <section className="order-section">
        <div className="section-title">
          <h2>주문 고객</h2>
          <button type="button" className="btn-outline" onClick={() => setPickerOpen(true)}>
            {customer ? '고객 변경' : '고객 선택'}
          </button>
        </div>
        {customer ? (
          <dl className="customer-summary">
            <div>
              <dt>고객 이름</dt>
              <dd>{customer.name}</dd>
            </div>
            <div>
              <dt>사업자 등록 번호</dt>
              <dd>{customer.businessNumber || '-'}</dd>
            </div>
          </dl>
        ) : (
          <p className="placeholder">고객 선택 버튼을 눌러 주문한 고객을 골라 주세요.</p>
        )}
      </section>

      <section className="order-section">
        <div className="section-title">
          <h2>상품</h2>
          <button type="button" className="btn-outline" onClick={() => setItems((list) => [...list, newItem()])}>
            + 상품 추가
          </button>
        </div>

        <ol className="item-list">
          {items.map((it, i) => (
            <li key={it.key} className="item-row">
              <div className="item-head">
                <span className="item-no">{i + 1}</span>
                {items.length > 1 && (
                  <button type="button" className="btn-text danger" onClick={() => removeItem(it.key)}>
                    삭제
                  </button>
                )}
              </div>

              <div className="item-fields">
                <label className="field field-name">
                  <span>상품명</span>
                  <input
                    type="text"
                    value={it.name}
                    onChange={(e) => updateItem(it.key, { name: e.target.value })}
                    required
                  />
                </label>
                <label className="field">
                  <span>단가 (원)</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={it.unitPrice}
                    onChange={(e) => updateItem(it.key, { unitPrice: e.target.value })}
                    required
                  />
                </label>
                <label className="field">
                  <span>수량</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    value={it.quantity}
                    onChange={(e) => updateItem(it.key, { quantity: e.target.value })}
                    required
                  />
                </label>
                <fieldset className="field vat-toggle">
                  <legend>부가세</legend>
                  {VAT_TYPES.map((type) => (
                    <label key={type}>
                      <input
                        type="radio"
                        name={`vat-${it.key}`}
                        checked={it.vatType === type}
                        onChange={() => updateItem(it.key, { vatType: type })}
                      />
                      {VAT_TYPE_LABELS[type]}
                    </label>
                  ))}
                </fieldset>
              </div>

              <dl className="item-amounts">
                <div>
                  <dt>상품가액</dt>
                  <dd>{formatWon(amounts[i].supply)}</dd>
                </div>
                <div>
                  <dt>부가세</dt>
                  <dd>{formatWon(amounts[i].vat)}</dd>
                </div>
                <div className="sum">
                  <dt>합산 금액</dt>
                  <dd>{formatWon(amounts[i].total)}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>
      </section>

      {/* 전체 상품의 총액 */}
      <section className="order-totals" aria-label="총액">
        <div>
          <span>상품가액 총액</span>
          <strong>{formatWon(totals.supply)}</strong>
        </div>
        <div>
          <span>부가세 총액</span>
          <strong>{formatWon(totals.vat)}</strong>
        </div>
        <div className="grand">
          <span>합산 금액 총액</span>
          <strong>{formatWon(totals.total)}</strong>
        </div>
      </section>

      <button type="submit" className="btn-primary" disabled={submitting}>
        {isEdit ? '수정 저장' : '주문서 저장'}
      </button>
      {isEdit && (
        <button type="button" className="btn-secondary" onClick={backToList}>
          취소
        </button>
      )}

      {pickerOpen && (
        <CustomerPicker
          onSelect={(c) => {
            setCustomer(c)
            setPickerOpen(false)
          }}
          onClose={closePicker}
        />
      )}
    </form>
  )
}
