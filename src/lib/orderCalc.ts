// 주문서 금액 계산: 화면(미리 보기)과 API(저장)가 같은 계산을 쓰도록 한 곳에서 정의한다

export const VAT_TYPES = ['exclusive', 'inclusive'] as const
export type VatType = (typeof VAT_TYPES)[number]

export const VAT_TYPE_LABELS: Record<VatType, string> = {
  exclusive: '부가세 별도',
  inclusive: '부가세 포함',
}

export type Amounts = { supply: number; vat: number; total: number }

// 금액은 원 단위 정수이고, 부가세의 원 미만은 버린다
export function calcItem(unitPrice: number, quantity: number, vatType: VatType): Amounts {
  const amount = unitPrice * quantity
  if (vatType === 'exclusive') {
    // 부가세 별도: 단가 × 수량이 상품가액이고, 그 10%를 부가세로 더한다
    const vat = Math.floor(amount / 10)
    return { supply: amount, vat, total: amount + vat }
  }
  // 부가세 포함: 단가 × 수량이 합산 금액이고, 상품가액 : 부가세 = 100 : 10 으로 나눈다
  // (부가세 = 합산 금액의 1/11, 상품가액 = 합산 금액 - 부가세)
  const vat = Math.floor(amount / 11)
  return { supply: amount - vat, vat, total: amount }
}

export function sumAmounts(list: Amounts[]): Amounts {
  return list.reduce(
    (sum, a) => ({ supply: sum.supply + a.supply, vat: sum.vat + a.vat, total: sum.total + a.total }),
    { supply: 0, vat: 0, total: 0 },
  )
}

export function formatWon(n: number) {
  return `${n.toLocaleString('ko-KR')}원`
}
