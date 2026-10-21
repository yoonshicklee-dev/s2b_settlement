// 등록(POST)과 수정(PUT)이 같은 규칙으로 요청 값을 읽도록 한 곳에서 정의한다
export const CUSTOMER_FIELDS = [
  'name',
  'phone',
  'mobilePhone',
  'fax',
  'managerName',
  'businessNumber',
  'address',
] as const

export type CustomerInput = Record<(typeof CUSTOMER_FIELDS)[number], string>

export function parseCustomerInput(
  body: Record<string, unknown>,
): { data: CustomerInput } | { error: string } {
  const data = Object.fromEntries(
    CUSTOMER_FIELDS.map((key) => [key, String(body[key] ?? '').trim()]),
  ) as CustomerInput
  if (!data.name) {
    return { error: '고객 이름을 입력해 주세요.' }
  }
  return { data }
}

// 주소의 고객 번호를 숫자로 바꾼다 (올바르지 않으면 null)
export function parseCustomerId(id: string) {
  const n = Number(id)
  return Number.isInteger(n) && n > 0 ? n : null
}
