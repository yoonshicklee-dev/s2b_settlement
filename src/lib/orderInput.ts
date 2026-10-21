import { calcItem, sumAmounts, VAT_TYPES, type VatType } from '@/lib/orderCalc'

const MAX_ITEMS = 100
const MAX_AMOUNT = 1_000_000_000_000 // 1조 원: 이보다 큰 금액은 입력 실수로 본다

export type OrderItemInput = {
  name: string
  unitPrice: number
  quantity: number
  vatType: VatType
}

// 요청 값을 검사하고, 금액은 화면에서 보낸 값 대신 서버에서 다시 계산한다
export function parseOrderInput(body: Record<string, unknown>) {
  const customerId = Number(body.customerId)
  if (!Number.isInteger(customerId) || customerId <= 0) {
    return { error: '주문한 고객을 선택해 주세요.' } as const
  }

  const rawItems = Array.isArray(body.items) ? body.items : []
  if (rawItems.length === 0) {
    return { error: '상품을 하나 이상 입력해 주세요.' } as const
  }
  if (rawItems.length > MAX_ITEMS) {
    return { error: `상품은 ${MAX_ITEMS}개까지 입력할 수 있습니다.` } as const
  }

  const items = []
  for (const [i, raw] of rawItems.entries()) {
    const item = (raw ?? {}) as Record<string, unknown>
    const label = `${i + 1}번째 상품`
    const name = String(item.name ?? '').trim()
    const unitPrice = Number(item.unitPrice)
    const quantity = Number(item.quantity)
    const vatType = item.vatType as VatType

    if (!name) return { error: `${label}의 상품명을 입력해 주세요.` } as const
    if (!Number.isInteger(unitPrice) || unitPrice < 0) {
      return { error: `${label}의 단가는 0 이상의 정수로 입력해 주세요.` } as const
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return { error: `${label}의 수량은 1 이상의 정수로 입력해 주세요.` } as const
    }
    if (unitPrice * quantity > MAX_AMOUNT) {
      return { error: `${label}의 금액이 너무 큽니다.` } as const
    }
    if (!VAT_TYPES.includes(vatType)) {
      return { error: `${label}의 부가세 별도/포함을 선택해 주세요.` } as const
    }
    items.push({ name, unitPrice, quantity, vatType, ...calcItem(unitPrice, quantity, vatType) })
  }

  const totals = sumAmounts(items)
  return {
    data: {
      customerId,
      items,
      supplyTotal: totals.supply,
      vatTotal: totals.vat,
      grandTotal: totals.total,
    },
  } as const
}
