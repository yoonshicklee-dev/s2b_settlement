import RowActions from '@/components/RowActions'
import { formatWon } from '@/lib/orderCalc'
import type { Order } from '@/models/Order'

const dateFormat = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

// 상품이 여러 개면 "첫 상품 외 N건"으로 줄여 보여 준다
function itemSummary(items: Order['items']) {
  if (items.length === 0) return '-'
  return items.length === 1 ? items[0].name : `${items[0].name} 외 ${items.length - 1}건`
}

// 데스크톱에서는 표로, 모바일에서는 주문서마다 카드 한 장으로 보인다 (globals.css의 .data-table)
type Props = { orders: (Order & { createdAt?: Date })[]; page: number }

export default function OrderTable({ orders, page }: Props) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>번호</th>
          <th>작성일</th>
          <th>고객 이름</th>
          <th>사업자 등록 번호</th>
          <th>상품</th>
          <th className="num">상품가액</th>
          <th className="num">부가세</th>
          <th className="num">합산 금액</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.orderId}>
            <td data-label="번호">{order.orderId}</td>
            <td data-label="작성일">{order.createdAt ? dateFormat.format(order.createdAt) : '-'}</td>
            <td data-label="고객 이름">{order.customer?.name || '-'}</td>
            <td data-label="사업자 등록 번호">{order.customer?.businessNumber || '-'}</td>
            <td data-label="상품">{itemSummary(order.items)}</td>
            <td data-label="상품가액" className="num">
              {formatWon(order.supplyTotal)}
            </td>
            <td data-label="부가세" className="num">
              {formatWon(order.vatTotal)}
            </td>
            <td data-label="합산 금액" className="num strong">
              {formatWon(order.grandTotal)}
            </td>
            <td data-label="관리">
              <RowActions
                editHref={`/orders/${order.orderId}/edit?page=${page}`}
                deleteUrl={`/api/orders/${order.orderId}`}
                target={`${order.orderId}번 주문서`}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
