import CustomerActions from '@/components/CustomerActions'
import type { Customer } from '@/models/Customer'

const COLUMNS = [
  { key: 'customerId', label: '번호' },
  { key: 'name', label: '고객 이름' },
  { key: 'account', label: '고객 계정' },
  { key: 'phone', label: '전화번호' },
  { key: 'managerName', label: '담당자 이름' },
  { key: 'businessNumber', label: '사업자 등록 번호' },
] as const

// 데스크톱에서는 표로, 모바일에서는 고객마다 카드 한 장으로 보인다 (globals.css의 .customer-table)
export default function CustomerTable({ customers, page }: { customers: Customer[]; page: number }) {
  return (
    <table className="customer-table">
      <thead>
        <tr>
          {COLUMNS.map((col) => (
            <th key={col.key}>{col.label}</th>
          ))}
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        {customers.map((customer) => (
          <tr key={customer.customerId}>
            {COLUMNS.map((col) => (
              <td key={col.key} data-label={col.label}>
                {customer[col.key] || '-'}
              </td>
            ))}
            <td data-label="관리">
              <CustomerActions customerId={customer.customerId} name={customer.name ?? ''} page={page} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
